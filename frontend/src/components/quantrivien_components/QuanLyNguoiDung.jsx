import React, { useState, useEffect } from 'react';
import NguoiDung_Service from '../../services/NguoiDung_Service';

const UserManagementTable = () => {
  const [danhSachNguoiDung, setDanhSachNguoiDung] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const [thongKe, setThongKe] = useState({
    tongSo: 0, quanTriVien: 0, giaSu: 0, nguoiHoc: 0
  });

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  // ================= STATE CHO MODAL THÊM/SỬA =================
  const [hienThiForm, setHienThiForm] = useState(false);
  const [cheDoSua, setCheDoSua] = useState(false);
  const [maNguoiDungDangSua, setMaNguoiDungDangSua] = useState(null);
  const [fileAnh, setFileAnh] = useState(null);
  const [anhPreview, setAnhPreview] = useState("");

  const [formDuLieu, setFormDuLieu] = useState({
    hoten: "",
    vaitro: 2,
    sodienthoai: "",
    email: "",
    matkhau: "",
    anhdaidien: ""
  });

  // ================= KHỞI TẠO DỮ LIỆU =================
  useEffect(() => {
    taiDanhSachNguoiDung();
    taiThongKe();
  }, []);

  const taiDanhSachNguoiDung = async () => {
    setDangTai(true);
    try {
      // Data lúc này đã được Service của ông đổi thành name, avatar, role, phone...
      const duLieu = await NguoiDung_Service.layDanhSachNguoiDung();
      setDanhSachNguoiDung(duLieu || []);
    } catch (loi) {
      console.error(loi);
    } finally {
      setDangTai(false);
    }
  };

  const taiThongKe = async () => {
    try {
      const soLieu = await NguoiDung_Service.layThongKeNguoiDung();
      setThongKe(soLieu || { tongSo: 0, quanTriVien: 0, giaSu: 0, nguoiHoc: 0 });
    } catch (loi) {
      console.error("Không lấy được số liệu thống kê:", loi);
    }
  };

  // ================= XỬ LÝ KHÓA / MỞ KHÓA =================
  const xuLyDoiTrangThai = async (maNguoiDung, trangThaiHienTai) => {
    const dangHoatDong = trangThaiHienTai === 1;
    const thongBaoXacNhan = dangHoatDong
      ? "Bạn có chắc chắn muốn KHÓA tài khoản này?"
      : "Bạn muốn MỞ KHÓA cho tài khoản này?";

    if (window.confirm(thongBaoXacNhan)) {
      try {
        // Gọi hàm chuẩn trong Service của ông
        await NguoiDung_Service.khoaMoKhoaNguoiDung(maNguoiDung);

        const trangThaiMoi = dangHoatDong ? 0 : 1;
        setDanhSachNguoiDung(danhSachNguoiDung.map(nd =>
          nd.id === maNguoiDung ? { ...nd, status: trangThaiMoi } : nd
        ));

        alert(dangHoatDong ? "Đã khóa tài khoản!" : "Đã mở khóa!");
      } catch (loi) {
        alert("Lỗi khi cập nhật trạng thái!");
      }
    }
  };

  // ================= CHUẨN BỊ FORM THÊM MỚI =================
  const moFormThemMoi = () => {
    setCheDoSua(false);
    setMaNguoiDungDangSua(null);
    setFileAnh(null);
    setAnhPreview("");
    setFormDuLieu({ hoten: "", vaitro: 2, sodienthoai: "", email: "", matkhau: "", anhdaidien: "" });
    setHienThiForm(true);
  };

  // ================= CHUẨN BỊ FORM SỬA =================
  const moFormSua = (nguoiDung) => {
    setCheDoSua(true);
    setMaNguoiDungDangSua(nguoiDung.id);
    setFileAnh(null);

    // Xử lý hiển thị lại ảnh cũ (kiểm tra nếu nó dài hơn 1 ký tự thì mới là link thật)
    const linkAnhCu = nguoiDung.avatar?.length > 1 ? nguoiDung.avatar : "";
    setAnhPreview(linkAnhCu);

    // Dịch ngược từ chữ (role) sang số (vaitro) để đẩy lên form
    let vaiTroSo = 2;
    if (nguoiDung.role === "Quản trị viên") vaiTroSo = 0;
    else if (nguoiDung.role === "Gia sư") vaiTroSo = 1;

    setFormDuLieu({
      hoten: nguoiDung.name,
      vaitro: vaiTroSo,
      sodienthoai: nguoiDung.phone,
      email: nguoiDung.email,
      matkhau: "", // Bỏ trống
      anhdaidien: linkAnhCu
    });

    setHienThiForm(true);
  };

  // ================= XỬ LÝ NHẬP FORM & FILE ẢNH =================
  const xuLyNhapLieu = (suKien) => {
    const { name, value } = suKien.target;
    setFormDuLieu({ ...formDuLieu, [name]: name === "vaitro" ? parseInt(value) : value });
  };

  const xuLyChonAnh = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAnh(file);
      setAnhPreview(URL.createObjectURL(file));
    }
  };

  // ================= HÀM UPLOAD LÊN CLOUDINARY =================
  const uploadAnhLenCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "g3rxs97p"); // Thay tên thật vào đây
    const cloudName = "dg9s75xsf"; // Thay tên thật vào đây

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  // ================= SUBMIT FORM (LƯU VÀO DATABASE) =================
  const xuLyGuiForm = async (suKien) => {
    suKien.preventDefault();
    setDangLuu(true);

    try {
      let urlAnhMoi = formDuLieu.anhdaidien;

      if (fileAnh) {
        urlAnhMoi = await uploadAnhLenCloudinary(fileAnh);
      }

      // Payload phải map đúng chuẩn tên biến trong bảng DB của ông
      const duLieuGoiApi = { ...formDuLieu, anhdaidien: urlAnhMoi };

      if (cheDoSua) {
        await NguoiDung_Service.capNhatNguoiDung(maNguoiDungDangSua, duLieuGoiApi);
        alert("Cập nhật thông tin thành công!");
      } else {
        await NguoiDung_Service.dangKyNguoiDung(duLieuGoiApi);
        alert("Thêm người dùng thành công!");
      }

      setHienThiForm(false);
      taiDanhSachNguoiDung();

    } catch (error) {
      alert("Đã có lỗi xảy ra khi lưu dữ liệu!");
      console.error(error);
    } finally {
      setDangLuu(false);
    }
  };

  // ================= LỌC TÌM KIẾM =================
  const danhSachDaLoc = danhSachNguoiDung.filter((nd) => {
    const tuKhoa = tuKhoaTimKiem.trim().toLowerCase();
    if (!tuKhoa) return true;
    return nd.name?.toLowerCase().includes(tuKhoa) || nd.email?.toLowerCase().includes(tuKhoa);
  });

  return (
    <>
      <div className="admin-bento-grid">
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-round"><span className="material-symbols-outlined">group</span></div>
            <h3>Tổng người dùng</h3>
          </div>
          <div className="stat-number">{thongKe.tongSo}</div>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid var(--admin-error)' }}>
          <div className="stat-card-header">
            <div className="stat-icon-round" style={{ backgroundColor: 'rgba(186, 26, 26, 0.1)', color: 'var(--admin-error)' }}>
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <h3>Quản trị viên</h3>
          </div>
          <div className="stat-number">{thongKe.quanTriVien}</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-round" style={{ backgroundColor: 'rgba(0, 107, 84, 0.1)', color: 'var(--admin-secondary)' }}>
              <span className="material-symbols-outlined">school</span>
            </div>
            <h3>Số gia sư</h3>
          </div>
          <div className="stat-number">{thongKe.giaSu}</div>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid var(--admin-primary)' }}>
          <div className="stat-card-header">
            <div className="stat-icon-round" style={{ backgroundColor: 'rgba(0, 80, 136, 0.1)', color: 'var(--admin-primary)' }}>
              <span className="material-symbols-outlined">person</span>
            </div>
            <h3>Số người học</h3>
          </div>
          <div className="stat-number">{thongKe.nguoiHoc}</div>
        </div>

        <div className="controls-filter-box" style={{ gridColumn: '1 / -1' }}>
          <div className="search-filter-inline-row">
            <div className="inline-search-input-group">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={tuKhoaTimKiem}
                onChange={(e) => setTuKhoaTimKiem(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-table-card" style={{ marginTop: '24px' }}>
        <div className="user-table-header-bar">
          <span className="user-count-text">
            Hiển thị {danhSachDaLoc.length} / {danhSachNguoiDung.length} người dùng
          </span>
          <button type="button" className="btn-export-excel" onClick={moFormThemMoi}>
            <span className="material-symbols-outlined">add</span> Thêm mới
          </button>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Người dùng</th>
                <th style={{ width: '15%' }}>Vai trò</th>
                <th style={{ width: '15%' }}>Số điện thoại</th>
                <th style={{ width: '20%' }}>Email</th>
                <th style={{ width: '15%' }}>Trạng thái</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {dangTai ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Đang tải dữ liệu...</td></tr>
              ) : danhSachDaLoc.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Không tìm thấy dữ liệu.</td></tr>
              ) : (
                danhSachDaLoc.map((nguoiDung) => (
                  <tr key={nguoiDung.id} className={nguoiDung.status === 0 ? 'user-row-locked' : ''}>

                    {/* AVATAR & TÊN ĐÃ ĐƯỢC MAP ĐÚNG CHUẨN */}
                    <td>
                      <div className="table-user-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={nguoiDung.avatar?.length > 1 ? nguoiDung.avatar : `https://ui-avatars.com/api/?name=${nguoiDung.name}&background=005088&color=fff`}
                          alt="avatar"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span className="user-name-text" style={{ fontWeight: '600' }}>{nguoiDung.name}</span>
                      </div>
                    </td>

                    {/* VAI TRÒ (Service đã map ra chữ nên in thẳng ra luôn) */}
                    <td>
                      <span className="role-badge-tag">{nguoiDung.role}</span>
                    </td>

                    <td>{nguoiDung.phone}</td>
                    <td>{nguoiDung.email}</td>

                    {/* TRẠNG THÁI */}
                    <td>
                      {nguoiDung.status === 1 ? (
                        <span className="user-status-dot-badge active"><span className="status-dot active"></span> Hoạt động</span>
                      ) : (
                        <span className="user-status-dot-badge locked"><span className="status-dot locked"></span> Bị khóa</span>
                      )}
                    </td>

                    {/* THAO TÁC */}
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn-table-action-view" title="Chỉnh sửa" onClick={() => moFormSua(nguoiDung)}>
                        <span className="material-symbols-outlined" style={{ color: '#005088' }}>edit</span>
                      </button>

                      {nguoiDung.status === 1 ? (
                        <button type="button" className="btn-table-action-view" title="Khóa" onClick={() => xuLyDoiTrangThai(nguoiDung.id, nguoiDung.status)}>
                          <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>lock</span>
                        </button>
                      ) : (
                        <button type="button" className="btn-table-action-view" title="Mở khóa" onClick={() => xuLyDoiTrangThai(nguoiDung.id, nguoiDung.status)}>
                          <span className="material-symbols-outlined" style={{ color: '#006b54' }}>lock_open</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL THÊM / SỬA ================= */}
      {hienThiForm && (
        <div className="admin-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 9999
        }}>
          <div className="admin-modal-box" style={{
            backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px',
            width: '100%', maxWidth: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                {cheDoSua ? "Cập nhật thông tin" : "Thêm người dùng mới"}
              </h2>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setHienThiForm(false)}>
                <span className="material-symbols-outlined" style={{ color: '#555' }}>close</span>
              </button>
            </div>

            <form onSubmit={xuLyGuiForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* KHU VỰC UPLOAD ẢNH ĐẠI DIỆN */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <img
                  src={anhPreview || "https://ui-avatars.com/api/?name=Avatar&background=ccc&color=fff"}
                  alt="Preview"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #005088' }}
                />
                <input type="file" accept="image/*" onChange={xuLyChonAnh} style={{ fontSize: '12px' }}/>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Họ và tên</label>
                <input type="text" name="hoten" required style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieu.hoten} onChange={xuLyNhapLieu} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Vai trò hệ thống</label>
                <select name="vaitro" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieu.vaitro} onChange={xuLyNhapLieu}>
                  <option value={0}>Quản trị viên</option>
                  <option value={2}>Người học</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Số điện thoại</label>
                <input type="text" name="sodienthoai" required style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieu.sodienthoai} onChange={xuLyNhapLieu} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Email</label>
                <input type="email" name="email" required style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieu.email} onChange={xuLyNhapLieu} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>
                  {cheDoSua ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu ban đầu"}
                </label>
                <input type="password" name="matkhau" required={!cheDoSua} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieu.matkhau} onChange={xuLyNhapLieu} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={() => setHienThiForm(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" disabled={dangLuu} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: dangLuu ? '#9ca3af' : '#005088', color: '#fff', cursor: dangLuu ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
                  {dangLuu ? "Đang xử lý..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementTable;
