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
        .sort((a, b) => b.ngaytao - a.ngaytao)
        .slice(0, 5)
        .map(gd => {
          const userHocVien = cacNguoiDung.find(nd => Number(nd.id || nd.manguoidung) === Number(gd.manguoidung));
          return {
            ...gd,
            tenHocVien: userHocVien?.name || userHocVien?.hoten || 'Học viên ẩn danh'
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
    <>
      <header className="tk-header">
        <div>
          <h2 className="tk-header-title">Tổng Quan Lớp Học</h2>
          <p className="tk-header-sub">Thống kê hiệu suất từ Đăng ký lịch và Ứng tuyển yêu cầu.</p>
        </div>
        <button onClick={tinhToanThongKe} className="btn-tk-refresh">
          <span className="material-symbols-outlined">refresh</span>
          Làm mới
        </button>
      </header>

      <div className="tk-content">
        <div className="tk-stats-grid">
          <div className="tk-stat-card gradient-purple">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Doanh thu tích lũy</p>
              <h3 className="tk-stat-value">
                {kpi.tongDoanhThu > 0 ? `${(kpi.tongDoanhThu / 1000000).toFixed(1)}Tr` : '0đ'}
              </h3>
            </div>
          </div>

          <div className="tk-stat-card gradient-blue">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Học viên tích lũy</p>
              <h3 className="tk-stat-value">{kpi.soHocVien}</h3>
            </div>
          </div>

          <div className="tk-stat-card gradient-green">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">class</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Lớp đang hoạt động</p>
              <h3 className="tk-stat-value">{kpi.soLopDay}</h3>
            </div>
          </div>

          <div className="tk-stat-card gradient-orange">
            <div className="tk-stat-icon">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div className="tk-stat-info">
              <p className="tk-stat-label">Kết nối chờ duyệt</p>
              <h3 className="tk-stat-value">{kpi.soDonCho}</h3>
            </div>
          </div>
        </div>

        <div className="tk-main-grid">
          <div className="tk-card">
            <h3 className="tk-card-title">
              <span className="material-symbols-outlined">pie_chart</span>
              Tỷ lệ kết nối thành công
            </h3>
            <div className="tk-pie-chart">
              <div className="pie-visual">
                <svg viewBox="0 0 200 200" className="pie-svg">
                  {/* Thành công (Đang dạy + Hoàn thành) -> Xanh */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40" strokeDasharray={`${tyLeThanhCong} 503`} transform="rotate(-90 100 100)" />
                  {/* Chờ duyệt -> Cam */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray={`${tyLeCho} 503`} strokeDashoffset={offsetCho} transform="rotate(-90 100 100)" />
                  {/* Từ chối -> Đỏ */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="40" strokeDasharray={`${tyLeTuChoi} 503`} strokeDashoffset={offsetTuChoi} transform="rotate(-90 100 100)" />
                </svg>
                <div className="pie-center-text">
                  <div className="pie-total">{tong}</div>
                  <div className="pie-label">Lượt kết nối</div>
                </div>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#10b981' }}></span>
                  <span>Nhận lớp/Hoàn thành ({thanhCong})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                  <span>Đang chờ duyệt ({choDuyet})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                  <span>Đã từ chối ({tuChoi})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="tk-card full-width">
            <h3 className="tk-card-title">
              <span className="material-symbols-outlined">history</span>
              Lịch sử kết nối gần đây
            </h3>
            <div className="tk-top-list">
              {giaoDichMoi.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  Chưa có lượt tương tác nào.
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
                  const loaiIcon = gd.loai === 'Đăng ký lịch' ? 'event_available' : 'handshake';

                  return (
                    <div key={index} className="top-list-item" style={{ alignItems: 'center' }}>
                      <div className="top-rank" style={{ background: `${loaiColor}15`, color: loaiColor, border: 'none' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{loaiIcon}</span>
                      </div>
                      <div className="top-info">
                        <div className="top-name">{gd.tenHocVien}</div>
                        <div className="top-detail">
                          <strong style={{ color: loaiColor }}>{gd.loai}</strong> • Mã GD: #{gd.id} • Học phí: {gd.hocphi ? `${gd.hocphi.toLocaleString()}đ` : 'Thỏa thuận'}
                        </div>
                      </div>
                      <div className="top-badge" style={{ color: trangThaiColor, background: 'transparent', padding: 0, fontWeight: 600 }}>
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
    </>
  );
};

export default ThongKeGS;
