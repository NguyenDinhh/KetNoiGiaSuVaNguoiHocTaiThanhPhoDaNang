import React, { useState, useEffect } from 'react';
import BangCap_Service from '../../services/BangCap_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import BangCap_MonHoc_Service from '../../services/BangCap_MonHoc_Service';
// THÊM DÒNG IMPORT NÀY ĐỂ KÉO DATA HỆ LỚP
import HeLop_Service from '../../services/HeLop_Service';

const BangCapManagementTable = () => {
  const [tabHienTai, setTabHienTai] = useState('bangcap');

  const [danhSachBangCap, setDanhSachBangCap] = useState([]);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachTieuChuan, setDanhSachTieuChuan] = useState([]);
  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [thongKe, setThongKe] = useState({ tongSo: 0 });
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const [hienThiFormBangCap, setHienThiFormBangCap] = useState(false);
  const [formDuLieuBangCap, setFormDuLieuBangCap] = useState({ tenbangcap: "" });
  const [idBangCapDangSua, setIdBangCapDangSua] = useState(null);

  // STATE DÀNH RIÊNG CHO MODAL CHI TIẾT
  const [hienThiModalChiTiet, setHienThiModalChiTiet] = useState(false);
  const [bangCapDangXem, setBangCapDangXem] = useState(null);
  const [danhSachTick, setDanhSachTick] = useState([]);
  const [tuKhoaModal, setTuKhoaModal] = useState("");
  const [heLopDangChonModal, setHeLopDangChonModal] = useState("ALL"); // Trạng thái Sidebar

  useEffect(() => {
    taiDuLieuTongHop();
  }, []);

  const taiDuLieuTongHop = () => {
    setDangTai(true);
    // Tải song song 5 bảng dữ liệu cùng lúc cho mượt
    Promise.all([
      BangCap_Service.layDanhSachBangCap(),
      MonHoc_Service.layDanhSachMonHoc(),
      BangCap_MonHoc_Service.layDanhSach(),
      BangCap_Service.layThongKeBangCap(),
      HeLop_Service.layDanhSachHeLop() // Kéo thêm Hệ Lớp
    ])
    .then(([bangCaps, monHocs, tieuChuans, tk, heLops]) => {
      setDanhSachBangCap(bangCaps);
      setDanhSachMonHoc(monHocs);
      setDanhSachTieuChuan(tieuChuans);
      setThongKe(tk);
      setDanhSachHeLop(heLops);
      setDangTai(false);
    })
    .catch((loi) => {
      console.error("Lỗi tải dữ liệu:", loi);
      setDangTai(false);
    });
  };

  const taiLaiTieuChuan = () => {
    BangCap_MonHoc_Service.layDanhSach().then(setDanhSachTieuChuan).catch(console.error);
  };

  const xuLyBamNutSua = (bangCap) => {
    setIdBangCapDangSua(bangCap.mabangcap);
    setFormDuLieuBangCap({ tenbangcap: bangCap.tenbangcap });
    setHienThiFormBangCap(true);
  };

  const xuLyBamNutThemMoi = () => {
    setIdBangCapDangSua(null);
    setFormDuLieuBangCap({ tenbangcap: "" });
    setHienThiFormBangCap(true);
  };

  const xuLyXoa = (bangCap) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN bằng cấp "${bangCap.tenbangcap}" không?`)) {
      BangCap_Service.xoaBangCap(bangCap.mabangcap).then(() => taiDuLieuTongHop());
    }
  };

  const xuLyKhoa = (bangCap) => {
    if (window.confirm(`Bạn có muốn KHÓA bằng cấp "${bangCap.tenbangcap}" không? Bằng cấp sẽ không hiển thị với người dùng.`)) {
      BangCap_Service.khoaBangCap(bangCap.mabangcap).then(() => taiDuLieuTongHop());
    }
  };

  const xuLyMoKhoa = (bangCap) => {
    if (window.confirm(`Bạn có muốn MỞ KHÓA bằng cấp "${bangCap.tenbangcap}" không?`)) {
      BangCap_Service.moKhoaBangCap(bangCap.mabangcap).then(() => taiDuLieuTongHop());
    }
  };

  const xuLyGuiFormBangCap = (suKien) => {
    suKien.preventDefault();
    const payload = { tenbangcap: formDuLieuBangCap.tenbangcap };
    if (idBangCapDangSua) {
      BangCap_Service.capNhatBangCap(idBangCapDangSua, payload).then(() => {
        setHienThiFormBangCap(false); taiDuLieuTongHop();
      });
    } else {
      BangCap_Service.themBangCapMoi(payload).then(() => {
        setHienThiFormBangCap(false); taiDuLieuTongHop();
      });
    }
  };

  const xuLyMoModalChiTiet = (bangCap) => {
    setBangCapDangXem(bangCap);
    setDanhSachTick([]);
    setTuKhoaModal("");
    setHeLopDangChonModal("ALL"); // Reset sidebar về mặc định
    setHienThiModalChiTiet(true);
  };

  const xuLyTickMon = (mamonhoc) => {
    if (danhSachTick.includes(mamonhoc)) {
      setDanhSachTick(danhSachTick.filter(id => id !== mamonhoc));
    } else {
      setDanhSachTick([...danhSachTick, mamonhoc]);
    }
  };

  const xuLyLuuHangLoat = () => {
    if (danhSachTick.length === 0) return;

    const cacYeuCauThem = danhSachTick.map(mamonhoc => {
      const payload = {
        mabangcap: bangCapDangXem.mabangcap,
        mamonhoc: parseInt(mamonhoc)
      };
      return BangCap_MonHoc_Service.ganMonHoc(payload);
    });

    Promise.all(cacYeuCauThem)
      .then(() => {
        alert(`Đã gán thành công ${danhSachTick.length} môn học!`);
        setDanhSachTick([]);
        taiLaiTieuChuan();
      })
      .catch(() => {
        alert("Có lỗi xảy ra khi gán hàng loạt.");
        taiLaiTieuChuan();
      });
  };

  const xuLyHuyMon = (maBangCap_MonHoc, tenMonHoc) => {
    if (window.confirm(`Bạn muốn gỡ môn "${tenMonHoc}" khỏi bằng cấp này?`)) {
      BangCap_MonHoc_Service.huyMonHoc(maBangCap_MonHoc)
        .then(() => taiLaiTieuChuan())
        .catch(() => alert("Hủy thất bại!"));
    }
  };

  const danhSachDaLoc = danhSachBangCap.filter((bangCap) => {
    if (tuKhoaTimKiem.trim() === "") return true;
    return bangCap.tenbangcap.toLowerCase().includes(tuKhoaTimKiem.trim().toLowerCase());
  });

  return (
    <>
      <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setTabHienTai('bangcap')}
          style={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', borderBottom: tabHienTai === 'bangcap' ? '3px solid var(--admin-primary)' : '3px solid transparent', color: tabHienTai === 'bangcap' ? 'var(--admin-primary)' : '#64748b' }}
        >
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '20px' }}>workspace_premium</span>
          Quản lý Bằng cấp
        </button>

        <button
          onClick={() => setTabHienTai('tieuchuan')}
          style={{ padding: '12px 16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', borderBottom: tabHienTai === 'tieuchuan' ? '3px solid var(--admin-primary)' : '3px solid transparent', color: tabHienTai === 'tieuchuan' ? 'var(--admin-primary)' : '#64748b' }}
        >
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '20px' }}>rule_folder</span>
          Tiêu chuẩn Bằng cấp
        </button>
      </div>

      {/* ================= TAB 1: QUẢN LÝ BẰNG CẤP ================= */}
      {tabHienTai === 'bangcap' && (
        <div className="tab-content-fade-in">
          <div className="admin-bento-grid">
            <div className="admin-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-round"><span className="material-symbols-outlined">workspace_premium</span></div>
                <h3>Tổng loại bằng cấp</h3>
              </div>
              <div className="stat-number">{thongKe.tongSo}</div>
            </div>

            <div className="controls-filter-box" style={{ gridColumn: 'span 9' }}>
              <div className="search-filter-inline-row">
                <div className="inline-search-input-group">
                  <span className="material-symbols-outlined">search</span>
                  <input type="text" placeholder="Tìm kiếm tên bằng cấp..." value={tuKhoaTimKiem} onChange={(e) => setTuKhoaTimKiem(e.target.value)} />
                </div>
                <button type="button" className="btn-admin-filter"><span className="material-symbols-outlined">filter_list</span>Lọc</button>
              </div>
            </div>
          </div>

          <div className="admin-table-card" style={{ marginTop: '24px' }}>
            <div className="user-table-header-bar">
              <span className="user-count-text">Hiển thị {danhSachDaLoc.length} bằng cấp</span>
              <button type="button" className="btn-export-excel" style={{ gap: '6px' }} onClick={xuLyBamNutThemMoi}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                Thêm bằng cấp
              </button>
            </div>
            <div className="table-responsive-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%', textAlign: 'center' }}>Mã bằng cấp</th>
                    <th style={{ width: '50%' }}>Tên bằng cấp</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dangTai ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>Đang tải danh mục...</td></tr>
                  ) : danhSachDaLoc.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>Không có dữ liệu.</td></tr>
                  ) : (
                    danhSachDaLoc.map((bangCap) => (
                      <tr key={bangCap.mabangcap}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>#{bangCap.mabangcap}</td>
                        <td><span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>{bangCap.tenbangcap}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          {bangCap.trangthai === 1 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0, 107, 84, 0.1)', color: 'var(--admin-secondary)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                              Hoạt động
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                              Bị khóa
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="btn-table-action-view" title="Chỉnh sửa" onClick={() => xuLyBamNutSua(bangCap)}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          {bangCap.trangthai === 1 ? (
                            <button type="button" className="btn-table-action-view" title="Khóa bằng cấp" style={{ color: '#f59e0b' }} onClick={() => xuLyKhoa(bangCap)}>
                              <span className="material-symbols-outlined">lock</span>
                            </button>
                          ) : (
                            <button type="button" className="btn-table-action-view" title="Mở khóa bằng cấp" style={{ color: '#10b981' }} onClick={() => xuLyMoKhoa(bangCap)}>
                              <span className="material-symbols-outlined">lock_open</span>
                            </button>
                          )}
                          <button type="button" className="btn-table-action-view" title="Xóa vĩnh viễn" style={{ color: 'var(--admin-error)' }} onClick={() => xuLyXoa(bangCap)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TIÊU CHUẨN BẰNG CẤP ================= */}
      {tabHienTai === 'tieuchuan' && (
        <div className="tab-content-fade-in">
          <div className="admin-table-card">
            <div className="user-table-header-bar">
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--admin-primary)' }}>Thiết lập Tiêu chuẩn</h2>
                <span className="user-count-text">Quản lý những môn học được phép giảng dạy đối với từng loại bằng cấp</span>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Tên Bằng cấp</th>
                    <th style={{ width: '55%' }}>Danh sách môn học được phép dạy</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSachDaLoc.map((bangCap) => {
                    const cacMonDaGan = danhSachTieuChuan.filter(tc => tc.mabangcap === bangCap.mabangcap);
                    return (
                      <tr key={bangCap.mabangcap}>
                        <td><span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>{bangCap.tenbangcap}</span></td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {cacMonDaGan.length === 0 ? (
                              <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Chưa có môn nào được gán...</span>
                            ) : (
                              cacMonDaGan.map((chiTiet) => {
                                const tenMon = danhSachMonHoc.find(m => m.mamonhoc === chiTiet.mamonhoc)?.tenmonhoc || "Môn không xác định";
                                return (
                                  <span key={chiTiet.mabangcap_monhoc} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                                    {tenMon}
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px', cursor: 'pointer', color: '#ef4444' }} onClick={() => xuLyHuyMon(chiTiet.mabangcap_monhoc, tenMon)} title="Gỡ môn này">close</span>
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" onClick={() => xuLyMoModalChiTiet(bangCap)} style={{ backgroundColor: 'rgba(0, 80, 136, 0.1)', color: 'var(--admin-primary)', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FORM ================= */}

      {hienThiFormBangCap && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="admin-modal-box" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>{idBangCapDangSua ? "Cập nhật bằng cấp" : "Thêm bằng cấp mới"}</h2>
            <form onSubmit={xuLyGuiFormBangCap} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" name="tenbangcap" required style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieuBangCap.tenbangcap} onChange={(e) => setFormDuLieuBangCap({ tenbangcap: e.target.value })} placeholder="Tên bằng cấp..." />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setHienThiFormBangCap(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ background: 'var(--admin-primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GÁN/HỦY HÀNG LOẠT + SIDEBAR LỌC HỆ LỚP */}
      {hienThiModalChiTiet && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          {/* Mở rộng bề ngang Modal lên 850px để nhét vừa Sidebar */}
          <div className="admin-modal-box" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '850px', height: '80vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--admin-primary)' }}>
                  Chi tiết Tiêu chuẩn: {bangCapDangXem?.tenbangcap}
                </h2>

                {/* Ô TÌM KIẾM */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', width: '350px', backgroundColor: '#f8fafc' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8', marginRight: '8px' }}>search</span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm môn học (VD: Toán, Lý...)"
                    value={tuKhoaModal}
                    onChange={(e) => setTuKhoaModal(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
                  />
                </div>
              </div>

              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={() => setHienThiModalChiTiet(false)}>
                <span className="material-symbols-outlined" style={{ color: '#64748b' }}>close</span>
              </button>
            </div>

            {/* BỐ CỤC CHÍNH: SIDEBAR (Trái) & DANH SÁCH MÔN (Phải) */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

              {/* SIDEBAR BÊN TRÁI: DANH SÁCH HỆ LỚP */}
              <div style={{ width: '220px', borderRight: '1px solid #e2e8f0', paddingRight: '16px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Bộ lọc Hệ lớp
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li
                    onClick={() => setHeLopDangChonModal("ALL")}
                    style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: heLopDangChonModal === "ALL" ? 600 : 500, backgroundColor: heLopDangChonModal === "ALL" ? 'rgba(0, 80, 136, 0.1)' : 'transparent', color: heLopDangChonModal === "ALL" ? 'var(--admin-primary)' : '#475569', transition: 'all 0.2s' }}
                  >
                    Tất cả Hệ lớp
                  </li>
                  {danhSachHeLop.map(hl => (
                    <li
                      key={hl.mahelop}
                      onClick={() => setHeLopDangChonModal(hl.mahelop)}
                      style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: heLopDangChonModal === hl.mahelop ? 600 : 500, backgroundColor: heLopDangChonModal === hl.mahelop ? 'rgba(0, 80, 136, 0.1)' : 'transparent', color: heLopDangChonModal === hl.mahelop ? 'var(--admin-primary)' : '#475569', transition: 'all 0.2s' }}
                    >
                      {hl.tenhelop}
                    </li>
                  ))}
                </ul>
              </div>

              {/* VÙNG DANH SÁCH BÊN PHẢI */}
              <div style={{ flex: 1, paddingLeft: '20px', overflowY: 'auto' }}>

                {/* PHẦN 1: MÔN ĐÃ GÁN */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Môn đã đăng ký
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {danhSachTieuChuan
                      .filter(tc => tc.mabangcap === bangCapDangXem?.mabangcap)
                      .map(tc => {
                        const mon = danhSachMonHoc.find(m => m.mamonhoc === tc.mamonhoc);
                        // Bóc thêm mahelop để lấy dữ liệu lọc
                        return { ...tc, tenMon: mon ? mon.tenmonhoc : "", maHeLop: mon ? mon.mahelop : null };
                      })
                      .filter(item => {
                        const khopTimKiem = item.tenMon.toLowerCase().includes(tuKhoaModal.toLowerCase());
                        const khopHeLop = heLopDangChonModal === "ALL" || item.maHeLop === heLopDangChonModal;
                        return khopTimKiem && khopHeLop;
                      })
                      .map((item) => (
                        <span key={item.mabangcap_monhoc} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 107, 84, 0.1)', color: 'var(--admin-secondary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0, 107, 84, 0.2)', fontSize: '13px', fontWeight: 500 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                          {item.tenMon}
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '16px', cursor: 'pointer', color: '#ef4444', marginLeft: '4px' }}
                            onClick={() => xuLyHuyMon(item.mabangcap_monhoc, item.tenMon)}
                            title="Hủy đăng ký môn này"
                          >cancel</span>
                        </span>
                    ))}
                  </div>
                </div>

                {/* PHẦN 2: MÔN CHƯA GÁN */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Môn học có thể thêm
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {danhSachMonHoc
                      .filter(mon => {
                        const chuaGan = !danhSachTieuChuan.some(tc => tc.mabangcap === bangCapDangXem?.mabangcap && tc.mamonhoc === mon.mamonhoc);
                        const khopTimKiem = mon.tenmonhoc.toLowerCase().includes(tuKhoaModal.toLowerCase());
                        const khopHeLop = heLopDangChonModal === "ALL" || mon.mahelop === heLopDangChonModal;
                        return chuaGan && khopTimKiem && khopHeLop;
                      })
                      .map((mon) => (
                        <label key={mon.mamonhoc} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '6px', border: danhSachTick.includes(mon.mamonhoc) ? '1px solid var(--admin-primary)' : '1px solid #e2e8f0', backgroundColor: danhSachTick.includes(mon.mamonhoc) ? 'rgba(0, 80, 136, 0.05)' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <input
                            type="checkbox"
                            style={{ width: '16px', height: '16px', accentColor: 'var(--admin-primary)' }}
                            checked={danhSachTick.includes(mon.mamonhoc)}
                            onChange={() => xuLyTickMon(mon.mamonhoc)}
                          />
                          <span style={{ fontSize: '14px', fontWeight: 500, color: danhSachTick.includes(mon.mamonhoc) ? 'var(--admin-primary)' : '#475569' }}>
                            {mon.tenmonhoc}
                          </span>
                        </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-secondary)' }}>
                Đang tick chọn: {danhSachTick.length} môn
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={() => setHienThiModalChiTiet(false)}>Đóng</button>
                <button
                  type="button"
                  onClick={xuLyLuuHangLoat}
                  disabled={danhSachTick.length === 0}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: danhSachTick.length === 0 ? '#94a3b8' : 'var(--admin-primary)', color: '#fff', cursor: danhSachTick.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'text-bottom', marginRight: '4px' }}>save</span>
                  Lưu thay đổi
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default BangCapManagementTable;
