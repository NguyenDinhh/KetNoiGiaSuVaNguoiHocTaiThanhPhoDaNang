import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/TimGiaSu.css';

// ================= CÁC SERVICE CẦN THIẾT =================
import GiaSu_Service from '../services/GiaSu_Service';
import NguoiDung_Service from '../services/NguoiDung_Service';
import GiaSu_BangCap_Service from '../services/GiaSu_BangCap_Service';
import GiaSu_MonHoc_Service from '../services/GiaSu_MonHoc_Service';
import BangCap_Service from '../services/BangCap_Service';
import MonHoc_Service from '../services/MonHoc_Service';
import KhuVuc_Service from '../services/KhuVuc_Service';
import DangKyLich_Service from '../services/DangKyLich_Service';
import GiaSu_UngTuyen_Service from '../services/GiaSu_UngTuyen_Service';
import YeuCauTimGiaSu_Service from '../services/YeuCauTimGiaSu_Service';
import DanhGia_Service from '../services/DanhGia_Service';

const TimGiaSu = () => {
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tuKhoa, setTuKhoa] = useState('');

  const navigate = useNavigate();

  // ================= STATE CHO MODAL CHI TIẾT =================
  const [giaSuDuocChon, setGiaSuDuocChon] = useState(null);
  const [danhSachBangCap, setDanhSachBangCap] = useState([]);
  const [monHocCuaGiaSu, setMonHocCuaGiaSu] = useState([]);
  const [danhSachDanhGia, setDanhSachDanhGia] = useState([]);
  const [loadingChiTiet, setLoadingChiTiet] = useState(false);

  // LOAD DANH SÁCH GIA SƯ BAN ĐẦU
  useEffect(() => {
    const fetchGiaSu = async () => {
      try {
        setIsLoading(true);

        const [giasuRes, nguoidungRes, gsmhRes, dkRes, utRes, dgRes] = await Promise.all([
          GiaSu_Service.layDanhSachGiaSu().catch(() => []),
          NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
          GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
          DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
          GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
          DanhGia_Service.layDanhSachDanhGia().catch(() => [])
        ]);

        const tatCaGiaSu = Array.isArray(giasuRes) ? giasuRes : (giasuRes?.data || []);
        const tatCaNguoiDung = Array.isArray(nguoidungRes) ? nguoidungRes : (nguoidungRes?.data || []);
        const tatCaGSMH = Array.isArray(gsmhRes) ? gsmhRes : (gsmhRes?.data || []);
        const tatCaDK = Array.isArray(dkRes) ? dkRes : (dkRes?.data || []);
        const tatCaUT = Array.isArray(utRes) ? utRes : (utRes?.data || []);
        const tatCaDG = Array.isArray(dgRes) ? dgRes : (dgRes?.data || []);

        const giaSuDaDuyet = tatCaGiaSu
          .filter(gs => Number(gs.trangthaiduyet) === 1)
          .map(gs => {
            const nd = tatCaNguoiDung.find(n => Number(n.id || n.manguoidung) === Number(gs.manguoidung)) || {};

            const lopCuaGS = tatCaGSMH.filter(l => Number(l.magiasu) === Number(gs.magiasu));
            const mangMaLop = lopCuaGS.map(l => Number(l.magiasu_monhoc));

            const dkCuaGS = tatCaDK.filter(dk => mangMaLop.includes(Number(dk.magiasu_monhoc)));
            const utCuaGS = tatCaUT.filter(ut => Number(ut.magiasu) === Number(gs.magiasu) && Number(ut.trangthai) === 1);

            const mangMaDK = dkCuaGS.map(dk => Number(dk.madangky));
            const mangMaYC = utCuaGS.map(ut => Number(ut.mayeucau));

            const danhGiaCuaGS = tatCaDG.filter(dg =>
              (dg.madangky && mangMaDK.includes(Number(dg.madangky))) ||
              (dg.mayeucau && mangMaYC.includes(Number(dg.mayeucau)))
            );

            const luotDG = danhGiaCuaGS.length;
            const diemTB = luotDG > 0
              ? (danhGiaCuaGS.reduce((sum, item) => sum + Number(item.sodiem), 0) / luotDG).toFixed(1)
              : 0;

            return {
              ...gs,
              hoten: nd.name || nd.hoten || 'Gia sư',
              anhdaidien: nd.avatar || nd.anhdaidien || '',
              sdt: nd.phone || nd.sodienthoai || 'Chưa cập nhật',
              email: nd.email || 'Chưa cập nhật',
              danhGiaBase: Number(diemTB),
              luotDanhGiaBase: luotDG
            };
          });

        const dsKhongTrungLap = [];
        const idDaXuatHien = new Set();
        for (const gs of giaSuDaDuyet) {
          if (!idDaXuatHien.has(gs.manguoidung)) {
            idDaXuatHien.add(gs.manguoidung);
            dsKhongTrungLap.push(gs);
          }
        }

        setDanhSachGiaSu(dsKhongTrungLap);
      } catch (err) {
        setError("Không thể tải danh sách gia sư: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGiaSu();
  }, []);

  // HÀM XEM CHI TIẾT
  const handleXemChiTiet = async (giasu) => {
    setGiaSuDuocChon(giasu);
    setLoadingChiTiet(true);

    try {
      const [
        listGSBC, listBangCap, listGSMH, listMonHoc, listKhuVuc,
        listDK, listUT, listDG, listND, listYC
      ] = await Promise.all([
        GiaSu_BangCap_Service.layDanhSachGiaSuBangCap().catch(() => []),
        BangCap_Service.layDanhSachBangCap().catch(() => []),
        GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
        MonHoc_Service.layDanhSachMonHoc().catch(() => []),
        KhuVuc_Service.layDanhSachKhuVuc().catch(() => []),
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
        GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
        DanhGia_Service.layDanhSachDanhGia().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
        YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => [])
      ]);

      const bangCapMaster = Array.isArray(listBangCap) ? listBangCap : listBangCap?.data || [];
      const monHocMaster = Array.isArray(listMonHoc) ? listMonHoc : listMonHoc?.data || [];
      const khuVucMaster = Array.isArray(listKhuVuc) ? listKhuVuc : listKhuVuc?.data || [];

      // 1. Map Bằng cấp
      const bangCapCuaGiaSu = (listGSBC || [])
        .filter(bc => Number(bc.magiasu) === Number(giasu.magiasu))
        .map(bc => {
          const thongTinBC = bangCapMaster.find(master => Number(master.mabangcap) === Number(bc.mabangcap)) || {};
          return {
            ...bc,
            tenbangcap: thongTinBC.tenbangcap || `Bằng cấp #${bc.mabangcap}`,
            chuyennganh: thongTinBC.chuyennganh || ''
          };
        });

      // 2. Map Môn học
      const monHocGS = (listGSMH || [])
        .filter(mh => Number(mh.magiasu) === Number(giasu.magiasu))
        .map(mh => {
          const thongTinMH = monHocMaster.find(master => Number(master.mamonhoc) === Number(mh.mamonhoc)) || {};
          const thongTinKV = khuVucMaster.find(master => Number(master.makhuvuc) === Number(mh.makhuvuc)) || {};
          return {
            ...mh,
            tenmonhoc: thongTinMH.tenmonhoc || `Môn học #${mh.mamonhoc}`,
            tenkhuvuc: thongTinKV.tenkhuvuc || 'Toàn thành phố',
            hocphimotbuoi: mh.hocphimotbuoi || mh.hocphi || 0
          };
        });

      // 3. Móc nối toàn bộ danh sách Đánh giá
      const lopCuaGS = (listGSMH || []).filter(l => Number(l.magiasu) === Number(giasu.magiasu));
      const mangMaLop = lopCuaGS.map(l => Number(l.magiasu_monhoc));

      const dkCuaGS = (listDK || []).filter(dk => mangMaLop.includes(Number(dk.magiasu_monhoc)));
      const utCuaGS = (listUT || []).filter(ut => Number(ut.magiasu) === Number(giasu.magiasu) && Number(ut.trangthai) === 1);

      const mangMaDK = dkCuaGS.map(dk => Number(dk.madangky));
      const mangMaYC = utCuaGS.map(ut => Number(ut.mayeucau));

      const danhGiaGoc = (listDG || []).filter(dg =>
        (dg.madangky && mangMaDK.includes(Number(dg.madangky))) ||
        (dg.mayeucau && mangMaYC.includes(Number(dg.mayeucau)))
      );

      const danhGiaHoanChinh = danhGiaGoc.map(dg => {
        let tenMon = 'Môn học';
        let tenPhuHuynh = 'Học viên hệ thống';

        if (dg.madangky) {
          const donDK = dkCuaGS.find(dk => Number(dk.madangky) === Number(dg.madangky));
          const lopHoc = lopCuaGS.find(l => Number(l.magiasu_monhoc) === Number(donDK?.magiasu_monhoc));
          const mon = monHocMaster.find(m => Number(m.mamonhoc) === Number(lopHoc?.mamonhoc));
          const nd = (listND || []).find(n => Number(n.id || n.manguoidung) === Number(donDK?.manguoidung));
          if (mon) tenMon = mon.tenmonhoc;
          if (nd) tenPhuHuynh = nd.name || nd.hoten;
        } else if (dg.mayeucau) {
          const yeuCau = (listYC || []).find(yc => Number(yc.mayeucau) === Number(dg.mayeucau));
          const mon = monHocMaster.find(m => Number(m.mamonhoc) === Number(yeuCau?.mamonhoc));
          const nd = (listND || []).find(n => Number(n.id || n.manguoidung) === Number(yeuCau?.manguoidung));
          if (mon) tenMon = mon.tenmonhoc;
          if (nd) tenPhuHuynh = nd.name || nd.hoten;
        }

        return { ...dg, tenMonHoc: tenMon, tenNguoiDanhGia: tenPhuHuynh };
      });

      setDanhSachBangCap(bangCapCuaGiaSu);
      setMonHocCuaGiaSu(monHocGS);
      setDanhSachDanhGia(danhGiaHoanChinh.reverse());

    } catch (err) {
      console.error("Lỗi lấy chi tiết gia sư:", err);
      setDanhSachBangCap([]);
      setMonHocCuaGiaSu([]);
      setDanhSachDanhGia([]);
    }

    setLoadingChiTiet(false);
  };

  const dongModal = () => {
    setGiaSuDuocChon(null);
    setDanhSachBangCap([]);
    setMonHocCuaGiaSu([]);
    setDanhSachDanhGia([]);
  };

  const handleClickMonHoc = (mamonhoc) => {
    dongModal();
    navigate(`/tim-mon-hoc?mamonhoc=${mamonhoc}`);
  };

  const danhSachHienThi = danhSachGiaSu.filter(gs =>
    gs.hoten.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  return (
    <div className="tgs-wrapper">

      <section className="tgs-hero">
        <div className="tgs-container tgs-text-center">
          <h1 className="tgs-hero-title">Tìm Gia Sư Phù Hợp</h1>
          <p className="tgs-hero-desc">
            Kết nối với đội ngũ gia sư uy tín, trình độ cao tại Đà Nẵng. Chúng tôi cam kết chất lượng dạy và học tốt nhất cho tương lai của bạn.
          </p>
        </div>
      </section>

      <section className="tgs-filter-section">
        <div className="tgs-container relative-z">
          <div className="tgs-filter-card tgs-filter-card-custom">
            <div className="tgs-filter-item">
              <label className="tgs-filter-label">Tìm kiếm theo tên Gia sư</label>
              <div className="tgs-filter-input-group">
                <input
                  type="text"
                  className="tgs-search-input"
                  placeholder="Nhập tên gia sư cần tìm..."
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                />
                <button className="tgs-btn-search-custom">
                  <span className="material-symbols-outlined">search</span> Tìm
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tgs-list-section">
        <div className="tgs-container">
          <div className="tgs-list-header">
            <h2>Danh sách gia sư tiêu biểu</h2>
            <span>Hiển thị {danhSachHienThi.length} gia sư</span>
          </div>

          {isLoading ? (
            <div className="tgs-state-msg">
              <span className="material-symbols-outlined tgs-spin tgs-icon-large">sync</span>
              <p>Đang tải dữ liệu gia sư từ hệ thống...</p>
            </div>
          ) : error ? (
            <div className="tgs-state-msg tgs-error">
              <p>{error}</p>
            </div>
          ) : danhSachHienThi.length === 0 ? (
            <div className="tgs-state-msg">
              <p>Không tìm thấy gia sư nào khớp với từ khóa "{tuKhoa}"!</p>
            </div>
          ) : (
            <div className="tgs-cards-grid">
              {danhSachHienThi.map((giasu) => (
                <div key={giasu.magiasu} className="tgs-card">

                  <div className="tgs-card-avatar-wrapper">
                    <img
                      alt="Avatar Gia sư"
                      src={giasu.anhdaidien && giasu.anhdaidien !== 'string' ? giasu.anhdaidien : `https://ui-avatars.com/api/?name=${encodeURIComponent(giasu.hoten)}&background=005088&color=fff&size=120`}
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=GS&background=005088&color=fff&size=120` }}
                      className="tgs-card-avatar-img"
                    />
                  </div>

                  <div className="tgs-card-body tgs-card-body-custom">
                    <div className="tgs-card-top-custom">
                      <div className="tgs-tutor-info">
                        <h3 className="tgs-tutor-name">{giasu.hoten}</h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>star</span>
                          <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>
                            {giasu.danhGiaBase > 0 ? `${giasu.danhGiaBase} / 5` : 'Chưa có sao'}
                          </strong>
                          {giasu.luotDanhGiaBase > 0 && (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>({giasu.luotDanhGiaBase} phản hồi)</span>
                          )}
                        </div>

                        <p className="tgs-tutor-subinfo">
                          <span className="material-symbols-outlined tgs-tutor-subinfo-icon">school</span>
                          {giasu.namsinh ? ` Sinh năm ${giasu.namsinh}` : ' Giáo viên/Sinh viên'}
                        </p>
                      </div>
                    </div>

                    <div className="tgs-card-desc-custom">
                      "{giasu.gioithieubanthan || 'Gia sư chưa cập nhật lời giới thiệu.'}"
                    </div>

                    <div className="tgs-card-footer-custom">
                      <div className="tgs-price-info">
                        <span className="tgs-price-label-custom">Giới tính</span>
                        <span className="tgs-price-value-custom">{giasu.gioitinh === 0 ? 'Nam' : 'Nữ'}</span>
                      </div>
                      <div className="tgs-actions">
                        <button className="tgs-btn-detail-custom" onClick={() => handleXemChiTiet(giasu)}>
                          Xem hồ sơ
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= MODAL CHI TIẾT GIA SƯ ================= */}
      {giaSuDuocChon && (
        <div className="tgs-modal-overlay" onClick={dongModal}>
          <div className="tgs-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="tgs-modal-close" onClick={dongModal}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="tgs-modal-header">
              <img
                src={giaSuDuocChon.anhdaidien && giaSuDuocChon.anhdaidien !== 'string' ? giaSuDuocChon.anhdaidien : `https://ui-avatars.com/api/?name=${encodeURIComponent(giaSuDuocChon.hoten)}&background=005088&color=fff&size=150`}
                alt="Avatar"
                className="tgs-modal-avatar"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=GS&background=005088&color=fff&size=150` }}
              />
              <div className="tgs-modal-info">
                <h2>{giaSuDuocChon.hoten}</h2>
                <div className="tgs-modal-tags">
                  <span className="tgs-modal-tag">
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>cake</span>
                    {giaSuDuocChon.namsinh || 'N/A'}
                  </span>
                  <span className="tgs-modal-tag">
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>wc</span>
                    {giaSuDuocChon.gioitinh === 0 ? 'Nam' : 'Nữ'}
                  </span>
                  {giaSuDuocChon.danhGiaBase > 0 && (
                    <span className="tgs-modal-tag" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                      <span className="material-symbols-outlined" style={{fontSize: '18px', fontVariationSettings: "'FILL' 1"}}>star</span>
                      {giaSuDuocChon.danhGiaBase} ⭐
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="tgs-modal-body">
              <h3 className="tgs-modal-section-title">Giới thiệu bản thân</h3>
              <div className="tgs-modal-desc">
                {giaSuDuocChon.gioithieubanthan || 'Gia sư này chưa cập nhật thông tin giới thiệu.'}
              </div>

              {loadingChiTiet ? (
                <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: '20px' }}>Đang tải dữ liệu chi tiết...</div>
              ) : (
                <>
                  {/* BẰNG CẤP */}
                  <h3 className="tgs-modal-section-title">Bằng cấp / Chứng chỉ ({danhSachBangCap.length})</h3>
                  {danhSachBangCap.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '24px' }}>Gia sư chưa cập nhật bằng cấp.</p>
                  ) : (
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px' }}>
                      {danhSachBangCap.map((bc, i) => (
                        <li key={i} style={{ marginBottom: '8px', color: '#1e293b', lineHeight: '1.6' }}>
                          <strong style={{ color: '#005088' }}>{bc.tenbangcap}</strong>
                          {bc.chuyennganh ? ` - Chuyên ngành: ${bc.chuyennganh}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CÁC LỚP ĐANG DẠY */}
                  <h3 className="tgs-modal-section-title">Các lớp đang nhận dạy ({monHocCuaGiaSu.length})</h3>
                  {monHocCuaGiaSu.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '24px' }}>Gia sư chưa đăng ký lớp/môn học nào.</p>
                  ) : (
                    <div className="tgs-class-grid" style={{ marginBottom: '24px' }}>
                      {monHocCuaGiaSu.map((mh, i) => (
                        <div
                          key={i}
                          className="tgs-class-card"
                          onClick={() => handleClickMonHoc(mh.mamonhoc)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="tgs-class-name">{mh.tenmonhoc}</div>

                          <div className="tgs-class-detail">
                            <span className="material-symbols-outlined" style={{fontSize: '16px', color: '#64748b'}}>location_on</span>
                            <span>Khu vực: <strong>{mh.tenkhuvuc}</strong></span>
                          </div>

                          <div className="tgs-class-detail">
                            <span className="material-symbols-outlined" style={{fontSize: '16px', color: '#64748b'}}>payments</span>
                            <span>
                              Học phí dự kiến: <strong>{mh.hocphimotbuoi ? `${mh.hocphimotbuoi.toLocaleString()} đ/buổi` : 'Thỏa thuận'}</strong>
                            </span>
                          </div>

                          <button style={{marginTop: '16px', width: '100%', padding: '10px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s'}} onMouseOver={(e) => e.target.style.background = '#bae6fd'} onMouseOut={(e) => e.target.style.background = '#e0f2fe'}>
                            Đăng ký lớp này
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TOÀN BỘ ĐÁNH GIÁ CỦA HỌC VIÊN KHÓA TRƯỚC */}
                  <h3 className="tgs-modal-section-title">Đánh giá & Nhận xét từ học viên ({danhSachDanhGia.length})</h3>
                  {danhSachDanhGia.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có lượt phản hồi nào cho gia sư này.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                      {danhSachDanhGia.map((dg, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: i < dg.sodiem ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                              ))}
                              <strong style={{ color: '#0f172a', fontSize: '13.5px', marginLeft: '4px' }}>{dg.sodiem} Sao</strong>
                            </div>
                            <span style={{ fontSize: '12.5px', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                              Môn học: {dg.tenMonHoc}
                            </span>
                          </div>

                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
                            "{dg.noidung || 'Không có bình luận nhận xét chi tiết.'}"
                          </p>

                          <div style={{ fontSize: '12.5px', color: '#64748b', textAlign: 'right' }}>
                            👤 Viết bởi phụ huynh: <strong style={{ color: '#334155' }}>{dg.tenNguoiDanhGia}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TimGiaSu;
