import React, { useState, useEffect, useRef } from 'react';
import '../../assets/css/NguoiHoc.css';

import NguoiDung_Service from '../../services/NguoiDung_Service';

const TrangCaNhanNH = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const [fileAnh, setFileAnh] = useState(null);
  const [anhPreview, setAnhPreview] = useState(null);
  const [formData, setFormData] = useState({
    manguoidung: null,
    hoten: '',
    email: '',
    sodienthoai: '',
    anhdaidien: ''
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadDuLieuHoso = async () => {
      try {
        const localData = localStorage.getItem("thongTinUser");
        if (!localData) {
          if (isMounted) setLoading(false);
          return;
        }

        const user = JSON.parse(localData);
        const thongTinCapNhat = await NguoiDung_Service.layChiTietNguoiDung(user.manguoidung);

        if (isMounted) {
          const mergedData = {
            manguoidung: user.manguoidung,
            hoten: thongTinCapNhat?.name || user.hoten || '',
            email: thongTinCapNhat?.email || user.email || '',
            sodienthoai: thongTinCapNhat?.phone || user.sodienthoai || '',
            anhdaidien: thongTinCapNhat?.avatar || user.anhdaidien || ''
          };

          setFormData(mergedData);
          setOriginalData(mergedData);
        }
      } catch (error) {
        console.error("Lỗi tải thông tin hồ sơ Người học:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDuLieuHoso();
    return () => { isMounted = false; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKichHoatChonFile = () => fileInputRef.current.click();

  const xuLyChonAnh = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAnh(file);
      setAnhPreview(URL.createObjectURL(file));
    }
  };

  const uploadAnhLenCloudinary = async (file) => {
    const formCloudData = new FormData();
    formCloudData.append("file", file);
    formCloudData.append("upload_preset", "g3rxs97p");
    const cloudName = "dg9s75xsf";

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formCloudData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalAvatarUrl = formData.anhdaidien;

      if (fileAnh) {
        const uploadedUrl = await uploadAnhLenCloudinary(fileAnh);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        } else {
          throw new Error("Tải ảnh lên Cloudinary thất bại!");
        }
      }

      const isChanged =
        formData.hoten !== originalData.hoten ||
        formData.sodienthoai !== originalData.sodienthoai ||
        finalAvatarUrl !== originalData.anhdaidien;

      if (!isChanged) {
        alert("Bạn chưa thay đổi bất kỳ thông tin nào!");
        setSaving(false);
        return;
      }

      const payloadNguoiDung = {
        hoten: formData.hoten,
        sodienthoai: formData.sodienthoai,
        anhdaidien: finalAvatarUrl || "string"
      };

      await NguoiDung_Service.capNhatNguoiDung(formData.manguoidung, payloadNguoiDung);

      const userLocal = JSON.parse(localStorage.getItem("thongTinUser")) || {};
      userLocal.hoten = formData.hoten;
      userLocal.sodienthoai = formData.sodienthoai;
      userLocal.anhdaidien = finalAvatarUrl;
      localStorage.setItem("thongTinUser", JSON.stringify(userLocal));

      alert("Cập nhật thông tin hồ sơ thành công!");
      window.location.reload();

    } catch (error) {
      alert(error.message || "Xảy ra lỗi trong quá trình thực hiện lưu hồ sơ!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#0284c7', fontWeight: 'bold' }}>Đang tải dữ liệu hồ sơ...</div>;
  }

  const anhHienThi = anhPreview || formData.anhdaidien;

  return (
    <div className="nh-profile-card">
      <div className="nh-profile-header">
        <h2 className="nh-profile-title">Hồ sơ Cá nhân</h2>
        <p className="nh-profile-subtitle">Quản lý thông tin định danh và phương thức liên hệ của bạn.</p>
      </div>

      <div className="nh-profile-body">
        <form onSubmit={handleSaveProfile} className="nh-profile-form">

          {/* CỘT TRÁI: ẢNH ĐẠI DIỆN */}
          <div className="nh-avatar-col">
            <div className="nh-avatar-wrapper">
              {anhHienThi && anhHienThi.trim() !== '' && anhHienThi !== 'null' && anhHienThi !== 'string' ? (
                <img
                  src={anhHienThi}
                  alt="Avatar"
                  className="nh-avatar-large"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${formData.hoten || 'NH'}&background=0284c7&color=fff&size=150`; }}
                />
              ) : (
                <div className="nh-avatar-placeholder-large">
                  {formData.hoten?.charAt(0).toUpperCase() || 'NH'}
                </div>
              )}

              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={xuLyChonAnh} />
            </div>

            <button type="button" onClick={handleKichHoatChonFile} className="btn-nh-outline">
              Đổi ảnh đại diện
            </button>
            <span className="nh-avatar-hint">Định dạng: JPG, PNG. Tối đa 2MB.</span>
          </div>

          {/* CỘT PHẢI: FORM NHẬP LIỆU */}
          <div className="nh-form-col">
            <div className="nh-form-group">
              <label className="nh-form-label">Họ và tên</label>
              <input
                type="text"
                name="hoten"
                value={formData.hoten}
                onChange={handleInputChange}
                required
                className="nh-input"
                placeholder="Nhập họ và tên đầy đủ"
              />
            </div>

            <div className="nh-form-group">
              <label className="nh-form-label">Email đăng nhập</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="nh-input"
                title="Email không thể thay đổi"
              />
            </div>

            <div className="nh-form-group last">
              <label className="nh-form-label">Số điện thoại liên hệ</label>
              <input
                type="text"
                name="sodienthoai"
                value={formData.sodienthoai}
                onChange={handleInputChange}
                required
                className="nh-input"
                placeholder="VD: 0987654321"
              />
            </div>

            <button type="submit" disabled={saving} className="btn-nh-submit">
              {saving ? 'Đang lưu dữ liệu...' : 'Lưu Thay Đổi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TrangCaNhanNH;
