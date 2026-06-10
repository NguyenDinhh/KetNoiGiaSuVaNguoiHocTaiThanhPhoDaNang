import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/LoginModal.css';
import NguoiDung_Service from '../../services/NguoiDung_Service';

const LoginModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await NguoiDung_Service.dangNhap(email, password);

      const thongTin = data.thong_tin;

      // ==============================================================
      // CHỐT CHẶN TÀI KHOẢN BỊ KHÓA: Kiểm tra trạng thái ngay lập tức
      // Giả sử: 1 là Hoạt động, 0 là Bị khóa
      if (thongTin.trangthai === 0) {
        alert("TÀI KHOẢN ĐÃ BỊ KHÓA!\nTài khoản của bạn đã bị quản trị viên vô hiệu hóa. Vui lòng liên hệ Hotline trung tâm để được hỗ trợ.");
        setIsLoading(false);
        return; // KẾT THÚC HÀM TẠI ĐÂY, KHÔNG CHO ĐI TIẾP
      }
      // ==============================================================

      // Nếu tài khoản bình thường (trangthai !== 0) -> Cho phép đăng nhập
      localStorage.setItem("matruycap", data.matruycap);
      localStorage.setItem("thongTinUser", JSON.stringify(thongTin));

      alert("Đăng nhập thành công!");
      onClose();

      // PHÂN LUỒNG QUYỀN TRUY CẬP
      const vaiTro = thongTin.vaitro;

      if (vaiTro === 0) {
        navigate('/admin');
      } else if (vaiTro === 1) {
        navigate('/giasu');
      } else {
        navigate('/');
        window.location.reload();
      }

    } catch (error) {
      alert("Lỗi đăng nhập: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-card">
        <button type="button" className="btn-close-login" onClick={onClose}>✕</button>

        <header className="login-header">
          <h2>Đăng nhập</h2>
          <p>Chào mừng bạn trở lại kết nối gia sư và người học</p>
        </header>

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="login-input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-input-group">
            <label>Mật khẩu</label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Nhớ mật khẩu
            </label>
            <a href="#" className="forgot-password">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
