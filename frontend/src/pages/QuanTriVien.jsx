import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Khai báo thêm hook điều hướng
import '../assets/css/Admin.css';

// Import toàn bộ các linh kiện
import TongQuan from '../components/quantrivien_components/TongQuan';
import TutorVerifyTable from '../components/quantrivien_components/XacNhanHoSo.jsx';
import UserManagementTable from '../components/quantrivien_components/QuanLyNguoiDung.jsx';
import BangCapManagementTable from '../components/quantrivien_components/BangCapManagementTable';
import HeLopManagementTable from '../components/quantrivien_components/HeLopManagementTable';
import MonHocManagementTable from '../components/quantrivien_components/MonHocManagementTable';
import KhuVucManagementTable from '../components/quantrivien_components/KhuVucManagementTable';
import ThongKe  from '../components/quantrivien_components/ThongKe.jsx';
const Admin = () => {
  const [tabHienTai, setTabHienTai] = useState('overview');

  // 1. STATE LƯU THÔNG TIN QUẢN TRỊ VIÊN
  const [adminInfo, setAdminInfo] = useState(null);
  const navigate = useNavigate();

  // 2. LOAD THÔNG TIN TỪ LOCALSTORAGE KHI VÀO TRANG
  useEffect(() => {
    const data = localStorage.getItem("thongTinUser");
    if (data) {
      setAdminInfo(JSON.parse(data));
    } else {
      // Nếu chưa đăng nhập thì đá về trang chủ
      navigate('/');
    }
  }, [navigate]);

  // 3. HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang Quản trị?")) {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  const danhSachMenu = [
    { id: 'overview', icon: 'dashboard', label: 'Tổng quan', component: <TongQuan /> },
    { id: 'verify', icon: 'fact_check', label: 'Xác nhận hồ sơ', component: <TutorVerifyTable /> },
    { id: 'users', icon: 'group', label: 'Quản lý người dùng', component: <UserManagementTable /> },
    { id: 'degrees', icon: 'school', label: 'Danh mục bằng cấp', component: <BangCapManagementTable /> },
    { id: 'classes', icon: 'layers', label: 'Danh mục hệ lớp', component: <HeLopManagementTable /> },
    { id: 'subjects', icon: 'book', label: 'Danh mục môn học', component: <MonHocManagementTable /> },
    { id: 'areas', icon: 'location_on', label: 'Danh mục khu vực', component: <KhuVucManagementTable /> },
    { id: 'stats', icon: 'analytics', label: 'Thống kê', component: <ThongKe/> }
  ];

  const menuDangChon = danhSachMenu.find(menu => menu.id === tabHienTai);

  return (
    <div className="admin-container">

      {/* ==========================================
          A. THANH ĐIỀU HƯỚNG TRÁI (SIDEBAR)
      ========================================== */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h1>Kết nối gia sư và người học tại thành phố Đà Nẵng</h1>
          <p>Dành cho quản trị viên</p>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {danhSachMenu.map((menu) => (
              <li
                key={menu.id}
                className={`sidebar-item ${tabHienTai === menu.id ? 'active' : ''}`}
              >
                <a
                  href={`#${menu.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTabHienTai(menu.id);
                  }}
                >
                  <span className="material-symbols-outlined">{menu.icon}</span>
                  <span>{menu.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {/* GẮN HÀM LOGOUT VÀO NÚT NÀY */}
          <button type="button" className="btn-admin-logout" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ==========================================
          B. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI
      ========================================== */}
      <div className="admin-main-wrapper">

        {/* TOPBAR ĐẦU TRANG */}
        <header className="admin-topbar">
          <div className="topbar-search-box">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Tìm kiếm..." />
          </div>

          <div className="topbar-right-zone">
            <button type="button" className="icon-badge-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="notification-dot"></span>
            </button>
            <button type="button" className="icon-badge-btn" style={{ marginRight: '10px' }}>
              <span className="material-symbols-outlined">settings</span>
            </button>

            {/* 4. HIỂN THỊ TÊN VÀ AVATAR QUẢN TRỊ VIÊN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{adminInfo?.hoten || 'Quản trị viên'}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Quản trị viên</span>
              </div>

              {adminInfo?.anhdaidien && adminInfo.anhdaidien.trim() !== '' && adminInfo.anhdaidien !== 'string' ? (
                <img
                  src={adminInfo.anhdaidien}
                  alt="Avatar"
                  title={adminInfo?.hoten}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${adminInfo?.hoten || 'Admin'}&background=0f172a&color=fff&size=120`; }}
                />
              ) : (
                <div className="admin-avatar-circle" title={adminInfo?.hoten} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {adminInfo?.hoten?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>

          </div>
        </header>

        {/* CANVAS LÀM VIỆC CHÍNH */}
        <main className="admin-canvas">

          <nav aria-label="Breadcrumb">
            <ul className="admin-breadcrumbs">
              <li><a href="#admin">Admin</a></li>
              <li><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span></li>
              <li><a href="#management">Quản lý</a></li>
              <li><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span></li>
              <li className="current-page">{menuDangChon?.label}</li>
            </ul>
          </nav>

          <div className="page-heading-zone"></div>

          {/* CÚ CẮM ĂN TIỀN: Hiển thị Component */}
          {menuDangChon?.component}

        </main>
      </div>

    </div>
  );
};

export default Admin;
