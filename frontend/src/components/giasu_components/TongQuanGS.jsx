import React, { useState, useEffect } from 'react';
import '../../assets/css/GiaSu.css';

// ================= CÁC SERVICE API HỆ THỐNG =================
import GiaSu_Service from '../../services/GiaSu_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import ChiTietDangKyLich_Service from '../../services/ChiTietDangKyLich_Service';
import DanhGia_Service from '../../services/DanhGia_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';

const TongQuanGS = ({ setTabHienTai }) => {
  const [loading, setLoading] = useState(true);
  const [tenGiaSu, setTenGiaSu] = useState('Gia sư');

  // STATE LƯU TRỮ DỮ LIỆU THỐNG KÊ
  const [stats, setStats] = useState({ lopDangDay: 0, yeuCauChoDuyet: 0, thuNhapDuKien: 0, danhGiaTB: 0, luotDanhGia: 0 });
  const [lichHomNay, setLichHomNay] = useState([]);
  const [thongBaoMoi, setThongBaoMoi] = useState([]);
  const [danhSachDanhGiaChiTiet, setDanhSachDanhGiaChiTiet] = useState([]);

  // 🟢 STATE MỚI: ĐIỀU KHIỂN VIỆC HIỆN THÊM / RÚT GỌN ĐÁNH GIÁ
  const [hienTatCa, setHienTatCa] = useState(false);

  // Lấy ngày hiện tại và format Thứ
  const today = new Date();
  const dateString = today.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const daysMap = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const thuHomNay = daysMap[today.getDay()];

  useEffect(() => {
    let isMounted = true;
    const fetchToanBoThongKe = async () => {
      try {
        setLoading(true);
        const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
        if (!userLocal) return;
        if (userLocal.hoten || userLocal.name) setTenGiaSu(userLocal.hoten || userLocal.name);

        const giasuData = await GiaSu_Service.layChiTietGiaSuvoimanguoidung(userLocal.manguoidung);
        if (!giasuData?.magiasu) { setLoading(false); return; }

        const [ resLop, resDK, resChiTiet, resDanhGia, resMon, resND ] = await Promise.all([
          GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
          DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
          ChiTietDangKyLich_Service.layDanhSachChiTietDangKyLich().catch(() => []),
          DanhGia_Service.layDanhSachDanhGia().catch(() => []),
          MonHoc_Service.layDanhSachMonHoc().catch(() => []),
          NguoiDung_Service.layDanhSachNguoiDung().catch(() => [])
        ]);

        if (!isMounted) return;

        const cacLop = Array.isArray(resLop) ? resLop : (resLop?.data || []);
        const cacDangKy = Array.isArray(resDK) ? resDK : (resDK?.data || []);
        const cacChiTiet = Array.isArray(resChiTiet) ? resChiTiet : (resChiTiet?.data || []);
        const cacDanhGia = Array.isArray(resDanhGia) ? resDanhGia : (resDanhGia?.data || []);
        const cacMon = Array.isArray(resMon) ? resMon : (resMon?.data || []);
        const cacND = Array.isArray(resND) ? resND : (resND?.data || []);

        const lopCuaToi = cacLop.filter(l => Number(l.magiasu) === Number(giasuData.magiasu));
        const mangMaLop = lopCuaToi.map(l => Number(l.magiasu_monhoc));
        const dkCuaToi = cacDangKy.filter(dk => mangMaLop.includes(Number(dk.magiasu_monhoc)));

        const dangDay = dkCuaToi.filter(dk => Number(dk.trangthai) === 1);
        const choDuyet = dkCuaToi.filter(dk => Number(dk.trangthai) === 0);
        const tongThuNhap = dangDay.reduce((sum, dk) => sum + (Number(dk.tonghocphi) || 0), 0);

        const mangMaDK = dkCuaToi.map(dk => Number(dk.madangky));
        const danhGiaGoc = cacDanhGia.filter(dg => mangMaDK.includes(Number(dg.madangky)));
        const luotDanhGia = danhGiaGoc.length;
        const danhGiaTB = luotDanhGia > 0 ? (danhGiaGoc.reduce((sum, dg) => sum + Number(dg.sodiem), 0) / luotDanhGia).toFixed(1) : 0;

        const danhGiaHoanChinh = danhGiaGoc.map(dg => {
          const đơn = dkCuaToi.find(dk => Number(dk.madangky) === Number(dg.madangky));
          const lớp = lopCuaToi.find(l => Number(l.magiasu_monhoc) === Number(đơn?.magiasu_monhoc));
          const môn = cacMon.find(m => Number(m.mamonhoc) === Number(lớp?.mamonhoc));
          const ngườiĐánhGiá = cacND.find(nd => Number(nd.id || nd.manguoidung) === Number(đơn?.manguoidung));
          return { ...dg, tenMonHoc: môn ? môn.tenmonhoc : 'Môn học', tenNguoiDanhGia: ngườiĐánhGiá ? (ngườiĐánhGiá.hoten || ngườiĐánhGiá.name) : 'Học viên ẩn' };
        });

        setDanhSachDanhGiaChiTiet(danhGiaHoanChinh.reverse());
        setStats({ lopDangDay: dangDay.length, yeuCauChoDuyet: choDuyet.length, thuNhapDuKien: tongThuNhap, danhGiaTB: Number(danhGiaTB), luotDanhGia: luotDanhGia });

        const lichHnayRaw = [];
        dangDay.forEach(dk => {
          const chiTietHomNay = cacChiTiet.filter(ct => Number(ct.madangky) === Number(dk.madangky) && ct.ngayhoc === thuHomNay );
          if (chiTietHomNay.length > 0) {
            const lop = lopCuaToi.find(l => Number(l.magiasu_monhoc) === Number(dk.magiasu_monhoc));
            const mon = cacMon.find(m => Number(m.mamonhoc) === Number(lop?.mamonhoc));
            const phuHuynh = cacND.find(nd => Number(nd.id || nd.manguoidung) === Number(dk.manguoidung));
            chiTietHomNay.forEach(ct => {
              lichHnayRaw.push({ id: ct.machitietdangky, gio: `${String(ct.thoigianbatdau).slice(0, 5)} - ${String(ct.thoigianketthuc).slice(0, 5)}`, mon: mon ? mon.tenmonhoc : 'Môn học ẩn', hocVien: phuHuynh ? (phuHuynh.name || phuHuynh.hoten) : 'Chưa rõ' });
            });
          }
        });
        lichHnayRaw.sort((a, b) => a.gio.localeCompare(b.gio));
        setLichHomNay(lichHnayRaw);

        const thongBaoAuto = [];
        if (choDuyet.length > 0) thongBaoAuto.push({ id: 'tb-1', type: 'warning', text: `Bạn đang có ${choDuyet.length} yêu cầu đăng ký lịch học mới chờ phê duyệt.`, time: 'Vừa cập nhật' });
        if (luotDanhGia > 0) thongBaoAuto.push({ id: 'tb-2', type: 'success', text: `Học viên vừa gửi cho bạn đánh giá mới.`, time: 'Gần đây' });
        setThongBaoMoi(thongBaoAuto);

      } catch (error) {
        console.error("Lỗi đồng bộ Tổng quan:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchToanBoThongKe();
    return () => { isMounted = false; };
  }, [thuHomNay]);

  // 🟢 LOGIC TÍNH TOÁN DANH SÁCH HIỂN THỊ
  const danhGiaHienThi = hienTatCa ? danhSachDanhGiaChiTiet : danhSachDanhGiaChiTiet.slice(0, 3);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang đồng bộ dữ liệu hệ thống...</div>;

  return (
    <div className="tq-dashboard-wrapper">

      {/* HEADER */}
      <div className="tq-header-section">
        <div>
          <h1 className="tq-greeting">Chào ngày mới, {tenGiaSu}! 👋</h1>
          <p className="tq-date-text">Hôm nay là {dateString} ({thuHomNay}).</p>
        </div>
        <button className="btn-submit" style={{ margin: 0, backgroundColor: '#006b54', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setTabHienTai('job_posts')}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span> Tìm bài đăng gia sư
        </button>
      </div>

      {/* STATS */}
      <div className="tq-stats-grid">
        <div className="tq-stat-card"><div className="tq-icon-box" style={{ background: '#e2f1ed', color: '#006b54' }}><span className="material-symbols-outlined">menu_book</span></div><div className="tq-stat-info"><p className="tq-stat-label">Lớp đang dạy</p><h3 className="tq-stat-value">{stats.lopDangDay}</h3></div></div>
        <div className="tq-stat-card" onClick={() => setTabHienTai('booking_requests')} style={{cursor: 'pointer'}}><div className="tq-icon-box" style={{ background: '#fef3c7', color: '#f59e0b' }}><span className="material-symbols-outlined">notifications_active</span></div><div className="tq-stat-info"><p className="tq-stat-label">Yêu cầu chờ duyệt</p><h3 className="tq-stat-value" style={{ color: '#f59e0b' }}>{stats.yeuCauChoDuyet}</h3></div></div>
        <div className="tq-stat-card"><div className="tq-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}><span className="material-symbols-outlined">payments</span></div><div className="tq-stat-info"><p className="tq-stat-label">Thu nhập dự kiến</p><h3 className="tq-stat-value">{stats.thuNhapDuKien.toLocaleString()} đ</h3></div></div>
        <div className="tq-stat-card"><div className="tq-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}><span className="material-symbols-outlined">kid_star</span></div><div className="tq-stat-info"><p className="tq-stat-label">Điểm đánh giá</p><h3 className="tq-stat-value">{stats.danhGiaTB} <span style={{ fontSize: '14px', color: '#64748b' }}>({stats.luotDanhGia})</span></h3></div></div>
      </div>

      <div className="tq-main-layout">
        <div className="tq-col-left">

          {/* LỊCH DẠY HÔM NAY */}
          <div className="tq-section-card">
            <div className="tq-section-header">
              <h2 className="tq-section-title"><span className="material-symbols-outlined" style={{ color: '#0284c7' }}>calendar_today</span> Lịch Dạy Hôm Nay</h2>
              <span className="tq-view-all" style={{ cursor: 'pointer' }} onClick={() => setTabHienTai('schedule')}>Xem thời khóa biểu →</span>
            </div>
            <div className="tq-schedule-list">
              {lichHomNay.length === 0 ? <div className="tq-empty-state">Hôm nay bạn không có lịch dạy.</div> :
                lichHomNay.map(ca => (
                  <div key={ca.id} className="tq-schedule-item">
                    <div className="tq-time-badge">{ca.gio}</div>
                    <div className="tq-schedule-info"><h4>{ca.mon}</h4><p><span className="material-symbols-outlined">face</span> Phụ huynh: {ca.hocVien}</p></div>
                    <button className="btn-outline tq-btn-small" onClick={() => setTabHienTai('schedule')}>Chi tiết</button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* 🟢 PHẦN ĐÁNH GIÁ VỚI NÚT HIỆN THÊM / RÚT GỌN */}
          <div className="tq-section-card" style={{marginTop: '24px'}}>
            <div className="tq-section-header">
              <h2 className="tq-section-title">
                <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>forum</span>
                Phản Hồi & Đánh Giá Gần Đây ({danhSachDanhGiaChiTiet.length})
              </h2>
            </div>

            <div className="tq-review-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {danhSachDanhGiaChiTiet.length === 0 ? (
                <div className="tq-empty-state">Bạn chưa nhận được lượt đánh giá nào.</div>
              ) : (
                <>
                  {danhGiaHienThi.map(dg => (
                    <div key={dg.madanhgia} className="tq-review-item" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', color: '#f59e0b' }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: i < dg.sodiem ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{dg.sodiem} Sao</strong>
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Mã đơn: #{dg.madangky}</span>
                      </div>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: '1.6' }}>"{dg.noidung || 'Không có nhận xét chi tiết.'}"</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '13px', color: '#64748b' }}>
                        <span>👤 Phụ huynh: <strong>{dg.tenNguoiDanhGia}</strong></span>
                        <span>📚 Môn: <strong>{dg.tenMonHoc}</strong></span>
                      </div>
                    </div>
                  ))}

                  {/* NÚT ĐIỀU KHIỂN HIỂN THỊ */}
                  {danhSachDanhGiaChiTiet.length > 3 && (
                    <button
                      onClick={() => setHienTatCa(!hienTatCa)}
                      style={{
                        alignSelf: 'center', padding: '8px 20px', borderRadius: '20px', border: '1px solid #005088',
                        backgroundColor: 'transparent', color: '#005088', fontWeight: 'bold', cursor: 'pointer',
                        fontSize: '13px', transition: 'all 0.2s', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                      onMouseOver={(e) => { e.target.style.backgroundColor = '#005088'; e.target.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#005088'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {hienTatCa ? 'keyboard_double_arrow_up' : 'expand_more'}
                      </span>
                      {hienTatCa ? 'Rút gọn nhận xét' : `Xem thêm ${danhSachDanhGiaChiTiet.length - 3} nhận xét khác`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TongQuanGS;
