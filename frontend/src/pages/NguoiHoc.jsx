import React, { useState, useEffect } from 'react';
// 🟢 ĐÃ THÊM: useLocation để theo dõi URL thay đổi liên tục
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/css/NguoiHoc.css';

// ================= CÁC COMPONENT CON =================
import TrangCaNhanNH from '../components/nguoihoc_components/TrangCaNhanNH.jsx';
import HocVien from '../components/nguoihoc_components/HocVien.jsx';
import QuanLyYeuCau from '../components/nguoihoc_components/QuanLyYeuCau.jsx';
import DangKyLich from '../components/nguoihoc_components/DangKyLich.jsx';

// ================= SERVICE =================
import NguoiDung_Service from '../services/NguoiDung_Service';

const NguoiHoc = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Khởi tạo hook theo dõi URL

  // Khôi phục Tab từ URL (nếu có) để tránh mất màn hình khi F5
  const tabBanDau = location.hash.replace('#', '') || 'HoSoCaNhan';
  const [tabHienTai, setTabHienTai] = useState(tabBanDau);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 LOGIC BẮT BUỘC ĐỂ MENU DROP DOWN TỪ HEADER HOẠT ĐỘNG
  // Mỗi khi `location.hash` trên thanh URL thay đổi, React sẽ chạy lại hàm này và gán tab hiện tại
  useEffect(() => {
    const hashMoi = location.hash.replace('#', '');
    if (hashMoi) {
      setTabHienTai(hashMoi);
    } else {
      setTabHienTai('HoSoCaNhan'); // Tab mặc định nếu ko có hash
    }
  }, [location.hash]);

  useEffect(() => {
    let isMounted = true;

    const kiemTraTrangThaiTaiKhoan = async () => {
      setIsLoading(true);
      const localData = localStorage.getItem("thongTinUser");

      if (!localData) {
        navigate('/');
        return;
      }

      const userParsed = JSON.parse(localData);

      try {
        const resCheck = await NguoiDung_Service.layChiTietNguoiDung(userParsed.manguoidung);
        const checkUser = resCheck?.data || resCheck; // Bẫy bọc Data an toàn

        if (checkUser && checkUser.trangthai === 0) {
          alert("TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA!\nHệ thống phát hiện tài khoản đã bị vô hiệu hóa bởi Quản trị viên.");
          localStorage.clear();
          navigate('/');
          window.location.reload();
          return;
        }
      } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu bảo mật tài khoản:", error);
      }

      if (isMounted) setIsLoading(false);
    };

    kiemTraTrangThaiTaiKhoan();

    return () => { isMounted = false; };
  }, [navigate]);

  // Cập nhật URL Hash khi chuyển Tab trong nội bộ trang Người Học
  const handleChuyenTab = (menuId) => {
    setTabHienTai(menuId);
    window.location.hash = menuId;
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  // 🟢 DANH SÁCH MENU ĐÃ ĐỒNG BỘ ID CHUẨN
  const danhSachMenu = [
    { id: 'HoSoCaNhan', icon: 'person', label: 'Hồ sơ cá nhân', component: <TrangCaNhanNH /> },
    { id: 'QuanLyHocVien', icon: 'school', label: 'Quản lý Học viên', component: <HocVien /> },
    { id: 'QuanLyYeuCau', icon: 'menu_book', label: 'Quản lý yêu cầu', component: <QuanLyYeuCau /> },
    { id: 'DangKyLich', icon: 'calendar_month', label: 'Đăng ký lịch', component: <DangKyLich /> }
  ];

  const menuDangChon = danhSachMenu.find(menu => menu.id === tabHienTai);

  return (
    <div className="nh-container">
      <aside className="nh-sidebar">
        <div className="sidebar-brand">
          <h1>Kết nối gia sư và người học</h1>
          <p>Kênh dành cho Người học</p>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {danhSachMenu.map((menu) => (
              <li
                key={menu.id}
                className={`sidebar-item ${tabHienTai === menu.id ? 'active' : ''}`}
              >
                <a href={`#${menu.id}`} onClick={(e) => { e.preventDefault(); handleChuyenTab(menu.id); }}>
                  <span className="material-symbols-outlined">{menu.icon}</span>
                  <span>{menu.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn-nh-logout" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="nh-main-wrapper">
        <main className="nh-canvas">
          <nav aria-label="Breadcrumb">
            <ul className="nh-breadcrumbs">
              <li><a href="#HoSoCaNhan">Người học</a></li>
              <li><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span></li>
              <li className="current-page">{menuDangChon?.label}</li>
            </ul>
          </nav>

          <div className="nh-content-area">
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#0284c7', fontWeight: '500' }}>
                Đang xử lý đồng bộ dữ liệu...
              </div>
            ) : (
              menuDangChon?.component
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NguoiHoc;
