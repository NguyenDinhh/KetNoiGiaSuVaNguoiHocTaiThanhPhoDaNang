import React, { useState, useEffect, useRef } from 'react';
import '../../assets/css/GiaSu.css';

import NguoiDung_Service from '../../services/NguoiDung_Service';
import GiaSu_Service from '../../services/GiaSu_Service';
import GiaSu_BangCap_Service from '../../services/GiaSu_BangCap_Service';
import BangCap_Service from '../../services/BangCap_Service';

// IMPORT THÊM CÁC SERVICE ĐỂ TRUY VẤN MÔN HỌC THEO BẰNG CẤP
import MonHoc_Service from '../../services/MonHoc_Service';
import BangCap_MonHoc_Service from '../../services/BangCap_MonHoc_Service';

const TrangCaNhan = () => {
  const [tabHienTai, setTabHienTai] = useState('thong_tin');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const cccdMatTruocRef = useRef(null);
  const cccdMatSauRef = useRef(null);

  // STATE: THÔNG TIN GIA SƯ & NGƯỜI DÙNG
  const [fileAnh, setFileAnh] = useState(null);
  const [anhPreview, setAnhPreview] = useState(null);
  const [fileCCCDMatTruoc, setFileCCCDMatTruoc] = useState(null);
  const [cccdMatTruocPreview, setCccdMatTruocPreview] = useState(null);
  const [fileCCCDMatSau, setFileCCCDMatSau] = useState(null);
  const [cccdMatSauPreview, setCccdMatSauPreview] = useState(null);
  const [formData, setFormData] = useState({
    manguoidung: null,
    magiasu: null,
    hoten: '', email: '', sodienthoai: '', anhdaidien: '',
    namsinh: '', gioitinh: 0, gioithieubanthan: '',
    cccdmattruoc: '', cccdmatsau: '', trangthaiduyet: 0,
    lydotuchoi: ''
  });
  const [originalData, setOriginalData] = useState({});

  // STATE: BẰNG CẤP & CHUYÊN MÔN MÔN HỌC
  const [danhSachDanhMucBangCap, setDanhSachDanhMucBangCap] = useState([]);
  const [danhSachBangCap, setDanhSachBangCap] = useState([]);

  // Các state hỗ trợ gộp/tra cứu môn học
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachBangCapMonHoc, setDanhSachBangCapMonHoc] = useState([]);
  const [monHocFormThemMoi, setMonHocFormThemMoi] = useState([]); // Hiện môn khi đang chọn select form thêm mới
  const [chiTietCardMo, setChiTietCardMo] = useState(null); // Quản lý đóng/mở modal xem chi tiết của card bằng cấp cũ

  const [isModalBangCapOpen, setIsModalBangCapOpen] = useState(false);
  const [isUploadingBangCap, setIsUploadingBangCap] = useState(false);
  const [fileAnhBangCap, setFileAnhBangCap] = useState(null);
  const [anhBangCapPreview, setAnhBangCapPreview] = useState(null);
  const [formBangCap, setFormBangCap] = useState({
    mabangcap: '', chuyennganh: '', namtotnghiep: '', cosodaotao: ''
  });

  // ================= TẢI DỮ LIỆU BAN ĐẦU (GỘP THÊM DANH MỤC MÔN HỌC) =================
  useEffect(() => {
    let isMounted = true;

    const loadDuLieuHoso = async () => {
      try {
        // Tải toàn bộ danh mục hệ thống trước
        try {
          const [dmBC, dmMH, bcMH] = await Promise.all([
            BangCap_Service.layDanhSachBangCap().catch(() => []),
            MonHoc_Service.layDanhSachMonHoc().catch(() => []),
            BangCap_MonHoc_Service.layDanhSach().catch(() => []) // <--- Đã sửa thành layDanhSach()
          ]);

          if (isMounted) {
            setDanhSachDanhMucBangCap(dmBC || []);
            setDanhSachMonHoc(dmMH || []);
            setDanhSachBangCapMonHoc(bcMH || []);
          }
        } catch (dmError) {
          console.error("Lỗi tải danh mục gốc hệ thống:", dmError);
        }

        const localData = localStorage.getItem("thongTinUser");
        if (!localData) {
          if (isMounted) setLoading(false);
          return;
        }

        const user = JSON.parse(localData);
        let giasuData = null;

        try {
          giasuData = await GiaSu_Service.layChiTietGiaSuvoimanguoidung(user.manguoidung);
        } catch (apiError) {
          console.warn("Chưa có hồ sơ bảng Gia Sư");
        }

        if (isMounted) {
          const mergedData = {
            manguoidung: user.manguoidung,
            magiasu: giasuData?.magiasu || null,
            hoten: user.hoten || '',
            email: user.email || '',
            sodienthoai: user.sodienthoai || '',
            anhdaidien: user.anhdaidien || '',
            namsinh: giasuData?.namsinh || '',
            gioitinh: giasuData?.gioitinh ?? 0,
            gioithieubanthan: giasuData?.gioithieubanthan || '',
            cccdmattruoc: giasuData?.cccdmattruoc || '',
            cccdmatsau: giasuData?.cccdmatsau || '',
            trangthaiduyet: giasuData?.trangthaiduyet ?? 0,
            lydotuchoi: giasuData?.lydotuchoi || ''
          };

          setFormData(mergedData);
          setOriginalData(mergedData);

          if (giasuData?.magiasu) {
            fetchDanhSachBangCap(giasuData.magiasu);
          }
        }
      } catch (error) {
        console.error("Lỗi tổng tải thông tin hồ sơ:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDuLieuHoso();
    return () => { isMounted = false; };
  }, []);

  // ================= LUỒNG TRA CỨU ĐỘNG CÁC MÔN HỌC ĐƯỢC PHÉP DẠY =================
  const layDanhSachMonHocChoMaBC = (maBC) => {
    if (!maBC) return [];
    const mapping = danhSachBangCapMonHoc.filter(item => String(item.mabangcap) === String(maBC));
    return mapping.map(mapItem => {
      const mon = danhSachMonHoc.find(mh => String(mh.mamonhoc) === String(mapItem.mamonhoc));
      return mon ? mon.tenmonhoc : null;
    }).filter(Boolean);
  };

  // Tự động cập nhật môn học gợi ý khi Gia sư đổi ô select ở Modal thêm mới
  useEffect(() => {
    if (!formBangCap.mabangcap) {
      setMonHocFormThemMoi([]);
      return;
    }
    setMonHocFormThemMoi(layDanhSachMonHocChoMaBC(formBangCap.mabangcap));
  }, [formBangCap.mabangcap, danhSachBangCapMonHoc, danhSachMonHoc]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'namsinh' || name === 'gioitinh') ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  // ================= XỬ LÝ ẢNH & UPLOAD CLOUDINARY =================
  const handleKichHoatChonFile = () => fileInputRef.current.click();

  const xuLyChonAnh = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAnh(file);
      setAnhPreview(URL.createObjectURL(file));
    }
  };

  const xuLyChonCCCDMatTruoc = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileCCCDMatTruoc(file);
      setCccdMatTruocPreview(URL.createObjectURL(file));
    }
  };

  const xuLyChonCCCDMatSau = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileCCCDMatSau(file);
      setCccdMatSauPreview(URL.createObjectURL(file));
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

  // ================= LƯU HỒ SƠ GIA SƯ =================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalAvatarUrl = formData.anhdaidien;
      let finalCCCDMatTruoc = formData.cccdmattruoc;
      let finalCCCDMatSau = formData.cccdmatsau;

      // Upload ảnh đại diện nếu có
      if (fileAnh) {
        const uploadedUrl = await uploadAnhLenCloudinary(fileAnh);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        } else {
          throw new Error("Tải ảnh đại diện lên Cloudinary thất bại!");
        }
      }

      // Upload CCCD mặt trước nếu có
      if (fileCCCDMatTruoc) {
        const uploadedUrl = await uploadAnhLenCloudinary(fileCCCDMatTruoc);
        if (uploadedUrl) {
          finalCCCDMatTruoc = uploadedUrl;
        } else {
          throw new Error("Tải CCCD mặt trước lên Cloudinary thất bại!");
        }
      }

      // Upload CCCD mặt sau nếu có
      if (fileCCCDMatSau) {
        const uploadedUrl = await uploadAnhLenCloudinary(fileCCCDMatSau);
        if (uploadedUrl) {
          finalCCCDMatSau = uploadedUrl;
        } else {
          throw new Error("Tải CCCD mặt sau lên Cloudinary thất bại!");
        }
      }

      const isNguoiDungChanged =
        formData.hoten !== originalData.hoten ||
        formData.sodienthoai !== originalData.sodienthoai ||
        finalAvatarUrl !== originalData.anhdaidien;

      const isGiaSuChanged =
        formData.namsinh !== originalData.namsinh ||
        formData.gioitinh !== originalData.gioitinh ||
        formData.gioithieubanthan !== originalData.gioithieubanthan ||
        finalCCCDMatTruoc !== originalData.cccdmattruoc ||
        finalCCCDMatSau !== originalData.cccdmatsau;

      if (!isNguoiDungChanged && !isGiaSuChanged) {
        alert("Bạn chưa thay đổi bất kỳ thông tin nào!");
        setSaving(false);
        return;
      }

      if (isNguoiDungChanged) {
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
      }

      if (isGiaSuChanged) {
        const payloadGiaSu = {
          manguoidung: formData.manguoidung,
          cccdmattruoc: finalCCCDMatTruoc || "string",
          cccdmatsau: finalCCCDMatSau || "string",
          namsinh: Number(formData.namsinh),
          gioitinh: Number(formData.gioitinh),
          gioithieubanthan: formData.gioithieubanthan || "",
          trangthaiduyet: Number(formData.trangthaiduyet)
        };

        if (formData.magiasu) {
          await GiaSu_Service.suaGiaSu(formData.magiasu, payloadGiaSu);
        } else {
          const ketQuaThem = await GiaSu_Service.themGiaSu(payloadGiaSu);
          if (ketQuaThem?.data?.magiasu) {
            formData.magiasu = ketQuaThem.data.magiasu;
          }
        }
      }

      alert("Cập nhật thông tin hồ sơ thành công!");
      window.location.reload();

    } catch (error) {
      alert(error.message || "Xảy ra lỗi trong quá trình thực hiện lưu hồ sơ!");
    } finally {
      setSaving(false);
    }
  };

  // ================= YÊU CẦU DUYỆT LẠI =================
  const handleYeuCauDuyetLai = async () => {
    if (!formData.magiasu) {
      alert("Không tìm thấy thông tin gia sư!");
      return;
    }

    if (window.confirm("Bạn có muốn gửi lại yêu cầu duyệt hồ sơ không?")) {
      try {
        const payloadDuyetLai = {
          trangthaiduyet: 0,  // Đặt lại trạng thái chờ duyệt
          lydotuchoi: null    // Xóa lý do từ chối
        };
        await GiaSu_Service.suaGiaSu(formData.magiasu, payloadDuyetLai);
        alert("Đã gửi yêu cầu duyệt lại thành công! Vui lòng chờ quản trị viên xem xét.");
        window.location.reload();
      } catch (error) {
        alert("Lỗi khi gửi yêu cầu duyệt lại: " + error.message);
      }
    }
  };

  const fetchDanhSachBangCap = async (maGiaSu) => {
    if (!maGiaSu) return;
    try {
      const tatCaBangCap = await GiaSu_BangCap_Service.layDanhSachGiaSuBangCap();
      const bangCapCuaToi = tatCaBangCap.filter(bc => String(bc.magiasu) === String(maGiaSu));
      setDanhSachBangCap(bangCapCuaToi);
    } catch (error) {
      console.error("Lỗi tải bằng cấp gia sư:", error);
    }
  };

  const timTenBangCapGoc = (maBC) => {
    const timThay = danhSachDanhMucBangCap.find(b => String(b.mabangcap) === String(maBC));
    return timThay ? timThay.tenbangcap : "Bằng cấp / Chứng chỉ";
  };

  const handleMoModalThemBangCap = () => {
    if (!formData.magiasu) {
      alert("Vui lòng nhập và 'Lưu hồ sơ Gia sư' (Tab Thông tin) trước khi thêm bằng cấp!");
      return;
    }
    setFormBangCap({ mabangcap: '', chuyennganh: '', namtotnghiep: '', cosodaotao: '' });
    setFileAnhBangCap(null);
    setAnhBangCapPreview(null);
    setIsModalBangCapOpen(true);
  };

  const xuLyChonAnhBangCap = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAnhBangCap(file);
      setAnhBangCapPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitBangCap = async (e) => {
    e.preventDefault();
    if (!fileAnhBangCap) {
      alert("Vui lòng tải lên hình ảnh minh chứng Bằng cấp/Chứng chỉ!");
      return;
    }

    setIsUploadingBangCap(true);
    try {
      console.log("DEBUG Frontend: Bắt đầu upload ảnh bằng cấp...");
      const uploadedUrl = await uploadAnhLenCloudinary(fileAnhBangCap);
      console.log("DEBUG Frontend: Upload ảnh thành công:", uploadedUrl);
      
      if (!uploadedUrl) throw new Error("Lỗi khi tải ảnh lên Cloud!");

      const payloadThem = {
        magiasu: formData.magiasu,
        mabangcap: formBangCap.mabangcap,
        chuyennganh: formBangCap.chuyennganh,
        namtotnghiep: Number(formBangCap.namtotnghiep),
        cosodaotao: formBangCap.cosodaotao,
        anhbangcap: uploadedUrl,
        trangthaiduyet: 0
      };
      console.log("DEBUG Frontend: Payload gửi đi:", payloadThem);

      const response = await GiaSu_BangCap_Service.themGiaSuBangCapMoi(payloadThem);
      console.log("DEBUG Frontend: Response nhận về:", response);

      alert("Đã thêm bằng cấp thành công! Vui lòng chờ Admin duyệt.");
      setIsModalBangCapOpen(false);
      fetchDanhSachBangCap(formData.magiasu);

    } catch (error) {
      console.error("LỖI Frontend:", error);
      alert("Thêm bằng cấp thất bại: " + error.message);
    } finally {
      setIsUploadingBangCap(false);
    }
  };

  const handleDeleteBangCap = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa Bằng cấp này không?")) {
      try {
        await GiaSu_BangCap_Service.xoaGiaSuBangCap(id);
        fetchDanhSachBangCap(formData.magiasu);
      } catch (err) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  // ================= GIAO DIỆN CHÍNH =================
  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#005088', fontWeight: 'bold' }}>Đang tải dữ liệu hồ sơ...</div>;
  }

  const anhHienThi = anhPreview || formData.anhdaidien;

  return (
    <div className="tcn-container">
      <div className="tcn-header">
        <h2>Hồ sơ Gia Sư</h2>
        <div className="tcn-tabs">
          <button type="button" onClick={() => setTabHienTai('thong_tin')} className={`tcn-tab-btn ${tabHienTai === 'thong_tin' ? 'active' : ''}`}>Thông tin Gia sư</button>
          <button type="button" onClick={() => setTabHienTai('bang_cap')} className={`tcn-tab-btn ${tabHienTai === 'bang_cap' ? 'active' : ''}`}>Thông tin bằng cấp</button>
        </div>
      </div>

      {/* ================= TAB 1: THÔNG TIN GIA SƯ ================= */}
      {tabHienTai === 'thong_tin' && (
        <form onSubmit={handleSaveProfile} className="tcn-form">
          {/* HIỂN THỊ TRẠNG THÁI DUYỆT */}
          <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '8px', backgroundColor: formData.trangthaiduyet === 1 ? '#d1fae5' : formData.trangthaiduyet === 2 ? '#fee2e2' : '#fef3c7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {formData.trangthaiduyet === 1 ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#059669' }}>check_circle</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#059669', fontSize: '18px' }}>✓ Hồ sơ đã được duyệt</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#047857', fontSize: '14px' }}>Bạn có thể nhận lớp và giảng dạy</p>
                  </div>
                </>
              ) : formData.trangthaiduyet === 2 ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#dc2626' }}>cancel</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#dc2626', fontSize: '18px' }}>✕ Hồ sơ bị từ chối</h3>
                    {formData.lydotuchoi && (
                      <p style={{ margin: '4px 0 0 0', color: '#991b1b', fontSize: '14px', fontWeight: 600 }}>
                        Lý do: {formData.lydotuchoi}
                      </p>
                    )}
                    <p style={{ margin: '8px 0 0 0', color: '#7f1d1d', fontSize: '13px' }}>
                      Vui lòng cập nhật lại CCCD hoặc thông tin và gửi yêu cầu duyệt lại
                    </p>
                    <button 
                      type="button" 
                      onClick={handleYeuCauDuyetLai}
                      style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Gửi yêu cầu duyệt lại
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#d97706' }}>schedule</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#d97706', fontSize: '18px' }}>⏳ Đang chờ duyệt</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#92400e', fontSize: '14px' }}>Hồ sơ của bạn đang được quản trị viên xem xét</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="tcn-top-section">
            <div className="tcn-avatar-col">
              {anhHienThi && anhHienThi.trim() !== '' && anhHienThi !== 'null' && anhHienThi !== 'string' ? (
                <img
                  src={anhHienThi} alt="Avatar" className="tcn-avatar-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${formData.hoten || 'GS'}&background=005088&color=fff&size=120`; }}
                />
              ) : (
                <div className="tcn-avatar-placeholder">
                  {formData.hoten?.charAt(0).toUpperCase() || 'GS'}
                </div>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={xuLyChonAnh} />
              <button type="button" onClick={handleKichHoatChonFile} className="btn-outline">
                Đổi ảnh đại diện
              </button>
            </div>

            <div className="tcn-form-col">
              <div className="tcn-row">
                <div className="tcn-form-group">
                  <label>Họ và tên</label>
                  <input type="text" name="hoten" value={formData.hoten} onChange={handleInputChange} className="tcn-input" required />
                </div>
                <div className="tcn-form-group">
                  <label>Số điện thoại</label>
                  <input type="text" name="sodienthoai" value={formData.sodienthoai} onChange={handleInputChange} className="tcn-input" required />
                </div>
              </div>

              <div className="tcn-row">
                <div className="tcn-form-group">
                  <label>Email đăng nhập</label>
                  <input type="email" value={formData.email} disabled className="tcn-input" />
                </div>
                <div className="tcn-form-group">
                  <label>Năm sinh</label>
                  <input type="number" name="namsinh" value={formData.namsinh} onChange={handleInputChange} className="tcn-input" placeholder="VD: 2002" required />
                </div>
                <div className="tcn-form-group">
                  <label>Giới tính</label>
                  <select name="gioitinh" value={formData.gioitinh} onChange={handleInputChange} className="tcn-input">
                    <option value={0}>Nam</option>
                    <option value={1}>Nữ</option>
                  </select>
                </div>
              </div>

              <div className="tcn-form-group">
                <label>Giới thiệu bản thân / Kinh nghiệm</label>
                <textarea
                  name="gioithieubanthan" value={formData.gioithieubanthan} onChange={handleInputChange}
                  rows="5" className="tcn-input" placeholder="Giới thiệu đôi nét về bản thân và phương pháp giảng dạy..." required
                ></textarea>
              </div>

              {/* PHẦN CẬP NHẬT CCCD */}
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '16px' }}>📝 Căn cước công dân (CCCD)</h4>
                
                <div className="tcn-row" style={{ gap: '16px' }}>
                  {/* CCCD Mặt Trước */}
                  <div className="tcn-form-group" style={{ flex: 1 }}>
                    <label>CCCD Mặt trước</label>
                    <div style={{ position: 'relative', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'white' }} onClick={() => cccdMatTruocRef.current.click()}>
                      {(cccdMatTruocPreview || formData.cccdmattruoc) && (cccdMatTruocPreview || formData.cccdmattruoc) !== 'string' ? (
                        <img 
                          src={cccdMatTruocPreview || formData.cccdmattruoc} 
                          alt="CCCD mặt trước" 
                          style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      ) : (
                        <div style={{ padding: '20px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>badge</span>
                          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>Nhấn để tải CCCD mặt trước</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" ref={cccdMatTruocRef} style={{ display: 'none' }} onChange={xuLyChonCCCDMatTruoc} />
                  </div>

                  {/* CCCD Mặt Sau */}
                  <div className="tcn-form-group" style={{ flex: 1 }}>
                    <label>CCCD Mặt sau</label>
                    <div style={{ position: 'relative', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'white' }} onClick={() => cccdMatSauRef.current.click()}>
                      {(cccdMatSauPreview || formData.cccdmatsau) && (cccdMatSauPreview || formData.cccdmatsau) !== 'string' ? (
                        <img 
                          src={cccdMatSauPreview || formData.cccdmatsau} 
                          alt="CCCD mặt sau" 
                          style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      ) : (
                        <div style={{ padding: '20px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>badge</span>
                          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>Nhấn để tải CCCD mặt sau</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" ref={cccdMatSauRef} style={{ display: 'none' }} onChange={xuLyChonCCCDMatSau} />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? 'Đang tải dữ liệu và lưu hồ sơ...' : 'Lưu hồ sơ Gia sư'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 2: BẰNG CẤP DẠNG CARD ================= */}
      {tabHienTai === 'bang_cap' && (
        <div className="bc-tab-wrapper">
          <div className="bc-header-container">
            <div>
              <h3 className="bc-header-title">Hồ sơ Bằng cấp & Chứng chỉ</h3>
              <p className="bc-header-subtitle">Bằng cấp giúp hồ sơ của bạn uy tín hơn trong mắt Học viên.</p>
            </div>
            <button type="button" onClick={handleMoModalThemBangCap} className="bc-btn-add">
              + Thêm bằng cấp mới
            </button>
          </div>

          <div className="bc-card-grid">
            {danhSachBangCap.length === 0 ? (
              <div className="bc-empty-state">
                <p>Bạn chưa có bằng cấp nào. Hãy thêm để tăng độ tin cậy nhé!</p>
              </div>
            ) : (
              danhSachBangCap.map((item) => (
                <div key={item.mabangcapgiasu} className="bc-card">
                  <div className="bc-card-img-container">
                    <img
                      src={item.anhbangcap} alt="Bằng cấp" className="bc-card-img"
                      onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Loi+Hien+Thi+Anh'; }}
                    />
                  </div>

                  <div className="bc-card-body">
                    <h4 className="bc-card-title">{item.chuyennganh}</h4>
                    <p className="bc-card-text"><strong>Loại bằng:</strong> {timTenBangCapGoc(item.mabangcap)}</p>
                    <p className="bc-card-text"><strong>Trường:</strong> {item.cosodaotao}</p>
                    <p className="bc-card-text"><strong>Năm TN:</strong> {item.namtotnghiep}</p>

                    <div className="bc-card-footer">
                      {item.trangthaiduyet === 1 ? (
                        <span className="bc-badge-status bc-badge-approved">✓ Đã duyệt</span>
                      ) : item.trangthaiduyet === 2 ? (
                        <span className="bc-badge-status bc-badge-rejected">✕ Từ chối</span>
                      ) : (
                        <span className="bc-badge-status bc-badge-pending">⌛ Chờ duyệt</span>
                      )}

                      {/* KHU VỰC NÚT ĐIỀU HƯỚNG MỚI NÂNG CẤP */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* NÚT XEM CHI TIẾT MÔN CÓ THỂ DẠY */}
                        <button
                          type="button"
                          onClick={() => setChiTietCardMo(item)}
                          style={{ background: 'none', border: 'none', color: '#005088', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                          title="Xem chi tiết môn học được phép dạy"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>visibility</span>
                        </button>

                        <button onClick={() => handleDeleteBangCap(item.mabangcapgiasu)} className="bc-delete-btn" title="Xóa bằng cấp">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL XEM CHI TIẾT BẰNG CẤP ĐÃ THÊM ================= */}
      {chiTietCardMo && (
        <div className="bc-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="bc-modal-content" style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div className="bc-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Chi tiết môn giảng dạy</h3>
              <button type="button" onClick={() => setChiTietCardMo(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#334155' }}>
              <p style={{ margin: 0 }}><strong>Loại chứng nhận:</strong> {timTenBangCapGoc(chiTietCardMo.mabangcap)}</p>
              <p style={{ margin: 0 }}><strong>Chuyên ngành học:</strong> {chiTietCardMo.chuyennganh}</p>
              <p style={{ margin: 0 }}><strong>Cơ sở đào tạo:</strong> {chiTietCardMo.cosodaotao}</p>
              <p style={{ margin: 0 }}><strong>Năm cấp bằng:</strong> {chiTietCardMo.namtotnghiep}</p>

              {/* VÙNG ĐỔ ĐỘNG CÁC MÔN HỌC THEO BẰNG CẤP */}
              <div style={{ marginTop: '10px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '8px' }}>📚 Các môn bạn đủ điều kiện nhận lớp:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {layDanhSachMonHocChoMaBC(chiTietCardMo.mabangcap).length > 0 ? (
                    layDanhSachMonHocChoMaBC(chiTietCardMo.mabangcap).map((mon, index) => (
                      <span key={index} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        {mon}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Chưa có môn học tương ứng trong danh mục hệ thống.</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '6px' }}>📷 Hình ảnh minh chứng:</span>
                <img
                  src={chiTietCardMo.anhbangcap}
                  alt="Ảnh bằng cấp"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Khong+Tai+Duoc+Anh'; }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM BẰNG CẤP MỚI ================= */}
      {isModalBangCapOpen && (
        <div className="bc-modal-overlay">
          <div className="bc-modal-content">
            <div className="bc-modal-header">
              <h3>Thêm Bằng cấp / Chứng chỉ</h3>
              <button type="button" onClick={() => setIsModalBangCapOpen(false)} className="bc-close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmitBangCap} className="tcn-form-col">
              <div className="tcn-form-group">
                <label>Loại chứng nhận / Bằng cấp gốc</label>
                <select
                  className="tcn-input"
                  value={formBangCap.mabangcap}
                  onChange={(e) => setFormBangCap({...formBangCap, mabangcap: e.target.value})}
                  required
                >
                  <option value="">-- Chọn loại bằng cấp --</option>
                  {danhSachDanhMucBangCap.map((bc) => (
                    <option key={bc.mabangcap} value={bc.mabangcap}>
                      {bc.tenbangcap}
                    </option>
                  ))}
                </select>

                {/* GIAO DIỆN HIỂN THỊ CÁC MÔN HỌC KHI ĐANG CHỌN FORM THÊM MỚI */}
                {monHocFormThemMoi.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 'bold' }}>📚 Bằng cấp này cho phép bạn dạy các môn:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {monHocFormThemMoi.map((mon, idx) => (
                        <span key={idx} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                          {mon}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="tcn-row">
                <div className="tcn-form-group">
                  <label>Tên Ngành học cụ thể / Chứng chỉ</label>
                  <input type="text" className="tcn-input" value={formBangCap.chuyennganh} onChange={(e) => setFormBangCap({...formBangCap, chuyennganh: e.target.value})} required placeholder="VD: Sư phạm Toán, IELTS 7.5,..." />
                </div>
                <div className="tcn-form-group">
                  <label>Năm tốt nghiệp / Năm cấp</label>
                  <input type="number" className="tcn-input" value={formBangCap.namtotnghiep} onChange={(e) => setFormBangCap({...formBangCap, namtotnghiep: e.target.value})} required placeholder="VD: 2022" />
                </div>
              </div>

              <div className="tcn-form-group">
                <label>Nơi đào tạo / Cơ sở cấp bằng</label>
                <input type="text" className="tcn-input" value={formBangCap.cosodaotao} onChange={(e) => setFormBangCap({...formBangCap, cosodaotao: e.target.value})} required placeholder="VD: Đại học Sư Phạm Đà Nẵng, British Council..." />
              </div>

              <div className="tcn-form-group">
                <label>Ảnh chụp minh chứng Bằng cấp/Chứng chỉ</label>
                <div className="bc-upload-zone">
                  {anhBangCapPreview ? (
                    <div>
                      <img src={anhBangCapPreview} alt="Preview" className="bc-preview-img" />
                      <div>
                        <button type="button" onClick={() => { setFileAnhBangCap(null); setAnhBangCapPreview(null); }} className="bc-btn-change-img">Đổi ảnh khác</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined bc-upload-icon">cloud_upload</span>
                      <p className="bc-upload-text">Nhấn để tải lên ảnh mặt trước</p>
                      <input type="file" accept="image/*" onChange={xuLyChonAnhBangCap} required />
                    </div>
                  )}
                </div>
              </div>

              <div className="bc-modal-footer">
                <button type="button" onClick={() => setIsModalBangCapOpen(false)} className="btn-outline">Hủy</button>
                <button type="submit" className="btn-submit" disabled={isUploadingBangCap}>
                  {isUploadingBangCap ? 'Đang lưu hệ thống...' : 'Lưu Bằng Cấp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrangCaNhan;
