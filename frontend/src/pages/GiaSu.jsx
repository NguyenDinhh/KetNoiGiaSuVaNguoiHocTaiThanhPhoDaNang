import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/GiaSu.css';

// ================= CÁC COMPONENT CỦA GIA SƯ =================
import TongQuanGS from '../components/giasu_components/TongQuanGS';
import TrangCaNhan from '../components/giasu_components/TrangCaNhanGS.jsx';
import YeuCauDangKyLich from '../components/giasu_components/YeuCauDangKyLich';
import BaiDangTimGiaSu from '../components/giasu_components/YeuCauTimGiaSu.jsx';
import LichDay from '../components/giasu_components/LichDay';
import ThongKeGS from '../components/giasu_components/ThongKeGS.jsx';

// ================= IMPORT SERVICE =================
import GiaSu_Service from '../services/GiaSu_Service';
import NguoiDung_Service from '../services/NguoiDung_Service';

const GiaSu = () => {
  const [tabHienTai, setTabHienTai] = useState('profile');
  const [userInfo, setUserInfo] = useState(null);

  const [trangThaiDuyet, setTrangThaiDuyet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Load thông tin user và check trạng thái
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = localStorage.getItem("thongTinUser");

      if (!data) {
        navigate('/');
        return;
      }

      const userParsed = JSON.parse(data);

      // ==============================================================
      // 1. KIỂM TRA TÀI KHOẢN CÓ BỊ KHÓA KHÔNG (REAL-TIME CHECK)
      // ==============================================================
      try {
        const checkUser = await NguoiDung_Service.layChiTietNguoiDung(userParsed.manguoidung);

        // Nếu database trả về trạng thái = 0 (Bị khóa) -> Đá đăng xuất ngay lập tức
        if (checkUser && checkUser.trangthai === 0) {
          alert("TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA!\nHệ thống phát hiện tài khoản đã bị vô hiệu hóa. Phiên đăng nhập sẽ kết thúc ngay lập tức.");
          localStorage.clear();
          navigate('/');
          window.location.reload();
          return;
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái tài khoản:", error);
      }

      setUserInfo(userParsed);

      // ==============================================================
      // 2. KIỂM TRA TRẠNG THÁI DUYỆT HỒ SƠ GIA SƯ
      // ==============================================================
      try {
        const giasuData = await GiaSu_Service.layChiTietGiaSuvoimanguoidung(userParsed.manguoidung);
        const status = giasuData?.trangthaiduyet ?? 0;
        setTrangThaiDuyet(status);

        if (status === 1) {
          setTabHienTai('overview');
        }
      } catch (error) {
        console.error("Lỗi lấy trạng thái gia sư:", error);
        setTrangThaiDuyet(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Xử lý đăng xuất thủ công
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi kênh Gia sư?")) {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  const danhSachMenu = [
    // 🟢 Đã truyền hàm setTabHienTai xuống cho TongQuanGS
    { id: 'overview', icon: 'dashboard', label: 'Tổng quan', component: <TongQuanGS setTabHienTai={setTabHienTai} /> },
    { id: 'profile', icon: 'person', label: 'Trang cá nhân', component: <TrangCaNhan /> },
    { id: 'booking_requests', icon: 'event_available', label: 'Quản lý đăng ký lịch', component: <YeuCauDangKyLich /> },
    { id: 'job_posts', icon: 'search', label: 'Tìm lớp ứng tuyển', component: <BaiDangTimGiaSu /> },
    { id: 'schedule', icon: 'calendar_month', label: 'Lịch dạy', component: <LichDay /> },
    { id: 'stats', icon: 'insights', label: 'Thống kê', component: <ThongKeGS /> }
  ];

  const menuDangChon = danhSachMenu.find(menu => menu.id === tabHienTai);

  return (
    <div className="gs-container">
      {/* ================= SIDEBAR TRÁI ================= */}
      <aside className="gs-sidebar">
        <div className="sidebar-brand">
          <h1>Kết nối gia sư và người học</h1>
          <p>Kênh dành cho Gia sư</p>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {danhSachMenu.map((menu) => (
              <li
                key={menu.id}
                className={`sidebar-item ${tabHienTai === menu.id ? 'active' : ''}`}
              >
                <a href={`#${menu.id}`} onClick={(e) => { e.preventDefault(); setTabHienTai(menu.id); }}>
                  <span className="material-symbols-outlined">{menu.icon}</span>
                  <span>{menu.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn-gs-logout" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ================= NỘI DUNG CHÍNH PHẢI ================= */}
      <div className="gs-main-wrapper">
        <header className="gs-topbar">
          <div className="topbar-search-box">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Tìm kiếm nhanh..." />
          </div>

          <div className="topbar-right-zone">
            <button type="button" className="icon-badge-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="notification-dot"></span>
            </button>

            {/* Hiển thị Tên người dùng và Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>{userInfo?.hoten}</span>

              {userInfo?.anhdaidien && userInfo.anhdaidien.trim() !== '' && userInfo.anhdaidien !== 'string' ? (
                <img
                  src={userInfo.anhdaidien}
                  alt="Avatar"
                  className="gs-avatar-img"
                  title={userInfo?.hoten}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${userInfo?.hoten || 'GS'}&background=005088&color=fff&size=120`; }}
                />
              ) : (
                <div className="gs-avatar-circle" title={userInfo?.hoten} style={{width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#005088', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                  {userInfo?.hoten?.charAt(0).toUpperCase() || 'GS'}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="gs-canvas">
          <nav aria-label="Breadcrumb">
            <ul className="gs-breadcrumbs">
              <li><a href="#giasu">Gia sư</a></li>
              <li><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span></li>
              <li className="current-page">{menuDangChon?.label}</li>
            </ul>
          </nav>

          <div className="gs-content-area">
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#005088', fontWeight: '500' }}>
                Đang xác thực thông tin tài khoản...
              </div>
            ) : tabHienTai === 'profile' || trangThaiDuyet === 1 ? (
              menuDangChon?.component
            ) : (
              <div style={{
                padding: '60px 24px', textAlign: 'center', backgroundColor: '#fff',
                borderRadius: '12px', border: '1px solid #e2e8f0', margin: '30px auto',
                maxWidth: '550px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#f59e0b' }}>
                  lock_clock
                </span>
                <h2 style={{ color: '#1e293b', marginTop: '16px', fontSize: '22px' }}>Tính năng chờ xác nhận</h2>
                <p style={{ color: '#64748b', marginTop: '12px', lineHeight: '1.6', fontSize: '15px' }}>
                  Bạn chưa thể truy cập chức năng này do <strong>Hồ sơ Gia sư</strong> đang chờ Quản trị viên kiểm duyệt thông tin.
                </p>
                <div style={{
                  backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px',
                  color: '#475569', fontSize: '14px', marginTop: '20px', borderLeft: '4px solid #005088',
                  textAlign: 'left'
                }}>
                  💡 <strong>Gợi ý:</strong> Hãy chuyển sang mục <strong>"Trang cá nhân"</strong> để hoàn thiện thông tin định danh, tải lên ảnh CCCD và các Bằng cấp/Chứng chỉ liên quan để rút ngắn thời gian duyệt.
                </div>
                <button
                  onClick={() => setTabHienTai('profile')}
                  style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#005088', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Đi đến Trang cá nhân ngay
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GiaSu;
