import React, { useState, useEffect } from 'react';
import '../../assets/css/GiaSu.css';

import GiaSu_Service from '../../services/GiaSu_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';

const ThongKeGS = () => {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    tongDoanhThu: 0,
    soHocVien: 0,
    soLopDay: 0, // Chỉ đếm lớp đang dạy (trạng thái 1)
    soDonCho: 0,
    thongKeDon: { tong: 0, thanhCong: 0, tuChoi: 0, choDuyet: 0 }
  });

  const [giaoDichMoi, setGiaoDichMoi] = useState([]);

  useEffect(() => {
    tinhToanThongKe();
  }, []);

  const tinhToanThongKe = async () => {
    try {
      setLoading(true);
      const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
      if (!userLocal) return;

      const giasuData = await GiaSu_Service.layChiTietGiaSuvoimanguoidung(userLocal.manguoidung);
      if (!giasuData?.magiasu) return;
      const maGS = Number(giasuData.magiasu);

      const [resLopHoc, resDangKy, resUngTuyen, resYeuCau, resNguoiDung] = await Promise.all([
        GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
        GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
        YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => [])
      ]);

      const cacLop = Array.isArray(resLopHoc) ? resLopHoc : (resLopHoc?.data || []);
      const cacDangKy = Array.isArray(resDangKy) ? resDangKy : (resDangKy?.data || []);
      const cacUngTuyen = Array.isArray(resUngTuyen) ? resUngTuyen : (resUngTuyen?.data || []);
      const cacYeuCau = Array.isArray(resYeuCau) ? resYeuCau : (resYeuCau?.data || []);
      const cacNguoiDung = Array.isArray(resNguoiDung) ? resNguoiDung : (resNguoiDung?.data || []);

      // ==========================================
      // 1. ĐỒNG BỘ: LUỒNG ĐĂNG KÝ LỊCH
      // Mã gốc: 0 (Chờ), 1 (Duyệt/Đang dạy), 2 (Từ chối), 3 (Hoàn thành)
      // Khớp 100% với mã Chuẩn hóa của chúng ta.
      // ==========================================
      const lopCuaToi = cacLop.filter(l => Number(l.magiasu) === maGS);
      const mangMaLop = lopCuaToi.map(l => Number(l.magiasu_monhoc));

      const luongDangKy = cacDangKy
        .filter(dk => mangMaLop.includes(Number(dk.magiasu_monhoc)))
        .map(dk => ({
          loai: 'Đăng ký lịch',
          id: dk.madangky,
          manguoidung: dk.manguoidung,
          hocphi: Number(dk.tonghocphi || dk.hocphi || 0),
          trangThaiChung: Number(dk.trangthai),
          ngaytao: new Date(dk.ngaytao || dk.ngaytao_dk || Date.now())
        }));

      // ==========================================
      // 2. ĐỒNG BỘ: LUỒNG ỨNG TUYỂN YÊU CẦU
      // Mã gốc Yêu Cầu: 0 (Chờ), 1 (Đang dạy), 2 (Hoàn thành)
      // ==========================================
      const luongUngTuyen = cacUngTuyen
        .filter(ut => Number(ut.magiasu) === maGS)
        .map(ut => {
          const yeuCauGoc = cacYeuCau.find(yc => Number(yc.mayeucau) === Number(ut.mayeucau)) || {};
          const utTrangThai = Number(ut.trangthai);
          const ycTrangThai = Number(yeuCauGoc.trangthai);

          let ttChung = 0; // Mặc định là Chờ
          if (utTrangThai === 1) {
            // Gia sư này trúng thầu -> Phụ thuộc vào tiến độ của Yêu cầu gốc
            ttChung = ycTrangThai === 2 ? 3 : 1; // 3: Hoàn thành, 1: Đang dạy
          } else if (utTrangThai === 2 || (ycTrangThai !== 0 && utTrangThai !== 1)) {
            // Bị từ chối thẳng mặt HOẶC yêu cầu đã chốt cho người khác
            ttChung = 2; // Từ chối
          } else {
            ttChung = 0; // Chờ duyệt
          }

          return {
            loai: 'Ứng tuyển',
            id: ut.maungtuyen || ut.id,
            manguoidung: yeuCauGoc.manguoidung,
            hocphi: Number(yeuCauGoc.tonghocphi || yeuCauGoc.hocphi || 0),
            trangThaiChung: ttChung,
            ngaytao: new Date(ut.ngaytao || ut.ngaytao_ut || Date.now())
          };
        });

      // 3. GỘP CHUNG VÀ TÍNH TOÁN KPI
      const tatCaGiaoDich = [...luongDangKy, ...luongUngTuyen];

      let doanhThu = 0;
      let dangDay = 0;
      let hoanThanh = 0;
      let tuChoi = 0;
      let choDuyet = 0;
      const setMaHocVienUnique = new Set();

      tatCaGiaoDich.forEach(gd => {
        if (gd.trangThaiChung === 1) { // Đang dạy
          dangDay++;
          doanhThu += gd.hocphi;
          if (gd.manguoidung) setMaHocVienUnique.add(gd.manguoidung);
        } else if (gd.trangThaiChung === 3) { // Hoàn thành
          hoanThanh++;
          doanhThu += gd.hocphi;
          if (gd.manguoidung) setMaHocVienUnique.add(gd.manguoidung);
        } else if (gd.trangThaiChung === 2) { // Từ chối
          tuChoi++;
        } else if (gd.trangThaiChung === 0) { // Chờ duyệt
          choDuyet++;
        }
      });

      // 4. LẤY 5 GIAO DỊCH GẦN NHẤT ĐỂ HIỂN THỊ LỊCH SỬ
      const top5GiaoDich = [...tatCaGiaoDich]
        .sort((a, b) => b.ngaytao - a.ngaytao) // Sắp xếp mới nhất lên đầu
        .slice(0, 5)
        .map((gd, index) => {
          const userHocVien = cacNguoiDung.find(nd => Number(nd.id || nd.manguoidung) === Number(gd.manguoidung));
          
          // Tính thời gian tương đối
          const now = new Date();
          const diffMs = now - gd.ngaytao;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          let thoiGianText = '';
          if (diffMins < 1) {
            thoiGianText = 'Vừa xong';
          } else if (diffMins < 60) {
            thoiGianText = `${diffMins} phút trước`;
          } else if (diffHours < 24) {
            thoiGianText = `${diffHours} giờ trước`;
          } else if (diffDays < 7) {
            thoiGianText = `${diffDays} ngày trước`;
          } else {
            thoiGianText = gd.ngaytao.toLocaleDateString('vi-VN');
          }
          
          return {
            ...gd,
            tenHocVien: userHocVien?.name || userHocVien?.hoten || 'Học viên ẩn danh',
            thoiGianText,
            thuTu: index + 1 // 1 = mới nhất
          };
        });

      // 5. CẬP NHẬT STATE
      setKpi({
        tongDoanhThu: doanhThu,
        soHocVien: setMaHocVienUnique.size,
        soLopDay: dangDay, // Chỉ hiện số lớp ĐANG DẠY thực tế lúc này
        soDonCho: choDuyet,
        thongKeDon: {
          tong: tatCaGiaoDich.length,
          thanhCong: dangDay + hoanThanh, // Biểu đồ gộp chung Đang dạy + Hoàn thành = Thành công
          tuChoi,
          choDuyet
        }
      });
      setGiaoDichMoi(top5GiaoDich);

    } catch (error) {
      console.error("Lỗi tính toán thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner">Đang tải dữ liệu tổng quan...</div>
      </div>
    );
  }

  // TÍNH TOÁN % CHO BIỂU ĐỒ TRÒN
  const { tong, thanhCong, tuChoi, choDuyet } = kpi.thongKeDon;
  const tyLeThanhCong = tong > 0 ? (thanhCong / tong * 503).toFixed(2) : 0;
  const tyLeCho = tong > 0 ? (choDuyet / tong * 503).toFixed(2) : 0;
  const tyLeTuChoi = tong > 0 ? (tuChoi / tong * 503).toFixed(2) : 0;

  const offsetCho = `-${tyLeThanhCong}`;
  const offsetTuChoi = `-${(Number(tyLeThanhCong) + Number(tyLeCho)).toFixed(2)}`;

  return (
    <div className="tk-dashboard-wrapper">
      <header className="tk-header">
        <div>
          <h2 className="tk-header-title">📊 Tổng Quan Hoạt Động Giảng Dạy</h2>
          <p className="tk-header-sub">Thống kê hiệu suất từ Đăng ký lịch học và Ứng tuyển yêu cầu tìm gia sư.</p>
        </div>
        <button onClick={tinhToanThongKe} className="btn-tk-refresh">
          <span className="material-symbols-outlined">refresh</span>
          Làm mới
        </button>
      </header>

      <div className="tk-content">
        {/* PHẦN THỐNG KÊ TỔNG QUAN */}
        <div className="tk-stats-grid">
          <div className="tk-stat-card gradient-purple">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Tổng doanh thu</p>
              <h3 className="tk-stat-value">
                {kpi.tongDoanhThu > 0 
                  ? (kpi.tongDoanhThu >= 1000000 
                      ? `${(kpi.tongDoanhThu / 1000000).toFixed(1)} triệu` 
                      : `${(kpi.tongDoanhThu / 1000).toFixed(0)}K`)
                  : '0đ'}
              </h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                Từ {thanhCong} lớp thành công
              </p>
            </div>
          </div>

          <div className="tk-stat-card gradient-blue">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Tổng học viên</p>
              <h3 className="tk-stat-value">{kpi.soHocVien}</h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                Đã và đang giảng dạy
              </p>
            </div>
          </div>

          <div className="tk-stat-card gradient-green">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Lớp đang dạy</p>
              <h3 className="tk-stat-value">{kpi.soLopDay}</h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                Lớp học đang hoạt động
              </p>
            </div>
          </div>

          <div className="tk-stat-card gradient-orange">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">hourglass_top</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Chờ phê duyệt</p>
              <h3 className="tk-stat-value">{kpi.soDonCho}</h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                Đơn đang chờ xét duyệt
              </p>
            </div>
          </div>
        </div>

        {/* PHẦN BIỂU ĐỒ VÀ LỊCH SỬ */}
        <div className="tk-main-grid">
          
          {/* BIỂU ĐỒ TRÒN */}
          <div className="tk-card">
            <h3 className="tk-card-title">
              <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>pie_chart</span>
              Phân tích kết quả kết nối
            </h3>
            <div className="tk-pie-chart">
              <div className="pie-visual">
                <svg viewBox="0 0 200 200" className="pie-svg">
                  {/* Thành công (Đang dạy + Hoàn thành) -> Xanh lá */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40" strokeDasharray={`${tyLeThanhCong} 503`} transform="rotate(-90 100 100)" />
                  {/* Chờ duyệt -> Cam */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray={`${tyLeCho} 503`} strokeDashoffset={offsetCho} transform="rotate(-90 100 100)" />
                  {/* Từ chối -> Đỏ */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="40" strokeDasharray={`${tyLeTuChoi} 503`} strokeDashoffset={offsetTuChoi} transform="rotate(-90 100 100)" />
                </svg>
                <div className="pie-center-text">
                  <div className="pie-total">{tong}</div>
                  <div className="pie-label">Tổng lượt</div>
                </div>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#10b981' }}></span>
                  <div>
                    <strong>Thành công</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {thanhCong} lượt ({tong > 0 ? ((thanhCong/tong)*100).toFixed(1) : 0}%)
                    </div>
                  </div>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                  <div>
                    <strong>Chờ duyệt</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {choDuyet} lượt ({tong > 0 ? ((choDuyet/tong)*100).toFixed(1) : 0}%)
                    </div>
                  </div>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                  <div>
                    <strong>Bị từ chối</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {tuChoi} lượt ({tong > 0 ? ((tuChoi/tong)*100).toFixed(1) : 0}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* TỈ LỆ THÀNH CÔNG */}
            {tong > 0 && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>trending_up</span>
                  <strong style={{ color: '#166534' }}>Tỉ lệ thành công</strong>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                  {((thanhCong/tong)*100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                  {thanhCong}/{tong} lượt kết nối thành công
                </div>
              </div>
            )}
          </div>

          {/* LỊCH SỬ KẾT NỐI GẦN ĐÂY */}
          <div className="tk-card">
            <h3 className="tk-card-title">
              <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>history</span>
              Hoạt động gần đây (Top 5)
            </h3>
            <div className="tk-top-list">
              {giaoDichMoi.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>inbox</span>
                  <p style={{ marginTop: '12px' }}>Chưa có hoạt động nào được ghi nhận.</p>
                </div>
              ) : (
                giaoDichMoi.map((gd, index) => {
                  const isThanhCong = gd.trangThaiChung === 1 || gd.trangThaiChung === 3;
                  const isCho = gd.trangThaiChung === 0;
                  const trangThaiColor = isThanhCong ? '#10b981' : isCho ? '#f59e0b' : '#ef4444';
                  const trangThaiText = gd.trangThaiChung === 1 ? 'Đang dạy' :
                                        gd.trangThaiChung === 3 ? 'Hoàn thành' :
                                        isCho ? 'Chờ duyệt' : 'Từ chối';

                  const loaiColor = gd.loai === 'Đăng ký lịch' ? '#3b82f6' : '#8b5cf6';
                  const loaiIcon = gd.loai === 'Đăng ký lịch' ? 'event_note' : 'handshake';
                  
                  // Badge hiển thị mức độ mới: "Mới nhất", "Mới", hoặc không có
                  const badgeNew = index === 0 ? (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: '#ef4444',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      MỚI NHẤT
                    </span>
                  ) : index === 1 ? (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: '#f59e0b',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      MỚI
                    </span>
                  ) : null;

                  return (
                    <div 
                      key={index} 
                      className="top-list-item" 
                      style={{ 
                        alignItems: 'center',
                        background: index === 0 ? '#fef3c7' : (index % 2 === 1 ? '#f8fafc' : '#ffffff'),
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: index === 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        position: 'relative'
                      }}
                    >
                      <div className="top-rank" style={{ background: `${loaiColor}`, color: '#fff', border: 'none', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{loaiIcon}</span>
                      </div>
                      <div className="top-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="top-name" style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                            👤 {gd.tenHocVien}
                          </div>
                          {badgeNew}
                        </div>
                        <div className="top-detail" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                          <span style={{ color: loaiColor, fontWeight: '600' }}>{gd.loai}</span>
                          <span style={{ margin: '0 6px' }}>•</span>
                          Mã: #{gd.id}
                          <span style={{ margin: '0 6px' }}>•</span>
                          💰 {gd.hocphi ? `${gd.hocphi.toLocaleString()}đ` : 'Thỏa thuận'}
                          <span style={{ margin: '0 6px' }}>•</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>⏰ {gd.thoiGianText}</span>
                        </div>
                      </div>
                      <div 
                        style={{ 
                          color: trangThaiColor, 
                          background: `${trangThaiColor}15`, 
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontWeight: 600,
                          fontSize: '13px',
                          border: `1px solid ${trangThaiColor}40`
                        }}
                      >
                        {trangThaiText}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThongKeGS;
