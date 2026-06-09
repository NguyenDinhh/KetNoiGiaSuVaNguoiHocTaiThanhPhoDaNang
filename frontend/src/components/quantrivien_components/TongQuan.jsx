import { useState, useEffect } from 'react';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import GiaSu_Service from '../../services/GiaSu_Service';

const TongQuan = () => {
  const [thongKe, setThongKe] = useState({
    tongNguoiDung: 0,
    tongNguoiHoc: 0,
    tongGiaSu: 0,
    giaSuChoDuyet: 0,
    giaSuDaDuyet: 0,
    giaSuBiKhoa: 0
  });

  const [giaSuMoi, setGiaSuMoi] = useState([]);
  const [nguoiDungMoi, setNguoiDungMoi] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [capNhatLuc, setCapNhatLuc] = useState(new Date());

  // Load dữ liệu khi component mount
  useEffect(() => {
    taiDuLieu();
  }, []);

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      // Gọi API song song: Lấy luôn cục thống kê có sẵn từ Backend
      const [thongKeND, dsNguoiDung, dsGiaSu] = await Promise.all([
        NguoiDung_Service.layThongKeNguoiDung(), // API trả về: { tongSo, quanTriVien, giaSu, nguoiHoc }
        NguoiDung_Service.layDanhSachNguoiDung(),
        GiaSu_Service.layDanhSachGiaSu()
      ]);

      // Phân loại trạng thái kiểm duyệt gia sư (Vì thống kê User không có phần này)
      const gsChoDuyet = dsGiaSu.filter(gs => gs.trangthaiduyet === 0); // 0: Chờ duyệt
      const gsDaDuyet = dsGiaSu.filter(gs => gs.trangthaiduyet === 1);  // 1: Đã duyệt
      const gsBiKhoa = dsGiaSu.filter(gs => gs.trangthai === 0);        // 0: Bị khóa

      // Cập nhật thống kê bằng dữ liệu chuẩn từ Backend
      setThongKe({
        tongNguoiDung: thongKeND?.tongSo || 0,
        tongNguoiHoc: thongKeND?.nguoiHoc || 0,

        // SỬA DÒNG NÀY: Dùng trực tiếp chiều dài mảng dsGiaSu làm tổng số để đồng bộ Mẫu số
        tongGiaSu: dsGiaSu.length || 0,

        giaSuChoDuyet: gsChoDuyet.length,
        giaSuDaDuyet: gsDaDuyet.length,
        giaSuBiKhoa: gsBiKhoa.length
      });

      // Lấy 5 gia sư mới nhất cần xác thực để hiển thị ra bảng
      setGiaSuMoi(gsChoDuyet.slice(0, 5));

      // Lấy 5 người dùng mới tạo tài khoản gần nhất
      const nguoiDungMoiNhat = dsNguoiDung
        .sort((a, b) => new Date(b.ngaytao) - new Date(a.ngaytao))
        .slice(0, 5);
      setNguoiDungMoi(nguoiDungMoiNhat);

      setCapNhatLuc(new Date());
    } catch (error) {
      console.error("Lỗi tải dữ liệu tổng quan:", error);
    } finally {
      setDangTai(false);
    }
  };

  const tinhPhutTruoc = () => {
    const phut = Math.floor((new Date() - capNhatLuc) / 60000);
    return phut < 1 ? 'vừa xong' : `${phut} phút trước`;
  };

  if (dangTai) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner">Đang tải dữ liệu quản trị...</div>
      </div>
    );
  }

  return (
    <>
      <header className="tq-header">
        <div>
          <h2 className="tq-header-title">Tổng quan người dùng</h2>
          <p className="tq-header-sub">Quản lý, xét duyệt hồ sơ và theo dõi tăng trưởng thành viên.</p>
        </div>
        <div className="tq-flex-between" style={{ gap: '8px', color: '#64748b', fontSize: '14px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
          Cập nhật: {tinhPhutTruoc()}
          <button
            onClick={taiDuLieu}
            style={{
              marginLeft: '12px', border: '1px solid #cbd5e1', background: 'white',
              padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
            Làm mới
          </button>
        </div>
      </header>

      {/* --- QUICK STATS --- */}
      <section className="tq-stats-grid">
        <div className="tq-card">
          <div className="tq-flex-start">
            <div className="tq-avatar" style={{ background: 'rgba(0, 80, 136, 0.1)', color: 'var(--admin-primary)' }}>
              <span className="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Tổng tài khoản</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111c2d' }}>
              {thongKe.tongNguoiDung.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="tq-card">
          <div className="tq-flex-start">
            <div className="tq-avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <span className="material-symbols-outlined">school</span>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Tài khoản Người học</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111c2d' }}>
              {thongKe.tongNguoiHoc.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="tq-card">
          <div className="tq-flex-start">
            <div className="tq-avatar" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
              <span className="material-symbols-outlined">workspace_premium</span>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Tài khoản Gia sư</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111c2d' }}>
              {thongKe.tongGiaSu.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="tq-card">
          <div className="tq-flex-start">
            <div className="tq-avatar" style={{ background: 'rgba(186, 26, 26, 0.1)', color: 'var(--admin-error)' }}>
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Hồ sơ chờ duyệt</p>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111c2d' }}>
              {thongKe.giaSuChoDuyet.toLocaleString()}
            </h3>
          </div>
        </div>
      </section>

      {/* --- MAIN GRID --- */}
      <div className="tq-main-grid">

        {/* === CỘT TRÁI === */}
        <div className="tq-col-left">

          {/* Gia sư mới cần xác thực */}
          <div className="tq-card no-pad">
            <div className="tq-card-header">
              <h3 className="tq-card-title">
                <span className="material-symbols-outlined" style={{ color: 'var(--admin-error)' }}>policy</span>
                Gia sư chờ kiểm duyệt
              </h3>
            </div>

            <div>
              {giaSuMoi.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Tuyệt vời! Không có hồ sơ gia sư nào đang tồn đọng.
                </div>
              ) : (
                giaSuMoi.map((giasu, index) => (
                  <div key={index} className="tq-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="tq-avatar" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
                        {giasu.hoten ? giasu.hoten.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '15px' }}>
                          {giasu.hoten || 'Chưa cập nhật'}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>school</span>
                          {giasu.kinhnghiem || 'Cần xem xét chứng chỉ'}
                        </p>
                      </div>
                    </div>
                    <button style={{ border: 'none', background: 'var(--admin-primary)', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Duyệt ngay
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Danh sách người dùng mới đăng ký */}
          <div className="tq-card no-pad">
            <div className="tq-card-header">
              <h3 className="tq-card-title">
                <span className="material-symbols-outlined" style={{ color: '#10b981' }}>person_add</span>
                Thành viên mới tham gia
              </h3>
            </div>
            <div className="table-responsive-wrapper">
              <table className="admin-data-table" style={{ border: 'none', margin: 0 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '35%' }}>Họ và tên</th>
                    <th style={{ width: '30%' }}>Email/SĐT</th>
                    <th style={{ width: '15%' }}>Vai trò</th>
                    <th style={{ width: '20%' }}>Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {nguoiDungMoi.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        Chưa có người dùng mới
                      </td>
                    </tr>
                  ) : (
                    nguoiDungMoi.map((nd, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600, color: '#111c2d' }}>
                          {nd.name || nd.hoten || 'Người dùng mới'}
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>
                          {nd.email || nd.sdt || '---'}
                        </td>
                        <td>
                          <span className="tq-badge" style={{
                            background: nd.role === 'Gia sư' ? '#ffedd5' : '#dbeafe',
                            color: nd.role === 'Gia sư' ? '#c2410c' : '#1e40af',
                            border: `1px solid ${nd.role === 'Gia sư' ? '#fed7aa' : '#bfdbfe'}`
                          }}>
                            {nd.role || 'Người học'}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>
                          {nd.ngaytao ? new Date(nd.ngaytao).toLocaleDateString('vi-VN') : 'Hôm nay'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI === */}
        <div className="tq-col-right">

          {/* Chi tiết trạng thái Gia sư */}
          <div className="tq-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'middle', marginRight: '8px', color: 'var(--admin-secondary)' }}>
                fact_check
              </span>
              Kiểm duyệt Gia sư
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#10b981' }}>verified</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Đã xác thực (Hoạt động)</span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111c2d' }}>{thongKe.giaSuDaDuyet}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#d97706' }}>hourglass_empty</span>
                  <span style={{ fontWeight: 600, color: '#92400e' }}>Chờ xác thực hồ sơ</span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#92400e' }}>{thongKe.giaSuChoDuyet}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>block</span>
                  <span style={{ fontWeight: 600, color: '#991b1b' }}>Tài khoản bị khóa</span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#991b1b' }}>{thongKe.giaSuBiKhoa}</span>
              </div>
            </div>
          </div>

          {/* Phân tích cộng đồng */}
          <div className="tq-card">
            <div className="tq-flex-between">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Phân tích Cộng đồng</h3>
              <span className="material-symbols-outlined" style={{ color: '#94a3b8' }}>pie_chart</span>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>

                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '16px', borderRadius: '12px', color: 'white' }}>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Tỷ lệ duyệt hồ sơ</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>
                    {thongKe.tongGiaSu > 0 ? Math.round((thongKe.giaSuDaDuyet / thongKe.tongGiaSu) * 100) : 0}%
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '16px', borderRadius: '12px', color: 'white' }}>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Cung / Cầu (GS/NH)</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>
                    1 : {thongKe.tongGiaSu > 0 ? (thongKe.tongNguoiHoc / thongKe.tongGiaSu).toFixed(1) : 0}
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '16px', borderRadius: '12px', color: 'white', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Thành viên mới trong tuần</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                      {nguoiDungMoi.filter(nd => {
                        const ngayTao = new Date(nd.ngaytao);
                        const tuanTruoc = new Date();
                        tuanTruoc.setDate(tuanTruoc.getDate() - 7);
                        return ngayTao >= tuanTruoc;
                      }).length}
                    </span>
                    <span style={{ fontSize: '14px', opacity: 0.8 }}>tài khoản</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default TongQuan;
