import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/YeuCauTimGiaSu.css';

// ================= CÁC SERVICE CẦN THIẾT =================
import YeuCauTimGiaSu_Service from '../services/YeuCauTimGiaSu_Service';
import MonHoc_Service from '../services/MonHoc_Service';
import KhuVuc_Service from '../services/KhuVuc_Service';
import HeLop_Service from '../services/HeLop_Service';
import ChiTietYeuCau_Service from '../services/ChiTietYeuCau_Service';
import YeuCau_HocVien_Service from '../services/YeuCau_HocVien_Service';
import HocVien_Service from '../services/HocVien_Service';
// 🟢 THÊM SERVICE NÀY ĐỂ ĐẾM SỐ NGƯỜI ỨNG TUYỂN
import GiaSu_UngTuyen_Service from '../services/GiaSu_UngTuyen_Service';

const BaiDangTimGiaSu = () => {
  const [danhSachBaiDang, setDanhSachBaiDang] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const navigate = useNavigate();

  // --- STATE LƯU TRỮ MASTER DATA ---
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachHeLop, setDanhSachHeLop] = useState([]);

  // --- STATE BỘ LỌC ---
  const [boLocKhuVuc, setBoLocKhuVuc] = useState('');
  const [boLocHeLop, setBoLocHeLop] = useState('');
  const [boLocMonHoc, setBoLocMonHoc] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDuLieu = async () => {
      try {
        // 🟢 GỌI THÊM API ỨNG TUYỂN VÀO PROMISE.ALL
        const [
          resYeuCau, resMonHoc, resKhuVuc, resHeLop,
          resChiTiet, resYeuCauHocVien, resHocVien, resUngTuyen
        ] = await Promise.all([
          YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
          MonHoc_Service.layDanhSachMonHoc().catch(() => []),
          KhuVuc_Service.layDanhSachKhuVuc().catch(() => []),
          HeLop_Service.layDanhSachHeLop().catch(() => []),
          ChiTietYeuCau_Service.layDanhSachChiTietYeuCau().catch(() => []),
          YeuCau_HocVien_Service.layDanhSachYeuCauHocVien().catch(() => []),
          HocVien_Service.layDanhSachHocVien().catch(() => []),
          GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => [])
        ]);

        if (!isMounted) return;

        const listYeuCau = Array.isArray(resYeuCau) ? resYeuCau : resYeuCau?.data || [];
        const listMonHoc = Array.isArray(resMonHoc) ? resMonHoc : resMonHoc?.data || [];
        const listKhuVuc = Array.isArray(resKhuVuc) ? resKhuVuc : resKhuVuc?.data || [];
        const listHeLop = Array.isArray(resHeLop) ? resHeLop : resHeLop?.data || [];
        const listChiTiet = Array.isArray(resChiTiet) ? resChiTiet : resChiTiet?.data || [];
        const listYCHV = Array.isArray(resYeuCauHocVien) ? resYeuCauHocVien : resYeuCauHocVien?.data || [];
        const listHV = Array.isArray(resHocVien) ? resHocVien : resHocVien?.data || [];
        const listUngTuyen = Array.isArray(resUngTuyen) ? resUngTuyen : resUngTuyen?.data || [];

        setDanhSachKhuVuc(listKhuVuc);
        setDanhSachMonHoc(listMonHoc);
        setDanhSachHeLop(listHeLop);

        // Chỉ lấy các yêu cầu đang mở (trạng thái = 0)
        const yeuCauDangMo = listYeuCau.filter(yc => Number(yc.trangthai) === 0);

        const duLieuHoanChinh = yeuCauDangMo.map(yc => {
          const monHoc = listMonHoc.find(m => String(m.mamonhoc) === String(yc.mamonhoc));
          const khuVuc = listKhuVuc.find(k => String(k.makhuvuc) === String(yc.makhuvuc));
          const chiTietCuaYeuCau = listChiTiet.filter(ct => String(ct.mayeucau) === String(yc.mayeucau));

          const chuoiLichHoc = chiTietCuaYeuCau.map(ct => {
            const gioBatDau = ct.thoigianbatdau ? ct.thoigianbatdau.substring(0, 5) : '';
            const gioKetThuc = ct.thoigianketthuc ? ct.thoigianketthuc.substring(0, 5) : '';
            return `${ct.ngayhoc} (${gioBatDau}-${gioKetThuc})`;
          }).join(', ');

          const nhungNguoiThamGia = listYCHV.filter(y => String(y.mayeucau) === String(yc.mayeucau));
          const thongTinHocVien = nhungNguoiThamGia.map(y => listHV.find(h => String(h.mahocvien) === String(y.mahocvien))).filter(Boolean);

          // 🟢 ĐẾM SỐ LƯỢNG GIA SƯ ĐÃ NỘP ĐƠN ỨNG TUYỂN VÀO YÊU CẦU NÀY
          const soLuongUngTuyen = listUngTuyen.filter(ut => String(ut.mayeucau) === String(yc.mayeucau)).length;

          return {
            ...yc,
            mahelop: monHoc ? monHoc.mahelop : null,
            tenmonhoc: monHoc ? monHoc.tenmonhoc : 'Đang cập nhật',
            tenkhuvuc: khuVuc ? khuVuc.tenkhuvuc : 'Đang cập nhật',
            lichhoc_str: chuoiLichHoc || 'Chưa xếp lịch',
            ngaybatdau_str: yc.ngaybatdauhoc ? new Date(yc.ngaybatdauhoc).toLocaleDateString('vi-VN') : 'Đang cập nhật',
            danhsachhocvien: thongTinHocVien,
            soLuongUngTuyen: soLuongUngTuyen // 🟢 GÁN VÀO ĐÂY ĐỂ RENDER RA UI
          };
        });

        // Sắp xếp bài mới nhất lên trên
        setDanhSachBaiDang(duLieuHoanChinh.reverse());
        setDangTai(false);
      } catch (error) {
        console.error("Lỗi khi load dữ liệu bài đăng:", error);
        setDangTai(false);
      }
    };

    loadDuLieu();
    return () => { isMounted = false; };
  }, []);

  const handleYeuCauDangNhap = () => {
    if (window.confirm("Bạn cần Đăng nhập hoặc Đăng ký tài khoản Gia sư để ứng tuyển lớp học này. Chuyển đến trang Đăng nhập?")) {
      navigate('/');
    }
  };

  const monHocDropdown = boLocHeLop
    ? danhSachMonHoc.filter(m => String(m.mahelop) === String(boLocHeLop))
    : danhSachMonHoc;

  const danhSachHienThi = danhSachBaiDang.filter(bai => {
    if (boLocKhuVuc && String(bai.makhuvuc) !== Number(boLocKhuVuc)) return false;
    if (boLocHeLop && String(bai.mahelop) !== Number(boLocHeLop)) return false;
    if (boLocMonHoc && String(bai.mamonhoc) !== Number(boLocMonHoc)) return false;
    return true;
  });

  return (
    <div className="pb-wrapper">

      {/* BANNER */}
      <section className="pb-hero">
        <h1 className="pb-hero-title">Lớp Học Đang Tìm Gia Sư</h1>
        <p className="pb-hero-desc">
          Khám phá hàng trăm cơ hội giảng dạy từ các phụ huynh tại Đà Nẵng. Hãy tìm kiếm lớp học phù hợp với chuyên môn của bạn ngay hôm nay.
        </p>
      </section>

      {/* BỘ LỌC TÌM KIẾM (FLOATING) */}
      <section className="pb-filter-container">
        <div className="pb-filter-card">
          <div className="pb-filter-grid">
            <div className="pb-filter-item">
              <label>Khu vực</label>
              <select className="pb-select" value={boLocKhuVuc} onChange={e => setBoLocKhuVuc(e.target.value)}>
                <option value="">Tất cả khu vực</option>
                {danhSachKhuVuc.map(k => (
                  <option key={k.makhuvuc} value={k.makhuvuc}>{k.tenkhuvuc}</option>
                ))}
              </select>
            </div>
            <div className="pb-filter-item">
              <label>Hệ Lớp</label>
              <select className="pb-select" value={boLocHeLop} onChange={e => { setBoLocHeLop(e.target.value); setBoLocMonHoc(''); }}>
                <option value="">Tất cả hệ lớp</option>
                {danhSachHeLop.map(hl => (
                  <option key={hl.mahelop} value={hl.mahelop}>{hl.tenhelop}</option>
                ))}
              </select>
            </div>
            <div className="pb-filter-item">
              <label>Môn Học</label>
              <select className="pb-select" value={boLocMonHoc} onChange={e => setBoLocMonHoc(e.target.value)}>
                <option value="">Tất cả môn học</option>
                {monHocDropdown.map(m => (
                  <option key={m.mamonhoc} value={m.mamonhoc}>{m.tenmonhoc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* DANH SÁCH LỚP HỌC */}
      <section className="pb-list-container">
        <div className="pb-list-header">
          <h2>Danh sách lớp học ({danhSachHienThi.length})</h2>
        </div>

        {dangTai ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p>Đang tải dữ liệu lớp học từ hệ thống...</p>
          </div>
        ) : danhSachHienThi.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>search_off</span>
            <p style={{ color: '#475569', fontSize: '16px', marginTop: '12px' }}>Không tìm thấy lớp học nào khớp với tiêu chí của bạn!</p>
          </div>
        ) : (
          <div className="pb-cards-grid">
            {danhSachHienThi.map((baiDang) => (
              <div key={baiDang.mayeucau} className="pb-card">

                {/* Header Thẻ */}
                <div className="pb-card-header">
                  <div className="pb-icon-circle">
                    <span className="material-symbols-outlined">menu_book</span>
                  </div>
                  <div>
                    <h3 className="pb-card-title">{baiDang.tenmonhoc}</h3>
                    <p className="pb-card-location">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                      {baiDang.tenkhuvuc}
                    </p>
                  </div>
                </div>

                {/* Nội dung Thẻ */}
                <div className="pb-card-body">
                  <div className="pb-info-row">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span><strong>Ngày bắt đầu:</strong> {baiDang.ngaybatdau_str}</span>
                  </div>

                  {/* 🟢 ĐÃ TÁCH: DÒNG SỐ BUỔI */}
                  <div className="pb-info-row">
                    <span className="material-symbols-outlined">event_repeat</span>
                    <span><strong>Thời lượng:</strong> {baiDang.sobuoihoc} buổi</span>
                  </div>

                  {/* 🟢 ĐÃ TÁCH: DÒNG LỊCH HỌC */}
                  <div className="pb-info-row">
                    <span className="material-symbols-outlined">schedule</span>
                    <span><strong>Lịch học:</strong> {baiDang.lichhoc_str}</span>
                  </div>

                  {/* HIỂN THỊ SỐ LƯỢNG GIA SƯ ĐÃ ỨNG TUYỂN */}
                  <div className="pb-info-row" style={{ color: '#0369a1', background: '#e0f2fe', padding: '6px 10px', borderRadius: '6px', display: 'inline-flex', marginTop: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>how_to_reg</span>
                    <span>
                      <strong>Trạng thái:</strong> {baiDang.soLuongUngTuyen > 0 ? `Đã có ${baiDang.soLuongUngTuyen} gia sư ứng tuyển` : 'Chưa có người ứng tuyển'}
                    </span>
                  </div>

                  <div className="pb-students-box" style={{ marginTop: '12px' }}>
                    <div className="pb-students-title">Học viên tham gia ({baiDang.danhsachhocvien.length})</div>
                    {baiDang.danhsachhocvien.length > 0 ? (
                      baiDang.danhsachhocvien.map((hv) => (
                        <div key={hv.mahocvien} className="pb-student-item">
                          • {hv.tenhocvien} (Lực học: {hv.hocluc})
                        </div>
                      ))
                    ) : (
                      <div className="pb-student-item" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                        Đang cập nhật
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Thẻ */}
                <div className="pb-card-footer">
                  <div className="pb-price-row">
                    <span className="pb-price-label">Tổng học phí:</span>
                    <span className="pb-price-value">
                      {baiDang.tonghocphi ? `${baiDang.tonghocphi.toLocaleString()} đ` : 'Thỏa thuận'}
                    </span>
                  </div>

                  <button className="pb-btn-apply" onClick={handleYeuCauDangNhap}>
                    <span className="material-symbols-outlined">login</span>
                    Đăng nhập để Ứng Tuyển
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default BaiDangTimGiaSu;
