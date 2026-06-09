import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = ({ onRegisterClick, onLoginClick }) => {
  const navigate = useNavigate();

  // State lưu thông tin user và trạng thái mở/đóng menu
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Kiểm tra xem đã đăng nhập chưa khi component vừa load
  useEffect(() => {
    const userInfo = localStorage.getItem('thongTinUser');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // Xử lý click ra ngoài để đóng menu dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('thongTinUser');
    localStorage.removeItem('matruycap'); // Xóa luôn token nếu có
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="header-container">
      {/* Góc trái: Logo */}
      <Link to="/" className="header-logo">
        <span className="logo-text">Kết nối gia sư và người học</span>
      </Link>

      {/* Ở giữa: Menu điều hướng */}
      <nav>
        <ul className="nav-menu">
          <li><NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Trang chủ</NavLink></li>
          <li><NavLink to="/tim-gia-su" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Gia sư</NavLink></li>
          <li><NavLink to="/tim-mon-hoc" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Môn học</NavLink></li>
          <li><NavLink to="/yeu-cau-tim-gia-su" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Yêu cầu tìm gia sư</NavLink></li>
          <li><NavLink to="/lien-he" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Liên hệ</NavLink></li>
        </ul>
      </nav>

      {/* Góc phải: Xử lý hiển thị Đăng nhập hoặc Thông tin User */}
      <div className="auth-buttons">
        {user ? (
          // ĐÃ ĐĂNG NHẬP: Hiển thị Avatar + Tên + Dropdown
          <div className="header-user-menu" ref={dropdownRef}>
            <div
              className="header-user-info"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img
                src={user.anhdaidien}
                alt="Avatar"
                className="header-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user.hoten || 'U'}&background=005088&color=fff&size=100`;
                }}
              />
              <span className="header-username" style={{ fontWeight: '600', color: '#0f172a' }}>{user.hoten}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748b' }}>
                {isDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>

            {/* KHỐI DROPDOWN THÔNG MINH - ĐIỀU HƯỚNG THEO VAI TRÒ */}
            {isDropdownOpen && (
              <div className="header-dropdown">

                {/* 1. NẾU LÀ GIA SƯ (vaitro === 1) */}
                {user.vaitro === 1 && (
                  <Link to="/giasu" className="header-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <span className="material-symbols-outlined">dashboard</span>
                    Kênh Gia Sư
                  </Link>
                )}

                {/* 2. NẾU LÀ ADMIN (vaitro === 0) */}
                {user.vaitro === 0 && (
                  <Link to="/admin" className="header-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Trang Quản Trị
                  </Link>
                )}

                {/* 3. NẾU LÀ NGƯỜI HỌC / PHỤ HUYNH (vaitro === 2) HOẶC MẶC ĐỊNH */}
                {(user.vaitro === 2 || user.vaitro === undefined) && (
                  <>
                    <Link to="/nguoihoc#HoSoCaNhan" className="header-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span className="material-symbols-outlined">person</span>
                      Hồ sơ cá nhân
                    </Link>
                    <Link to="/nguoihoc#QuanLyHocVien" className="header-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span className="material-symbols-outlined">badge</span>
                      Quản lý học viên
                    </Link>
                    <Link to="/nguoihoc#QuanLyYeuCau" className="header-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span className="material-symbols-outlined">badge</span>
                      Quản lý yêu cầu
                    </Link>
                    <Link to="/nguoihoc#DangKyLich" className="header-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span className="material-symbols-outlined">badge</span>
                      Đăng ký lịch
                    </Link>
                  </>
                )}

                <div className="header-dropdown-divider"></div>
                <button className="header-dropdown-item text-danger" onClick={handleLogout}>
                  <span className="material-symbols-outlined">logout</span>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          // CHƯA ĐĂNG NHẬP: Hiển thị 2 nút mặc định
          <>
            <button className="btn-header-reg" onClick={onRegisterClick}>Đăng ký</button>
            <button className="btn-header-login" onClick={onLoginClick}>Đăng nhập</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
