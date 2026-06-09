import React, { useState } from 'react';
import '../../assets/css/RegisterModal.css';
import Upload_Service from '../../services/Upload_Service';
import XacThucEmail_Service from '../../services/XacThucEmail_Service';
// 👇 THÊM 2 DÒNG IMPORT NÀY 👇
import NguoiDung_Service from '../../services/NguoiDung_Service';
import GiaSu_Service from '../../services/GiaSu_Service'

const RegisterModal = ({ onClose }) => {
  // ================= STATE QUẢN LÝ DỮ LIỆU =================
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    namsinh: '',
    gioitinh: '0',
    gioithieubanthan: '',
    cccdmattruoc: '',
    cccdmatsau: ''
  });

  const [role, setRole] = useState('hoc_vien');
  const [showPassword, setShowPassword] = useState(false);
  const [dongYChinhSach, setDongYChinhSach] = useState(false);

  // ================= STATE ẢNH & UPLOAD =================
  const [avatarPreview, setAvatarPreview] = useState("");
  const [cccdTruocPreview, setCccdTruocPreview] = useState("");
  const [cccdSauPreview, setCccdSauPreview] = useState("");

  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingCccdTruoc, setLoadingCccdTruoc] = useState(false);
  const [loadingCccdSau, setLoadingCccdSau] = useState(false);

  // ================= STATE XÁC THỰC EMAIL (OTP) =================
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);


  // ================= CÁC HÀM XỬ LÝ (HANDLERS) =================
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Xử lý Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setLoadingAvatar(true);
    try {
      const ketQua = await Upload_Service.uploadAnh(file, "anhdaidien");
      // Sửa chỗ này thành == "200" cho đồng bộ với chuỗi trả về từ Backend
      if (ketQua.code == "200") {
        setAvatarPreview(ketQua.url);
      } else {
        alert("Lỗi upload Avatar: " + ketQua.message); // Hiện lỗi từ Backend trả về
      }
    } catch (loi) {
      alert("Lỗi kết nối API Upload Avatar: " + loi.message);
    } finally {
      setLoadingAvatar(false);
    }
  };

  // 2. Xử lý CCCD Mặt Trước
  const handleCccdFrontChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCccdTruocPreview(URL.createObjectURL(file));
    setLoadingCccdTruoc(true);
    try {
      const ketQua = await Upload_Service.uploadAnh(file, "cccdmattruoc");
      if (ketQua.code == "200") {
        setFormData(prev => ({ ...prev, cccdmattruoc: ketQua.url }));
      } else {
        alert("Lỗi upload CCCD Mặt trước: " + ketQua.message);
      }
    } catch (loi) {
      alert("Lỗi kết nối API Upload CCCD Trước: " + loi.message);
    } finally {
      setLoadingCccdTruoc(false);
    }
  };

  // 3. Xử lý CCCD Mặt Sau
  const handleCccdBackChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCccdSauPreview(URL.createObjectURL(file));
    setLoadingCccdSau(true);
    try {
      const ketQua = await Upload_Service.uploadAnh(file, "cccdmatsau");
      if (ketQua.code == "200") {
        setFormData(prev => ({ ...prev, cccdmatsau: ketQua.url }));
      } else {
        alert("Lỗi upload CCCD Mặt sau: " + ketQua.message);
      }
    } catch (loi) {
      alert("Lỗi kết nối API Upload CCCD Sau: " + loi.message);
    } finally {
      setLoadingCccdSau(false);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.email) return alert("Vui lòng nhập Email trước khi gửi mã!");

    try {
      const ketQua = await XacThucEmail_Service.guiMaOTP(formData.email);
      setIsOtpSent(true);
      setCountdown(60);
      alert(ketQua.message);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);

    } catch (loi) {
      alert("Lỗi không thể gửi email! Vui lòng kiểm tra lại mạng.");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return alert("Vui lòng nhập mã OTP!");

    try {
      const ketQua = await XacThucEmail_Service.xacThucOTP(formData.email, otp);
      setIsEmailVerified(true);
      alert(ketQua.message);
    } catch (loi) {
      alert(loi.message);
    }
  };

  // 👇 ĐÃ SỬA LẠI HÀM SUBMIT SỬ DỤNG SERVICE VÀ COMBO 2 BƯỚC 👇
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- CHỐT CHẶN AN TOÀN ---
    if (!isEmailVerified) {
      alert("Vui lòng xác thực Email bằng mã OTP trước khi đăng ký!");
      return;
    }

    if (role === 'gia_su') {
      if (!formData.cccdmattruoc || !formData.cccdmatsau) {
        alert("Vui lòng chờ ảnh CCCD tải lên mây hoàn tất!");
        return;
      }
      if (!dongYChinhSach) {
        alert("Bạn phải đồng ý với điều khoản NĐ 13/2023 để nộp hồ sơ Gia sư!");
        return;
      }
    }

    try {
      // BƯỚC 1: Lắp ráp dữ liệu chuẩn bị gửi cho bảng NGUOIDUNG
      const duLieuNguoiDung = {
        hoten: formData.fullName,
        sodienthoai: formData.phone,
        email: formData.email,
        matkhau: formData.password,
        anhdaidien: avatarPreview || "",
        vaitro: role === 'gia_su' ? 1 : 2
      };

      // Gọi API Đăng ký tài khoản gốc
      const ketQuaNguoiDung = await NguoiDung_Service.dangKyNguoiDung(duLieuNguoiDung);

      // 🔥 MÁY QUAY LÉN 1: In nguyên cục dữ liệu Backend trả về xem có gì bên trong
      console.log("📍 TOÀN BỘ DATA BƯỚC 1 TRẢ VỀ LÀ:", ketQuaNguoiDung);

      // BƯỚC 2: NẾU LÀ GIA SƯ -> BẮN TIẾP API THÊM BẢNG GIA SƯ
      if (role === 'gia_su') {
        // 🔥 Gài bẫy lấy ID kép: Đề phòng Backend trả về tên là 'id' thay vì 'manguoidung'
        const idNguoiDungVuaTao = ketQuaNguoiDung.data.manguoidung || ketQuaNguoiDung.data.id;

        // 🔥 MÁY QUAY LÉN 2: Xem ID bắt được là số mấy, hay là undefined
        console.log("📍 ID NGƯỜI DÙNG SẼ TRUYỀN SANG BẢNG GIA SƯ LÀ:", idNguoiDungVuaTao);

        // Chốt chặn an toàn: Nếu không có ID thì dừng lại luôn, khỏi gọi API Bước 2
        if (!idNguoiDungVuaTao) {
            alert("LỖI LOGIC: Không bóc được ID từ bảng Người dùng để chuyển sang bảng Gia Sư!");
            return;
        }

        const duLieuGiaSu = {
          manguoidung: idNguoiDungVuaTao,
          namsinh: formData.namsinh ? parseInt(formData.namsinh) : null,
          gioitinh: parseInt(formData.gioitinh),
          cccdmattruoc: formData.cccdmattruoc,
          cccdmatsau: formData.cccdmatsau,
          gioithieubanthan: formData.gioithieubanthan,
          trangthaiduyet: 0
        };

        // Gọi API Lưu hồ sơ Gia sư
        await GiaSu_Service.themGiaSu(duLieuGiaSu);

      }

      // THÀNH CÔNG TẤT CẢ
      alert(role === 'gia_su' ? "Nộp hồ sơ Gia sư thành công! Vui lòng chờ hệ thống phê duyệt." : "Đăng ký tài khoản Người học thành công!");
      onClose(); // Đóng form

    } catch (loi) {
      console.error(loi);
      alert("Lỗi đăng ký: " + (loi.message || "Kết nối máy chủ thất bại!"));
    }
  };


  // ================= GIAO DIỆN COMPONENT =================
  return (
    <div className="register-modal-overlay">
      <div className="register-card relative-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

        <button type="button" className="btn-close-modal" onClick={onClose}>✕</button>

        <header className="register-card-header">
          <h1>Tạo tài khoản mới</h1>
          <p>Tham gia cộng đồng học tập hàng đầu tại Đà Nẵng</p>
        </header>

        <form onSubmit={handleSubmit} className="register-main-form">

          {/* KHU VỰC 1: AVATAR */}
          <div className="avatar-upload-wrapper">
            <div className="avatar-picker-circle" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
              {loadingAvatar ? (
                <div className="avatar-placeholder-inside" style={{fontSize: '11px', color: '#94a3b8'}}>Đang tải...</div>
              ) : avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="avatar-image-inside" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar-placeholder-inside" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94a3b8' }}>add_a_photo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden-file-input" />
              <div className="avatar-edit-pencil-badge" style={{ bottom: '0', right: '0', width: '24px', height: '24px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
              </div>
            </div>
          </div>

          {/* KHU VỰC 2: CHỌN VAI TRÒ */}
          <div className="role-selector-grid">
            <button type="button" className={`btn-role-choice ${role === 'hoc_vien' ? 'role-active-blue' : 'role-inactive'}`} onClick={() => setRole('hoc_vien')}>
              <span className="material-symbols-outlined">person</span>
              <span className="btn-role-text">Người học</span>
            </button>
            <button type="button" className={`btn-role-choice ${role === 'gia_su' ? 'role-active-green' : 'role-inactive'}`} onClick={() => setRole('gia_su')}>
              <span className="material-symbols-outlined">school</span>
              <span className="btn-role-text">Gia sư</span>
            </button>
          </div>

          {/* KHU VỰC 3: HỌ TÊN & SĐT */}
          <div className="input-row-flex-grid">
            <div className="form-input-item-group">
              <label>Họ và tên <span style={{color: 'red'}}>*</span></label>
              <input type="text" name="fullName" onChange={handleInputChange} placeholder="Nguyễn Văn A" required />
            </div>
            <div className="form-input-item-group">
              <label>Số điện thoại <span style={{color: 'red'}}>*</span></label>
              <input type="tel" name="phone" onChange={handleInputChange} placeholder="0905 XXX XXX" required />
            </div>
          </div>

          {/* KHU VỰC 4: EMAIL & XÁC THỰC OTP */}
          <div className="form-input-item-group">
            <label>Email <span style={{color: 'red'}}>*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                name="email"
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                required
                disabled={isEmailVerified}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={countdown > 0 || isEmailVerified}
                style={{
                  padding: '0 16px',
                  backgroundColor: isEmailVerified ? '#10b981' : (countdown > 0 ? '#94a3b8' : '#005088'),
                  color: '#fff', border: 'none', borderRadius: '6px',
                  cursor: (countdown > 0 || isEmailVerified) ? 'not-allowed' : 'pointer',
                  fontWeight: '600', whiteSpace: 'nowrap'
                }}
              >
                {isEmailVerified ? '✔ Đã xác minh' : (countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã')}
              </button>
            </div>
          </div>

          {isOtpSent && !isEmailVerified && (
            <div className="form-input-item-group" style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f0fdf4', border: '1px dashed #22c55e', borderRadius: '8px' }}>
              <label style={{ color: '#15803d', fontSize: '13px' }}>Nhập mã OTP 6 số đã gửi đến email của bạn</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Ví dụ: 123456" style={{ flex: 1, letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }} />
                <button type="button" onClick={handleVerifyOTP} style={{ padding: '0 16px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Xác nhận
                </button>
              </div>
            </div>
          )}

          {/* KHU VỰC 5: HỒ SƠ GIA SƯ (CHỈ HIỆN KHI CHỌN GIA SƯ) */}
          {role === 'gia_su' && (
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '20px', marginTop: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', color: '#006b54', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>assignment_ind</span>
                Thông tin hồ sơ Gia sư
              </h3>

              <div className="input-row-flex-grid">
                <div className="form-input-item-group">
                  <label>Năm sinh</label>
                  <input type="number" name="namsinh" onChange={handleInputChange} placeholder="VD: 2000" required />
                </div>
                <div className="form-input-item-group">
                  <label>Giới tính</label>
                  <select name="gioitinh" onChange={handleInputChange} value={formData.gioitinh} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <option value="0">Nam</option>
                    <option value="1">Nữ</option>
                  </select>
                </div>
              </div>

              {/* CCCD VỚI PREVIEW ẢNH */}
              <div className="input-row-flex-grid">
                <div className="form-input-item-group">
                  <label>CCCD Mặt trước {loadingCccdTruoc && <span style={{color: 'orange', fontSize: '12px'}}>(Đang tải...)</span>}</label>
                  {cccdTruocPreview ? (
                    <div style={{ position: 'relative', width: '100%', height: '100px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                       <img src={cccdTruocPreview} alt="Mặt trước" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       {formData.cccdmattruoc && <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,128,0,0.8)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px' }}>Đã lên mây</div>}
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={handleCccdFrontChange} required style={{ border: '1px dashed #ccc', padding: '8px', borderRadius: '8px' }} />
                  )}
                </div>

                <div className="form-input-item-group">
                  <label>CCCD Mặt sau {loadingCccdSau && <span style={{color: 'orange', fontSize: '12px'}}>(Đang tải...)</span>}</label>
                  {cccdSauPreview ? (
                    <div style={{ position: 'relative', width: '100%', height: '100px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                       <img src={cccdSauPreview} alt="Mặt sau" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       {formData.cccdmatsau && <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,128,0,0.8)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px' }}>Đã lên mây</div>}
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={handleCccdBackChange} required style={{ border: '1px dashed #ccc', padding: '8px', borderRadius: '8px' }} />
                  )}
                </div>
              </div>

              <div className="form-input-item-group" style={{marginTop: '12px'}}>
                <label>Giới thiệu bản thân</label>
                <textarea name="gioithieubanthan" rows="3" onChange={handleInputChange} placeholder="Kinh nghiệm giảng dạy..." required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', resize: 'none' }}></textarea>
              </div>

              {/* CHECKBOX PHÁP LÝ */}
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(0, 107, 84, 0.05)', border: '1px solid rgba(0, 107, 84, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input type="checkbox" id="dongYDieuKhoan" checked={dongYChinhSach} onChange={(e) => setDongYChinhSach(e.target.checked)} style={{ marginTop: '4px', width: '16px', height: '16px', accentColor: '#006b54', cursor: 'pointer' }} />
                <label htmlFor="dongYDieuKhoan" style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', cursor: 'pointer', margin: 0 }}>
                  Tôi đã đọc và đồng ý với <b>Chính sách bảo mật & Xử lý dữ liệu cá nhân</b> của hệ thống theo Nghị định 13/2023/NĐ-CP. Tôi cam kết thông tin cung cấp là hoàn toàn chính xác.
                </label>
              </div>
            </div>
          )}

          {/* KHU VỰC 6: MẬT KHẨU */}
          <div className="form-input-item-group" style={{ marginTop: '12px' }}>
            <label>Mật khẩu <span style={{color: 'red'}}>*</span></label>
            <div className="password-input-inner-box">
              <input type={showPassword ? "text" : "password"} name="password" onChange={handleInputChange} placeholder="••••••••" required />
              <button type="button" className="btn-toggle-password-eye" onClick={() => setShowPassword(!showPassword)}>
                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {/* NÚT SUBMIT CHÍNH */}
          <div className="submit-action-btn-zone">
            <button
              type="submit"
              className="btn-register-submit-trigger"
              disabled={role === 'gia_su' && !dongYChinhSach}
              style={{
                background: role === 'gia_su' ? '#006b54' : '#005088',
                opacity: (role === 'gia_su' && !dongYChinhSach) ? 0.5 : 1,
                cursor: (role === 'gia_su' && !dongYChinhSach) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {role === 'gia_su' ? 'Nộp hồ sơ Gia sư' : 'Đăng ký ngay'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
