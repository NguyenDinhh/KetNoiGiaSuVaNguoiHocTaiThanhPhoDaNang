import React, { useState, useEffect } from 'react';
import '../../assets/css/GiaSu.css';

import GiaSu_Service from '../../services/GiaSu_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import ChiTietDangKyLich_Service from '../../services/ChiTietDangKyLich_Service';
import DanhGia_Service from '../../services/DanhGia_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';

const TongQuanGS = ({ setTabHienTai }) => {
  const [loading, setLoading] = useState(true);
  const [tenGiaSu, setTenGiaSu] = useState('Gia sư');

  
  const [stats, setStats] = useState({ lopDangDay: 0, yeuCauChoDuyet: 0, thuNhapDuKien: 0, danhGiaTB: 0, luotDanhGia: 0 });
  const [lichHomNay, setLichHomNay] = useState([]);
  const [thongBaoMoi, setThongBaoMoi] = useState([]);
  const [danhSachDanhGiaChiTiet, setDanhSachDanhGiaChiTiet] = useState([]);

  
  const [hienTatCa, setHienTatCa] = useState(false);

  
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

        const [ resLop, resDK, resChiTiet, resDanhGia, resMon, resND, resUngTuyen, resYeuCau ] = await Promise.all([
          GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
          DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
          ChiTietDangKyLich_Service.layDanhSachChiTietDangKyLich().catch(() => []),
          DanhGia_Service.layDanhSachDanhGia().catch(() => []),
          MonHoc_Service.layDanhSachMonHoc().catch(() => []),
          NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
          GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
          YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => [])
        ]);

        if (!isMounted) return;

        const cacLop = Array.isArray(resLop) ? resLop : (resLop?.data || []);
        const cacDangKy = Array.isArray(resDK) ? resDK : (resDK?.data || []);
        const cacChiTiet = Array.isArray(resChiTiet) ? resChiTiet : (resChiTiet?.data || []);
        const cacDanhGia = Array.isArray(resDanhGia) ? resDanhGia : (resDanhGia?.data || []);
        const cacMon = Array.isArray(resMon) ? resMon : (resMon?.data || []);
        const cacND = Array.isArray(resND) ? resND : (resND?.data || []);
        const cacUngTuyen = Array.isArray(resUngTuyen) ? resUngTuyen : (resUngTuyen?.data || []);
        const cacYeuCau = Array.isArray(resYeuCau) ? resYeuCau : (resYeuCau?.data || []);

        const lopCuaToi = cacLop.filter(l => String(l.magiasu) === String(giasuData.magiasu));
        const mangMaLop = lopCuaToi.map(l => String(l.magiasu_monhoc));
        const dkCuaToi = cacDangKy.filter(dk => mangMaLop.includes(String(dk.magiasu_monhoc)));

        
        const ungTuyenCuaToi = cacUngTuyen.filter(ut => String(ut.magiasu) === String(giasuData.magiasu) && Number(ut.trangthai) === 1);
        const mangMaYeuCau = ungTuyenCuaToi.map(ut => String(ut.mayeucau));
        const yeuCauCuaToi = cacYeuCau.filter(yc => mangMaYeuCau.includes(String(yc.mayeucau)));

        const dangDay = dkCuaToi.filter(dk => Number(dk.trangthai) === 1);
        const choDuyet = dkCuaToi.filter(dk => Number(dk.trangthai) === 0);
        
        
        const thuNhapTuDangKy = dangDay.reduce((sum, dk) => sum + (Number(dk.tonghocphi) || 0), 0);
        const yeuCauDangDay = yeuCauCuaToi.filter(yc => Number(yc.trangthai) === 1);
        const thuNhapTuYeuCau = yeuCauDangDay.reduce((sum, yc) => sum + (Number(yc.tonghocphi) || 0), 0);
        const tongThuNhap = thuNhapTuDangKy + thuNhapTuYeuCau;

        
        const mangMaDK = dkCuaToi.map(dk => String(dk.madangky));
        const danhGiaTuDangKy = cacDanhGia.filter(dg => dg.madangky && mangMaDK.includes(String(dg.madangky)));
        const danhGiaTuYeuCau = cacDanhGia.filter(dg => dg.mayeucau && mangMaYeuCau.includes(String(dg.mayeucau)));
        const danhGiaGoc = [...danhGiaTuDangKy, ...danhGiaTuYeuCau];
        
        const luotDanhGia = danhGiaGoc.length;
        const danhGiaTB = luotDanhGia > 0 ? (danhGiaGoc.reduce((sum, dg) => sum + Number(dg.sodiem), 0) / luotDanhGia).toFixed(1) : 0;

        const danhGiaHoanChinh = danhGiaGoc.map(dg => {
          let môn = null;
          let ngườiĐánhGiá = null;
          
          
          if (dg.madangky) {
            const đơn = dkCuaToi.find(dk => String(dk.madangky) === String(dg.madangky));
            const lớp = lopCuaToi.find(l => String(l.magiasu_monhoc) === String(đơn?.magiasu_monhoc));
            môn = cacMon.find(m => String(m.mamonhoc) === String(lớp?.mamonhoc));
            ngườiĐánhGiá = cacND.find(nd => String(nd.id || nd.manguoidung) === String(đơn?.manguoidung));
          } 
          
          else if (dg.mayeucau) {
            const yêuCầu = yeuCauCuaToi.find(yc => String(yc.mayeucau) === String(dg.mayeucau));
            môn = cacMon.find(m => String(m.mamonhoc) === String(yêuCầu?.mamonhoc));
            ngườiĐánhGiá = cacND.find(nd => String(nd.id || nd.manguoidung) === String(yêuCầu?.manguoidung));
          }
          
          return { 
            ...dg, 
            tenMonHoc: môn ? môn.tenmonhoc : 'Môn học', 
            tenNguoiDanhGia: ngườiĐánhGiá ? (ngườiĐánhGiá.hoten || ngườiĐánhGiá.name) : 'Học viên ẩn' 
          };
        });

        setDanhSachDanhGiaChiTiet(danhGiaHoanChinh.reverse());
        setStats({ lopDangDay: dangDay.length, yeuCauChoDuyet: choDuyet.length, thuNhapDuKien: tongThuNhap, danhGiaTB: Number(danhGiaTB), luotDanhGia: luotDanhGia });

        const lichHnayRaw = [];
        dangDay.forEach(dk => {
          const chiTietHomNay = cacChiTiet.filter(ct => String(ct.madangky) === String(dk.madangky) && ct.ngayhoc === thuHomNay );
          if (chiTietHomNay.length > 0) {
            const lop = lopCuaToi.find(l => String(l.magiasu_monhoc) === String(dk.magiasu_monhoc));
            const mon = cacMon.find(m => String(m.mamonhoc) === String(lop?.mamonhoc));
            const phuHuynh = cacND.find(nd => String(nd.id || nd.manguoidung) === String(dk.manguoidung));
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

  
  const danhGiaHienThi = hienTatCa ? danhSachDanhGiaChiTiet : danhSachDanhGiaChiTiet.slice(0, 3);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang đồng bộ dữ liệu hệ thống...</div>;

  return (
    <div className="tq-dashboard-wrapper">

      {}
      <div className="tq-header-section">
        <div>
          <h1 className="tq-greeting">Chào ngày mới, {tenGiaSu}! 👋</h1>
          <p className="tq-date-text">Hôm nay là {dateString} ({thuHomNay}).</p>
        </div>
        <button className="btn-submit" style={{ margin: 0, backgroundColor: '#006b54', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setTabHienTai('job_posts')}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span> Tìm bài đăng gia sư
        </button>
      </div>

      {}
      <div className="tq-stats-grid">
        <div className="tq-stat-card"><div className="tq-icon-box" style={{ background: '#e2f1ed', color: '#006b54' }}><span className="material-symbols-outlined">menu_book</span></div><div className="tq-stat-info"><p className="tq-stat-label">Lớp đang dạy</p><h3 className="tq-stat-value">{stats.lopDangDay}</h3></div></div>
        <div className="tq-stat-card" onClick={() => setTabHienTai('booking_requests')} style={{cursor: 'pointer'}}><div className="tq-icon-box" style={{ background: '#fef3c7', color: '#f59e0b' }}><span className="material-symbols-outlined">notifications_active</span></div><div className="tq-stat-info"><p className="tq-stat-label">Yêu cầu chờ duyệt</p><h3 className="tq-stat-value" style={{ color: '#f59e0b' }}>{stats.yeuCauChoDuyet}</h3></div></div>
        <div className="tq-stat-card"><div className="tq-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}><span className="material-symbols-outlined">payments</span></div><div className="tq-stat-info"><p className="tq-stat-label">Thu nhập dự kiến</p><h3 className="tq-stat-value">{stats.thuNhapDuKien.toLocaleString()} đ</h3></div></div>
        <div className="tq-stat-card"><div className="tq-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}><span className="material-symbols-outlined">kid_star</span></div><div className="tq-stat-info"><p className="tq-stat-label">Điểm đánh giá</p><h3 className="tq-stat-value">{stats.danhGiaTB} <span style={{ fontSize: '14px', color: '#64748b' }}>({stats.luotDanhGia})</span></h3></div></div>
      </div>

      <div className="tq-main-layout">
        <div className="tq-col-left">

          {}
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

          {}
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
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {dg.madangky ? `Mã đơn: #${dg.madangky}` : `Mã YC: #${dg.mayeucau}`}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: '1.6' }}>"{dg.noidung || 'Không có nhận xét chi tiết.'}"</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '13px', color: '#64748b' }}>
                        <span>👤 Phụ huynh: <strong>{dg.tenNguoiDanhGia}</strong></span>
                        <span>📚 Môn: <strong>{dg.tenMonHoc}</strong></span>
                        {dg.madangky && <span style={{fontSize: '11px', color: '#94a3b8'}}>Đơn: #{dg.madangky}</span>}
                        {dg.mayeucau && <span style={{fontSize: '11px', color: '#94a3b8'}}>YC: #{dg.mayeucau}</span>}
                      </div>
                    </div>
                  ))}

                  {}
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
