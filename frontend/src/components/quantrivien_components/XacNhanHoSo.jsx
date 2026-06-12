import React, { useState, useEffect } from 'react';

// Import các service kết nối API
import GiaSu_Service from '../../services/GiaSu_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import GiaSu_BangCap_Service from '../../services/GiaSu_BangCap_Service';
import BangCap_Service from '../../services/BangCap_Service';

const TutorVerifyTable = () => {
  const [activeTab, setActiveTab] = useState('hoso'); // 'hoso' hoặc 'bangcap'
  const [loading, setLoading] = useState(true);

  // STATE DANH SÁCH CHỜ DUYỆT (trangthaiduyet === 0)
  const [danhSachGiaSuChoDuyet, setDanhSachGiaSuChoDuyet] = useState([]);
  const [danhSachBangCapChoDuyet, setDanhSachBangCapChoDuyet] = useState([]);

  // STATE QUẢN LÝ MODAL
  const [chiTietGiaSu, setChiTietGiaSu] = useState(null);
  const [chiTietBangCap, setChiTietBangCap] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  // ================= TẢI VÀ GỘP DỮ LIỆU =================
  const loadTatCaDuLieuChoDuyet = async () => {
    setLoading(true);
    try {
      const [giasuRes, nguoidungRes, bangcapgsRes, danhmucBCRes] = await Promise.all([
        GiaSu_Service.layDanhSachGiaSu().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
        GiaSu_BangCap_Service.layDanhSachGiaSuBangCap().catch(() => []),
        BangCap_Service.layDanhSachBangCap().catch(() => [])
      ]);

      const tatCaGiaSu = Array.isArray(giasuRes) ? giasuRes : (giasuRes?.data || []);
      const tatCaNguoiDung = Array.isArray(nguoidungRes) ? nguoidungRes : (nguoidungRes?.data || []);
      const tatCaBangCapGS = Array.isArray(bangcapgsRes) ? bangcapgsRes : (bangcapgsRes?.data || []);
      const tatCaDanhMucBC = Array.isArray(danhmucBCRes) ? danhmucBCRes : (danhmucBCRes?.data || []);

      // 1. GỘP DỮ LIỆU GIA SƯ (HỒ SƠ)
      const dsGiaSu = tatCaGiaSu
        .filter(gs => Number(gs.trangthaiduyet) === 0)
        .map(gs => {
          const thongTinND = tatCaNguoiDung.find(nd => String(nd.id) === String(gs.manguoidung)) || {};
          return {
            ...gs,
            hoten: thongTinND.name || 'Chưa cập nhật tên',
            email: thongTinND.email || 'Không có email',
            sodienthoai: thongTinND.phone || 'Không có SĐT',
            anhdaidien: thongTinND.avatar || ''
          };
        });
      setDanhSachGiaSuChoDuyet(dsGiaSu);

      // 2. GỘP DỮ LIỆU BẰNG CẤP
      const dsBangCap = tatCaBangCapGS
        .filter(bc => Number(bc.trangthaiduyet) === 0)
        .map(bc => {
          const gsSoHuu = tatCaGiaSu.find(g => String(g.magiasu) === String(bc.magiasu)) || {};
          const ndSoHuu = tatCaNguoiDung.find(nd => String(nd.id) === String(gsSoHuu.manguoidung)) || {};
          const dmBangCap = tatCaDanhMucBC.find(dm => String(dm.mabangcap) === String(bc.mabangcap)) || {};

          return {
            ...bc,
            tenGiaSu: ndSoHuu.name || 'Gia sư ẩn danh',
            anhdaidienGS: ndSoHuu.avatar || '',
            tenLoaiBang: dmBangCap.tenbangcap || 'Chứng chỉ / Bằng cấp'
          };
        });
      setDanhSachBangCapChoDuyet(dsBangCap);

    } catch (error) {
      console.error("Lỗi khi gộp dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTatCaDuLieuChoDuyet();
  }, []);

  // ================= XỬ LÝ PHÊ DUYỆT / TỪ CHỐI HỒ SƠ GIA SƯ =================
  const handleDuyetHoSo = async (giaSu) => {
    if (window.confirm(`Xác nhận phê duyệt hồ sơ của gia sư: ${giaSu.hoten}?`)) {
      try {
        // 🟢 Cập nhật duyệt = 1 và xóa lý do từ chối (nếu có)
        await GiaSu_Service.suaGiaSu(giaSu.magiasu, { ...giaSu, trangthaiduyet: 1, lydotuchoi: null });
        alert("Đã duyệt hồ sơ gia sư thành công!");
        setChiTietGiaSu(null);
        loadTatCaDuLieuChoDuyet();
      } catch (error) {
        alert("Có lỗi xảy ra trong quá trình phê duyệt!");
      }
    }
  };

  const handleTuChoiHoSo = async (giaSu) => {
    // 🟢 Dùng window.prompt để lấy lý do từ admin
    const lyDo = window.prompt(`Nhập lý do TỪ CHỐI hồ sơ của gia sư: ${giaSu.hoten}?`, "");
    
    // Nếu admin bấm Cancel
    if (lyDo === null) return; 

    // Nếu admin để trống lý do
    if (lyDo.trim() === "") {
      return alert("Vui lòng nhập lý do từ chối để gia sư có thể khắc phục!");
    }

    try {
      // 🟢 Gửi trạng thái 2 kèm theo lý do
      await GiaSu_Service.suaGiaSu(giaSu.magiasu, { ...giaSu, trangthaiduyet: 2, lydotuchoi: lyDo.trim() });
      alert("Đã chuyển trạng thái hồ sơ sang 'Từ chối'!");
      setChiTietGiaSu(null);
      loadTatCaDuLieuChoDuyet();
    } catch (error) {
      alert("Có lỗi xảy ra trong quá trình cập nhật trạng thái!");
    }
  };

  // ================= XỬ LÝ PHÊ DUYỆT / TỪ CHỐI BẰNG CẤP =================
  const handleDuyetBangCap = async (bangCap) => {
    if (window.confirm(`Xác nhận phê duyệt chứng chỉ: ${bangCap.chuyennganh}?`)) {
      try {
        // 🟢 Cập nhật duyệt = 1 và xóa lý do từ chối (nếu có)
        await GiaSu_BangCap_Service.capNhatGiaSuBangCap(bangCap.mabangcapgiasu, { ...bangCap, trangthaiduyet: 1, lydotuchoi: null });
        alert("Đã duyệt bằng cấp thành công!");
        setChiTietBangCap(null);
        loadTatCaDuLieuChoDuyet();
      } catch (error) {
        alert("Lỗi phê duyệt bằng cấp!");
      }
    }
  };

  const handleTuChoiBangCap = async (bangCap) => {
    // 🟢 Dùng window.prompt để lấy lý do từ chối
    const lyDo = window.prompt(`Nhập lý do TỪ CHỐI bằng cấp này của gia sư: ${bangCap.tenGiaSu}?`, "");
    
    if (lyDo === null) return;

    if (lyDo.trim() === "") {
      return alert("Vui lòng nhập lý do từ chối để gia sư tải lại ảnh hợp lệ!");
    }

    try {
      // 🟢 Gửi trạng thái 2 kèm theo lý do
      await GiaSu_BangCap_Service.capNhatGiaSuBangCap(bangCap.mabangcapgiasu, { ...bangCap, trangthaiduyet: 2, lydotuchoi: lyDo.trim() });
      alert("Đã chuyển trạng thái bằng cấp sang 'Từ chối'!");
      setChiTietBangCap(null);
      loadTatCaDuLieuChoDuyet();
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái bằng cấp!");
    }
  };

  // ================= GIAO DIỆN CHÍNH =================
  if (loading) {
    return <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu chờ duyệt...</div>;
  }

  return (
    <div className="admin-table-card">

      {/* HEADER & TABS */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: 0, color: '#005088', fontSize: '18px' }}>Trung Tâm Xác Nhận Hệ Thống</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={() => setActiveTab('hoso')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'hoso' ? '#005088' : '#f1f5f9', color: activeTab === 'hoso' ? 'white' : '#64748b' }}
          >
            Hồ sơ Gia sư ({danhSachGiaSuChoDuyet.length})
          </button>
          <button
            onClick={() => setActiveTab('bangcap')}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'bangcap' ? '#005088' : '#f1f5f9', color: activeTab === 'bangcap' ? 'white' : '#64748b' }}
          >
            Bằng cấp / Chứng chỉ ({danhSachBangCapChoDuyet.length})
          </button>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Thông tin Gia sư</th>
              <th style={{ width: '35%' }}>{activeTab === 'hoso' ? 'Thông tin chuyên môn' : 'Chi tiết bằng cấp'}</th>
              <th style={{ width: '15%' }}>Trạng thái</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>

            {/* TAB 1: HIỂN THỊ HỒ SƠ */}
            {activeTab === 'hoso' && danhSachGiaSuChoDuyet.map((gs) => (
              <tr key={`verify-gs-${gs.magiasu}`}>
                <td>
                  <div className="table-user-cell">
                    {gs.anhdaidien && gs.anhdaidien !== 'string' ? (
                      <img src={gs.anhdaidien} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="table-avatar-initial">{gs.hoten.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                      <div className="user-name-text" style={{ fontSize: '15px', fontWeight: '600' }}>{gs.hoten}</div>
                      <div style={{ fontSize: '13px', color: '#475569' }}>📞 {gs.sodienthoai}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="table-degree-info">
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0284c7' }}>✉️ {gs.email}</div>
                    <div style={{ fontSize: '13px', color: '#334155' }}>Năm sinh: {gs.namsinh} | {gs.gioitinh === 0 ? 'Nam' : 'Nữ'}</div>
                  </div>
                </td>
                <td><span className="status-badge pending"><span className="material-symbols-outlined">hourglass_empty</span>Chờ duyệt</span></td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="button" className="btn-table-action-view" onClick={() => setChiTietGiaSu(gs)}><span className="material-symbols-outlined">visibility</span></button>
                    <button type="button" onClick={() => handleTuChoiHoSo(gs)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Từ chối</button>
                    <button type="button" className="btn-table-action-verify" onClick={() => handleDuyetHoSo(gs)} style={{ padding: '6px 12px', fontSize: '13px' }}>Duyệt</button>
                  </div>
                </td>
              </tr>
            ))}

            {/* TAB 2: HIỂN THỊ BẰNG CẤP */}
            {activeTab === 'bangcap' && danhSachBangCapChoDuyet.map((bc) => (
              <tr key={`verify-bc-${bc.mabangcapgiasu}`}>
                <td>
                  <div className="table-user-cell">
                    {bc.anhdaidienGS && bc.anhdaidienGS !== 'string' ? (
                      <img src={bc.anhdaidienGS} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="table-avatar-initial">{bc.tenGiaSu.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                      <div className="user-name-text" style={{ fontSize: '15px', fontWeight: '600' }}>{bc.tenGiaSu}</div>
                      <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>Gia sư</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="table-degree-info">
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{bc.chuyennganh}</div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>{bc.tenLoaiBang} - {bc.cosodaotao} ({bc.namtotnghiep})</div>
                  </div>
                </td>
                <td><span className="status-badge pending"><span className="material-symbols-outlined">hourglass_empty</span>Chờ duyệt</span></td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="button" className="btn-table-action-view" onClick={() => setChiTietBangCap(bc)}><span className="material-symbols-outlined">visibility</span></button>
                    <button type="button" onClick={() => handleTuChoiBangCap(bc)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Từ chối</button>
                    <button type="button" className="btn-table-action-verify" onClick={() => handleDuyetBangCap(bc)} style={{ padding: '6px 12px', fontSize: '13px' }}>Duyệt</button>
                  </div>
                </td>
              </tr>
            ))}

            {/* EMPTY STATES */}
            {((activeTab === 'hoso' && danhSachGiaSuChoDuyet.length === 0) || (activeTab === 'bangcap' && danhSachBangCapChoDuyet.length === 0)) && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>
                  Tất cả {activeTab === 'hoso' ? 'hồ sơ gia sư' : 'bằng cấp'} đang chờ đã được xử lý.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== MODAL CHI TIẾT HỒ SƠ GIA SƯ ==================== */}
      {chiTietGiaSu && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Chi Tiết Hồ Sơ: {chiTietGiaSu.hoten}</h3>
              <button onClick={() => setChiTietGiaSu(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p><strong>Email:</strong> {chiTietGiaSu.email} | <strong>SĐT:</strong> {chiTietGiaSu.sodienthoai}</p>
              <p><strong>Giới thiệu:</strong> {chiTietGiaSu.gioithieubanthan}</p>

              <h4 style={{ marginTop: '20px' }}>Ảnh Minh Chứng CCCD</h4>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <div style={{ flex: 1 }}>
                  <p>Mặt Trước</p>
                  <img src={chiTietGiaSu.cccdmattruoc} onClick={() => setModalImage(chiTietGiaSu.cccdmattruoc)} style={{ width: '100%', height: '180px', objectFit: 'cover', cursor: 'zoom-in', borderRadius: '8px', border: '1px dashed #ccc' }} alt="Mặt trước"/>
                </div>
                <div style={{ flex: 1 }}>
                  <p>Mặt Sau</p>
                  <img src={chiTietGiaSu.cccdmatsau} onClick={() => setModalImage(chiTietGiaSu.cccdmatsau)} style={{ width: '100%', height: '180px', objectFit: 'cover', cursor: 'zoom-in', borderRadius: '8px', border: '1px dashed #ccc' }} alt="Mặt sau"/>
                </div>
              </div>
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => handleTuChoiHoSo(chiTietGiaSu)} style={{ padding: '10px 20px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Từ chối</button>
              <button onClick={() => handleDuyetHoSo(chiTietGiaSu)} style={{ padding: '10px 20px', backgroundColor: '#005088', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Xác nhận Duyệt</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CHI TIẾT BẰNG CẤP ==================== */}
      {chiTietBangCap && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Phê duyệt Bằng cấp</h3>
              <button onClick={() => setChiTietBangCap(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>Gia sư:</strong> {chiTietBangCap.tenGiaSu}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Loại chứng chỉ:</strong> {chiTietBangCap.tenLoaiBang}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Chuyên ngành/Tên chi tiết:</strong> {chiTietBangCap.chuyennganh}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Nơi đào tạo:</strong> {chiTietBangCap.cosodaotao}</p>
                <p style={{ margin: 0 }}><strong>Năm cấp:</strong> {chiTietBangCap.namtotnghiep}</p>
              </div>

              <h4 style={{ margin: '0 0 10px 0' }}>Ảnh quét minh chứng</h4>
              <img
                src={chiTietBangCap.anhbangcap}
                onClick={() => setModalImage(chiTietBangCap.anhbangcap)}
                style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', cursor: 'zoom-in', borderRadius: '8px', border: '1px dashed #cbd5e1', backgroundColor: '#f1f5f9' }}
                alt="Minh chứng bằng cấp"
                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Khong+Tai+Duoc+Anh' }}
              />
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => handleTuChoiBangCap(chiTietBangCap)} style={{ padding: '10px 20px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Từ chối</button>
              <button onClick={() => handleDuyetBangCap(chiTietBangCap)} style={{ padding: '10px 20px', backgroundColor: '#005088', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Xác nhận Hợp lệ</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP XEM ẢNH PHÓNG TO CHUNG */}
      {modalImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', maxWidth: '85%', maxHeight: '90%' }}>
            <button onClick={() => setModalImage(null)} style={{ position: 'absolute', top: '-45px', right: '0', background: 'none', border: 'none', color: 'white', fontSize: '36px', cursor: 'pointer' }}>&times;</button>
            <img src={modalImage} alt="Phóng to" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorVerifyTable;