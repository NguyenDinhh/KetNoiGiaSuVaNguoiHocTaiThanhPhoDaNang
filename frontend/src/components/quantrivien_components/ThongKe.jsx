import { useState, useEffect } from 'react';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import GiaSu_Service from '../../services/GiaSu_Service';
import HocVien_Service from '../../services/HocVien_Service';
import DanhGia_Service from '../../services/DanhGia_Service';
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';

const ThongKe = () => {
  const [loaiThongKe, setLoaiThongKe] = useState('nguoihoc'); 
  const [dangTai, setDangTai] = useState(true);

  
  const [thongKeNguoiHoc, setThongKeNguoiHoc] = useState({
    tongSo: 0,
    coHocVien: 0,
    chuaCoHocVien: 0,
    yeucauDaGui: 0,
    yeucauDangXuLy: 0,
    yeucauHoanThanh: 0,
    lichDaDangKy: 0
  });

  
  const [thongKeGiaSu, setThongKeGiaSu] = useState({
    tongSo: 0,
    daXacThuc: 0,
    chuaXacThuc: 0,
    dangHoatDong: 0,
    danhGiaTrungBinh: 0,
    tongDanhGia: 0,
    lichDayHoanThanh: 0
  });

  
  const [topNguoiHoc, setTopNguoiHoc] = useState([]);
  const [topGiaSu, setTopGiaSu] = useState([]);

  useEffect(() => {
    taiDuLieu();
  }, [loaiThongKe]);

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      if (loaiThongKe === 'nguoihoc') {
        await taiThongKeNguoiHoc();
      } else {
        await taiThongKeGiaSu();
      }
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setDangTai(false);
    }
  };

  const taiThongKeNguoiHoc = async () => {
    try {
      
      const [dsNguoiDung, dsHocVien, dsYeuCau, dsDangKyLich] = await Promise.all([
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
        HocVien_Service.layDanhSachHocVien().catch(() => []),
        YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => [])
      ]);

      const dataNguoiDung = Array.isArray(dsNguoiDung) ? dsNguoiDung : (dsNguoiDung?.data || []);
      const dataHocVien = Array.isArray(dsHocVien) ? dsHocVien : (dsHocVien?.data || []);
      const dataYeuCau = Array.isArray(dsYeuCau) ? dsYeuCau : (dsYeuCau?.data || []);
      const dataDangKyLich = Array.isArray(dsDangKyLich) ? dsDangKyLich : (dsDangKyLich?.data || []);

      
      const nguoiHocList = dataNguoiDung.filter(nd => nd.role === 'Người học' || Number(nd.vaitro) === 2);

      
      const nguoiHocCoHocVien = new Set(dataHocVien.map(hv => hv.manguoidung)).size;
      const yeucauDangXuLy = dataYeuCau.filter(yc => Number(yc.trangthai) === 0 || Number(yc.trangthai) === 1).length;
      const yeucauHoanThanh = dataYeuCau.filter(yc => Number(yc.trangthai) === 2).length;

      setThongKeNguoiHoc({
        tongSo: nguoiHocList.length,
        coHocVien: nguoiHocCoHocVien,
        chuaCoHocVien: nguoiHocList.length - nguoiHocCoHocVien,
        yeucauDaGui: dataYeuCau.length,
        yeucauDangXuLy: yeucauDangXuLy,
        yeucauHoanThanh: yeucauHoanThanh,
        lichDaDangKy: dataDangKyLich.length
      });

      
      const nguoiHocTheoYeuCau = {};
      dataYeuCau.forEach(yc => {
        if (yc.manguoidung) {
          nguoiHocTheoYeuCau[yc.manguoidung] = (nguoiHocTheoYeuCau[yc.manguoidung] || 0) + 1;
        }
      });

      const topList = Object.entries(nguoiHocTheoYeuCau)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([manguoidung, soYeuCau]) => {
          const nguoiDung = nguoiHocList.find(nd => String(nd.id || nd.manguoidung) === manguoidung);
          return {
            ten: nguoiDung?.name || nguoiDung?.hoten || 'Không xác định',
            soLuong: soYeuCau,
            type: 'yêu cầu'
          };
        });

      setTopNguoiHoc(topList);

    } catch (error) {
      console.error("Lỗi tải thống kê người học:", error);
    }
  };

  const taiThongKeGiaSu = async () => {
    try {
      
      const [giasuRes, danhgiaRes, lichRes, gsmhRes, utRes, ndRes] = await Promise.all([
        GiaSu_Service.layDanhSachGiaSu().catch(() => []),
        DanhGia_Service.layDanhSachDanhGia().catch(() => []),
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
        GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
        GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => [])
      ]);

      const dsGiaSu = Array.isArray(giasuRes) ? giasuRes : (giasuRes?.data || []);
      const dsDanhGia = Array.isArray(danhgiaRes) ? danhgiaRes : (danhgiaRes?.data || []);
      const dsDangKyLich = Array.isArray(lichRes) ? lichRes : (lichRes?.data || []);
      const dsGSMH = Array.isArray(gsmhRes) ? gsmhRes : (gsmhRes?.data || []);
      const dsUT = Array.isArray(utRes) ? utRes : (utRes?.data || []);
      const dsNguoiDung = Array.isArray(ndRes) ? ndRes : (ndRes?.data || []);

      
      const daXacThuc = dsGiaSu.filter(gs => Number(gs.trangthaiduyet) === 1).length;
      const chuaXacThuc = dsGiaSu.filter(gs => Number(gs.trangthaiduyet) === 0).length;
      const dangHoatDong = daXacThuc; 

      
      let tongDiemHeThong = 0;
      let tongLuotDanhGiaHeThong = 0;

      const giaSuVoiDanhGia = dsGiaSu.map(gs => {
        
        const lopCuaGS = dsGSMH.filter(l => String(l.magiasu) === String(gs.magiasu));
        const mangMaLop = lopCuaGS.map(l => String(l.magiasu_monhoc));

        const dkCuaGS = dsDangKyLich.filter(dk => mangMaLop.includes(String(dk.magiasu_monhoc)));
        const utCuaGS = dsUT.filter(ut => String(ut.magiasu) === String(gs.magiasu) && Number(ut.trangthai) === 1);

        const mangMaDK = dkCuaGS.map(dk => String(dk.madangky));
        const mangMaYC = utCuaGS.map(ut => String(ut.mayeucau));

        
        const danhGiaCuaGS = dsDanhGia.filter(dg =>
          (dg.madangky && mangMaDK.includes(String(dg.madangky))) ||
          (dg.mayeucau && mangMaYC.includes(String(dg.mayeucau)))
        );

        const luotDG = danhGiaCuaGS.length;
        const tongDiemGS = danhGiaCuaGS.reduce((sum, item) => sum + Number(item.sodiem || item.diem || 0), 0);
        const diemTB = luotDG > 0 ? (tongDiemGS / luotDG) : 0;

        
        tongDiemHeThong += tongDiemGS;
        tongLuotDanhGiaHeThong += luotDG;

        return {
          ...gs,
          diemTrungBinh: diemTB,
          soDanhGia: luotDG
        };
      });

      
      const diemTrungBinhToanCuc = tongLuotDanhGiaHeThong > 0
        ? (tongDiemHeThong / tongLuotDanhGiaHeThong).toFixed(1)
        : 0;

      
      setThongKeGiaSu({
        tongSo: dsGiaSu.length,
        daXacThuc: daXacThuc,
        chuaXacThuc: chuaXacThuc,
        dangHoatDong: dangHoatDong,
        danhGiaTrungBinh: diemTrungBinhToanCuc,
        tongDanhGia: tongLuotDanhGiaHeThong,
        lichDayHoanThanh: dsDangKyLich.filter(l => Number(l.trangthai) === 2).length
      });

      
      const topList = giaSuVoiDanhGia
        .filter(gs => gs.soDanhGia > 0) 
        .sort((a, b) => b.diemTrungBinh - a.diemTrungBinh || b.soDanhGia - a.soDanhGia)
        .slice(0, 5)
        .map(gs => {
          
          const nd = dsNguoiDung.find(n => String(n.id || n.manguoidung) === String(gs.manguoidung));
          return {
            ten: nd?.name || nd?.hoten || gs.hoten || 'Không xác định',
            soLuong: gs.diemTrungBinh.toFixed(1),
            soDanhGia: gs.soDanhGia,
            type: 'sao'
          };
        });

      setTopGiaSu(topList);

    } catch (error) {
      console.error("Lỗi tải thống kê gia sư:", error);
    }
  };

  if (dangTai) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner">Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  return (
    <>
      {}
      <header className="tk-header">
        <div>
          <h2 className="tk-header-title">Thống kê hệ thống</h2>
          <p className="tk-header-sub">Phân tích và báo cáo chi tiết về người học và gia sư</p>
        </div>
        <button
          onClick={taiDuLieu}
          className="btn-tk-refresh"
        >
          <span className="material-symbols-outlined">refresh</span>
          Làm mới
        </button>
      </header>

      {}
      <div className="tk-tabs">
        <button
          className={`tk-tab-btn ${loaiThongKe === 'nguoihoc' ? 'active' : ''}`}
          onClick={() => setLoaiThongKe('nguoihoc')}
        >
          <span className="material-symbols-outlined">school</span>
          Thống kê người học
        </button>
        <button
          className={`tk-tab-btn ${loaiThongKe === 'giasu' ? 'active' : ''}`}
          onClick={() => setLoaiThongKe('giasu')}
        >
          <span className="material-symbols-outlined">workspace_premium</span>
          Thống kê gia sư
        </button>
      </div>

      {}
      {loaiThongKe === 'nguoihoc' ? (
        <ThongKeNguoiHocContent data={thongKeNguoiHoc} topList={topNguoiHoc} />
      ) : (
        <ThongKeGiaSuContent data={thongKeGiaSu} topList={topGiaSu} />
      )}
    </>
  );
};

const ThongKeNguoiHocContent = ({ data, topList }) => {
  
  const tyLeCoHocVien = data.tongSo > 0 ? (data.coHocVien / data.tongSo * 503).toFixed(2) : 0;
  const tyLeChuaCo = data.tongSo > 0 ? (data.chuaCoHocVien / data.tongSo * 503).toFixed(2) : 0;

  
  const phanTramDangXuLy = data.yeucauDaGui > 0 ? (data.yeucauDangXuLy / data.yeucauDaGui * 100).toFixed(0) : 0;
  const phanTramHoanThanh = data.yeucauDaGui > 0 ? (data.yeucauHoanThanh / data.yeucauDaGui * 100).toFixed(0) : 0;

  return (
    <div className="tk-content">
      {}
      <div className="tk-stats-grid">
        <div className="tk-stat-card gradient-blue">
          <div className="tk-stat-icon">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="tk-stat-info">
            <p className="tk-stat-label">Tổng người học</p>
            <h3 className="tk-stat-value">{data.tongSo}</h3>
          </div>
        </div>

        <div className="tk-stat-card gradient-green">
          <div className="tk-stat-icon">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div className="tk-stat-info">
            <p className="tk-stat-label">Có học viên</p>
            <h3 className="tk-stat-value">{data.coHocVien}</h3>
          </div>
        </div>

        <div className="tk-stat-card gradient-orange">
          <div className="tk-stat-icon">
            <span className="material-symbols-outlined">pending</span>
          </div>
          <div className="tk-stat-info">
            <p className="tk-stat-label">Yêu cầu đang xử lý</p>
            <h3 className="tk-stat-value">{data.yeucauDangXuLy}</h3>
          </div>
        </div>

        <div className="tk-stat-card gradient-purple">
          <div className="tk-stat-icon">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div className="tk-stat-info">
            <p className="tk-stat-label">Lịch đã đăng ký</p>
            <h3 className="tk-stat-value">{data.lichDaDangKy}</h3>
          </div>
        </div>
      </div>

      {}
      <div className="tk-main-grid">
        {}
        <div className="tk-card">
          <h3 className="tk-card-title">
            <span className="material-symbols-outlined">pie_chart</span>
            Phân bố người học
          </h3>
          <div className="tk-pie-chart">
            <div className="pie-visual">
              <svg viewBox="0 0 200 200" className="pie-svg">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#4ade80" strokeWidth="40" strokeDasharray={`${tyLeCoHocVien} 503`} transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#fb923c" strokeWidth="40" strokeDasharray={`${tyLeChuaCo} 503`} strokeDashoffset={`-${tyLeCoHocVien}`} transform="rotate(-90 100 100)" />
              </svg>
              <div className="pie-center-text">
                <div className="pie-total">{data.tongSo}</div>
                <div className="pie-label">Người học</div>
              </div>
            </div>
            <div className="pie-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#4ade80' }}></span>
                <span>Có học viên ({data.coHocVien})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#fb923c' }}></span>
                <span>Chưa có học viên ({data.chuaCoHocVien})</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="tk-card">
          <h3 className="tk-card-title">
            <span className="material-symbols-outlined">assignment</span>
            Trạng thái yêu cầu
          </h3>
          <div className="tk-progress-list">
            <div className="progress-item">
              <div className="progress-header">
                <span>Tổng yêu cầu</span>
                <span className="progress-value">{data.yeucauDaGui}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%', background: '#3b82f6' }}></div>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-header">
                <span>Đang xử lý</span>
                <span className="progress-value">{data.yeucauDangXuLy}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${phanTramDangXuLy}%`, background: '#f59e0b' }}></div>
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-header">
                <span>Hoàn thành</span>
                <span className="progress-value">{data.yeucauHoanThanh}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${phanTramHoanThanh}%`, background: '#10b981' }}></div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="tk-card full-width">
          <h3 className="tk-card-title">
            <span className="material-symbols-outlined">emoji_events</span>
            Top 5 người học tích cực nhất
          </h3>
          <div className="tk-top-list">
            {topList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Chưa có dữ liệu</div>
            ) : (
              topList.map((item, index) => (
                <div key={index} className="top-list-item">
                  <div className="top-rank">{index + 1}</div>
                  <div className="top-info">
                    <div className="top-name">{item.ten}</div>
                    <div className="top-detail">{item.soLuong} {item.type}</div>
                  </div>
                  <div className="top-badge">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ThongKeGiaSuContent = ({ data, topList }) => {
  const tyLeDaXacThuc = data.tongSo > 0 ? (data.daXacThuc / data.tongSo * 503).toFixed(2) : 0;
  const tyLeChuaXacThuc = data.tongSo > 0 ? (data.chuaXacThuc / data.tongSo * 503).toFixed(2) : 0;

  return (
    <div className="tk-content">
      {}
      <div className="tk-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="tk-stat-card gradient-blue">
          <div className="tk-stat-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div className="tk-stat-info">
            <p className="tk-stat-label">Tổng gia sư</p>
            <h3 className="tk-stat-value">{data.tongSo}</h3>
          </div>
        </div>

        <div className="tk-stat-card gradient-green">
          <div className="tk-stat-icon">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div className="tk-stat-info">
            <p className="tk-stat-label">Đã xác thực</p>
            <h3 className="tk-stat-value">{data.daXacThuc}</h3>
          </div>
        </div>

        <div className="tk-stat-card gradient-orange">
          <div className="tk-stat-icon">
            <span className="material-symbols-outlined">star</span>
          </div>
          <div className="tk-stat-info">
            <p className="tk-stat-label">Đánh giá TB</p>
            <h3 className="tk-stat-value">{data.danhGiaTrungBinh} ⭐</h3>
          </div>
        </div>
      </div>

      {}
      <div className="tk-main-grid">
        {}
        <div className="tk-card">
          <h3 className="tk-card-title">
            <span className="material-symbols-outlined">pie_chart</span>
            Phân bố xác thực
          </h3>
          <div className="tk-pie-chart">
            <div className="pie-visual">
              <svg viewBox="0 0 200 200" className="pie-svg">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#4ade80" strokeWidth="40" strokeDasharray={`${tyLeDaXacThuc} 503`} transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray={`${tyLeChuaXacThuc} 503`} strokeDashoffset={`-${tyLeDaXacThuc}`} transform="rotate(-90 100 100)" />
              </svg>
              <div className="pie-center-text">
                <div className="pie-total">{data.tongSo}</div>
                <div className="pie-label">Gia sư</div>
              </div>
            </div>
            <div className="pie-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#4ade80' }}></span>
                <span>Đã xác thực ({data.daXacThuc})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                <span>Chưa xác thực ({data.chuaXacThuc})</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="tk-card">
          <h3 className="tk-card-title">
            <span className="material-symbols-outlined">analytics</span>
            Hoạt động giảng dạy
          </h3>
          <div className="tk-stats-detail">
            <div className="stat-detail-item">
              <div className="stat-detail-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
                <span className="material-symbols-outlined">play_circle</span>
              </div>
              <div className="stat-detail-content">
                <div className="stat-detail-label">Gia sư sẵn sàng dạy</div>
                <div className="stat-detail-value">{data.dangHoatDong} gia sư</div>
              </div>
            </div>
            <div className="stat-detail-item">
              <div className="stat-detail-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
                <span className="material-symbols-outlined">rate_review</span>
              </div>
              <div className="stat-detail-content">
                <div className="stat-detail-label">Tổng lượt đánh giá</div>
                <div className="stat-detail-value">{data.tongDanhGia} lượt</div>
              </div>
            </div>
            <div className="stat-detail-item">
              <div className="stat-detail-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div className="stat-detail-content">
                <div className="stat-detail-label">Lịch dạy hoàn thành</div>
                <div className="stat-detail-value">{data.lichDayHoanThanh} lịch</div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="tk-card full-width">
          <h3 className="tk-card-title">
            <span className="material-symbols-outlined">emoji_events</span>
            Top 5 gia sư được đánh giá cao nhất
          </h3>
          <div className="tk-top-list">
            {topList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Chưa có dữ liệu</div>
            ) : (
              topList.map((item, index) => (
                <div key={index} className="top-list-item">
                  <div className="top-rank top-rank-gold">{index + 1}</div>
                  <div className="top-info">
                    <div className="top-name">{item.ten}</div>
                    <div className="top-detail">{item.soLuong} sao ({item.soDanhGia} đánh giá)</div>
                  </div>
                  <div className="top-badge">
                    <span className="material-symbols-outlined" style={{ color: '#fbbf24' }}>star</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThongKe;
