import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import CÁC SERVICE CẦN THIẾT
import GiaSu_Service from '../../services/GiaSu_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';
import DanhGia_Service from '../../services/DanhGia_Service';
import GiaSu_BangCap_Service from '../../services/GiaSu_BangCap_Service';
import BangCap_Service from '../../services/BangCap_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import KhuVuc_Service from '../../services/KhuVuc_Service';
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';

const TutorCard = () => {
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // --- STATE CHO MODAL CHI TIẾT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const [danhSachBangCap, setDanhSachBangCap] = useState([]);
  const [monHocCuaGiaSu, setMonHocCuaGiaSu] = useState([]);
  const [danhSachDanhGia, setDanhSachDanhGia] = useState([]);
  const [loadingChiTiet, setLoadingChiTiet] = useState(false);

  useEffect(() => {
    const fetchGiaSu = async () => {
      try {
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

        const giaSuVoiDanhGia = tatCaGiaSu
          .filter(gs => Number(gs.trangthaiduyet) === 1)
          .map(gs => {
            const nd = tatCaNguoiDung.find(n => String(n.id) === String(gs.manguoidung)) || {};

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
              ? (danhGiaCuaGS.reduce((sum, item) => sum + Number(item.sodiem || item.diem || item.rating || 0), 0) / luotDG).toFixed(1)
              : 0;

            return {
              ...gs,
              hoten: nd.name || nd.hoten || 'Gia sư ẩn danh',
              anhdaidien: nd.avatar || nd.anhdaidien || '',
              danhGiaBase: Number(diemTB),
              luotDanhGiaBase: luotDG
            };
          });

        const top3GiaSu = giaSuVoiDanhGia
          .sort((a, b) => b.danhGiaBase - a.danhGiaBase || b.luotDanhGiaBase - a.luotDanhGiaBase)
          .slice(0, 3);

        setDanhSachGiaSu(top3GiaSu);
      } catch (error) {
        console.error("Lỗi khi tải danh sách gia sư:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiaSu();
  }, []);

  // --- HÀM XỬ LÝ MỞ MODAL VÀ TẢI CHI TIẾT ---
  const handleXemChiTiet = async (giasu) => {
    setSelectedTutor(giasu);
    setIsModalOpen(true);
    setLoadingChiTiet(true);

    try {
      // Kéo toàn bộ bảng để map dữ liệu chi tiết
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

      // 3. Map Đánh giá
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTutor(null);
    setDanhSachBangCap([]);
    setMonHocCuaGiaSu([]);
    setDanhSachDanhGia([]);
  };

  const handleClickMonHoc = (mamonhoc) => {
    closeModal();
    navigate(`/tim-mon-hoc?mamonhoc=${mamonhoc}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#005088' }}>Đang tìm kiếm các gia sư xuất sắc nhất...</div>;
  }

  if (danhSachGiaSu.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Hiện chưa có gia sư nào trên hệ thống.</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {danhSachGiaSu.map((gs, index) => (
          <div className="tutor-card" key={gs.magiasu || index}>
            <div className="tutor-card-header-bg">
              {/* TOP LABEL */}

              <div className="tutor-avatar-badge" style={{ overflow: 'hidden', padding: 0, border: '3px solid #fff', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {gs.anhdaidien && gs.anhdaidien.trim() !== '' && gs.anhdaidien !== 'string' ? (
                  <img src={gs.anhdaidien} alt={gs.hoten} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#005088' }}>
                    {gs.hoten ? gs.hoten.charAt(0).toUpperCase() : '🐻'}
                  </span>
                )}
              </div>
            </div>

            <h3 className="tutor-name">{gs.hoten}</h3>

            <div className="tutor-details-text">
              <p><span>Hiện là:</span> {gs.gioitinh === 0 ? "Thầy giáo" : "Cô giáo"}</p>
              <p><span>Hệ lớp:</span> Đa dạng hệ lớp</p>
              <p><span>Môn dạy:</span> Đang cập nhật</p>
            </div>

            {/* ĐIỂM SAO THỰC TẾ */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>star</span>
              <strong style={{ color: '#1e293b', fontSize: '12px' }}>
                {gs.danhGiaBase > 0 ? `${gs.danhGiaBase} / 5.0` : 'Chưa có sao'}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                ({gs.luotDanhGiaBase} nhận xét)
              </span>
            </div>

            {/* BUTTON GỌI HÀM LẤY CHI TIẾT */}
            <button className="btn-tutor-detail" onClick={() => handleXemChiTiet(gs)}>
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>

      {/* ================= MODAL CHI TIẾT GIA SƯ ================= */}
      {isModalOpen && selectedTutor && (
        <div className="tutor-modal-overlay" onClick={closeModal}>
          <div className="tutor-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="tutor-modal-close" onClick={closeModal}>✕</button>

            <div className="tutor-modal-header">
              <div className="tutor-modal-avatar">
                {selectedTutor.anhdaidien && selectedTutor.anhdaidien.trim() !== '' && selectedTutor.anhdaidien !== 'string' ? (
                  <img src={selectedTutor.anhdaidien} alt={selectedTutor.hoten} />
                ) : (
                  <span>
                    {selectedTutor.hoten ? selectedTutor.hoten.charAt(0).toUpperCase() : '🐻'}
                  </span>
                )}
              </div>
              <div className="tutor-modal-info">
                <h2>{selectedTutor.hoten}</h2>
                <div className="tutor-modal-tags">
                  <span className="tutor-tag">Giới tính: {selectedTutor.gioitinh === 0 ? "Nam" : "Nữ"}</span>
                  <span className="tutor-tag">Năm sinh: {selectedTutor.namsinh || 'Chưa cập nhật'}</span>
                  {selectedTutor.danhGiaBase > 0 && (
                    <span className="tutor-tag" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <span className="material-symbols-outlined" style={{fontSize: '16px', verticalAlign: 'text-bottom'}}>star</span>
                      {selectedTutor.danhGiaBase} Điểm
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="tutor-modal-body">
              <div className="tutor-modal-section">
                <h4>Giới thiệu bản thân</h4>
                <p>{selectedTutor.gioithieubanthan || "Gia sư chưa cập nhật lời giới thiệu."}</p>
              </div>

              {loadingChiTiet ? (
                <div className="tutor-modal-loading">
                  Đang tải dữ liệu chi tiết...
                </div>
              ) : (
                <>
                  {/* --- BẰNG CẤP --- */}
                  <div className="tutor-modal-section">
                    <h4>Bằng cấp / Chứng chỉ ({danhSachBangCap.length})</h4>
                    {danhSachBangCap.length === 0 ? (
                      <p className="tutor-modal-empty">Gia sư chưa cập nhật bằng cấp.</p>
                    ) : (
                      <ul className="tutor-degree-list">
                        {danhSachBangCap.map((bc, i) => (
                          <li key={i} className="tutor-degree-item">
                            <strong className="tutor-degree-name">{bc.tenbangcap}</strong>
                            {bc.chuyennganh ? ` - Chuyên ngành: ${bc.chuyennganh}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* --- LỚP ĐANG DẠY --- */}
                  <div className="tutor-modal-section">
                    <h4>Các lớp đang nhận dạy ({monHocCuaGiaSu.length})</h4>
                    {monHocCuaGiaSu.length === 0 ? (
                      <p className="tutor-modal-empty">Gia sư chưa đăng ký lớp/môn học nào.</p>
                    ) : (
                      <div className="tutor-class-grid">
                        {monHocCuaGiaSu.map((mh, i) => (
                          <div
                            key={i}
                            onClick={() => handleClickMonHoc(mh.mamonhoc)}
                            className="tutor-class-card"
                          >
                            <div className="tutor-class-title">{mh.tenmonhoc}</div>
                            <div className="tutor-class-detail">📍 {mh.tenkhuvuc}</div>
                            <div className="tutor-class-detail">
                              💰 {mh.hocphimotbuoi ? `${mh.hocphimotbuoi.toLocaleString()} đ/buổi` : 'Thỏa thuận'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* --- ĐÁNH GIÁ CỦA HỌC VIÊN --- */}
                  <div className="tutor-modal-section">
                    <h4>Đánh giá & Nhận xét từ học viên ({danhSachDanhGia.length})</h4>
                    {danhSachDanhGia.length === 0 ? (
                      <p className="tutor-modal-empty">Chưa có lượt phản hồi nào cho gia sư này.</p>
                    ) : (
                      <div className="tutor-review-list">
                        {danhSachDanhGia.map((dg, idx) => (
                          <div key={idx} className="tutor-review-card">
                            <div className="tutor-review-header">
                              <div className="tutor-review-stars">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: i < (dg.sodiem || dg.diem) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                ))}
                                <strong className="tutor-review-score">{dg.sodiem || dg.diem} Sao</strong>
                              </div>
                              <span className="tutor-review-subject">
                                {dg.tenMonHoc}
                              </span>
                            </div>
                            <p className="tutor-review-comment">
                              "{dg.noidung || 'Không có bình luận nhận xét chi tiết.'}"
                            </p>
                            <div className="tutor-review-footer">
                              👤 Phụ huynh: <strong className="tutor-review-author">{dg.tenNguoiDanhGia}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
             </div>
              </div>
      )}
    </>
  );
};

export default TutorCard;
