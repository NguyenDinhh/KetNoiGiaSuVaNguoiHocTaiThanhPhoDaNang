import React, { useState, useEffect } from 'react';
import KhuVuc_Service from '../../services/KhuVuc_Service';

const KhuVucManagementTable = () => {
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [thongKe, setThongKe] = useState({ tongSo: 0 });
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const [hienThiForm, setHienThiForm] = useState(false);
  const [formDuLieu, setFormDuLieu] = useState({ tenkhuvuc: "" });

  const [idKhuVucDangSua, setIdKhuVucDangSua] = useState(null);

  useEffect(() => {
    taiDanhSachKhuVuc();
    taiThongKe();
  }, []);

  const taiDanhSachKhuVuc = () => {
    setDangTai(true);
    KhuVuc_Service.layDanhSachKhuVuc()
      .then((duLieu) => {
        setDanhSachKhuVuc(duLieu);
        setDangTai(false);
      })
      .catch((loi) => {
        alert("Không thể tải danh sách khu vực!");
        console.error(loi);
        setDangTai(false);
      });
  };

  const taiThongKe = () => {
    KhuVuc_Service.layThongKeKhuVuc()
      .then((soLieu) => setThongKe(soLieu))
      .catch((loi) => console.error("Lỗi lấy thống kê:", loi));
  };

  const xuLyBamNutSua = (khuVuc) => {
    setIdKhuVucDangSua(khuVuc.makhuvuc);
    setFormDuLieu({
      tenkhuvuc: khuVuc.tenkhuvuc
    });
    setHienThiForm(true);
  };

  const xuLyBamNutThemMoi = () => {
    setIdKhuVucDangSua(null);
    setFormDuLieu({ tenkhuvuc: "" });
    setHienThiForm(true);
  };

  
  const xuLyXoa = (khuVuc) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN khu vực "${khuVuc.tenkhuvuc}" không?`)) {
      KhuVuc_Service.xoaKhuVuc(khuVuc.makhuvuc)
        .then((ketQua) => {
          if (ketQua.code === "404") {
            alert(ketQua.message);
          } else {
            alert("Xóa khu vực thành công!");
            taiDanhSachKhuVuc();
            taiThongKe();
          }
        })
        .catch(loi => console.error("Lỗi xóa:", loi));
    }
  };

  const xuLyKhoa = (khuVuc) => {
    if (window.confirm(`Bạn có muốn KHÓA khu vực "${khuVuc.tenkhuvuc}" không? Khu vực sẽ không hiển thị với người dùng.`)) {
      KhuVuc_Service.khoaKhuVuc(khuVuc.makhuvuc)
        .then(() => {
          alert("Khóa khu vực thành công!");
          taiDanhSachKhuVuc();
        })
        .catch(loi => console.error("Lỗi khóa:", loi));
    }
  };

  const xuLyMoKhoa = (khuVuc) => {
    if (window.confirm(`Bạn có muốn MỞ KHÓA khu vực "${khuVuc.tenkhuvuc}" không?`)) {
      KhuVuc_Service.moKhoaKhuVuc(khuVuc.makhuvuc)
        .then(() => {
          alert("Mở khóa khu vực thành công!");
          taiDanhSachKhuVuc();
        })
        .catch(loi => console.error("Lỗi mở khóa:", loi));
    }
  };

  const xuLyNhapLieu = (suKien) => {
    const { name, value } = suKien.target;
    setFormDuLieu({ ...formDuLieu, [name]: value });
  };

  const xuLyGuiForm = (suKien) => {
    suKien.preventDefault();

    const duLieuChuanHoa = {
      tenkhuvuc: formDuLieu.tenkhuvuc
    };

    if (idKhuVucDangSua) {
      KhuVuc_Service.capNhatKhuVuc(idKhuVucDangSua, duLieuChuanHoa)
        .then((ketQua) => {
          if(ketQua.code === "404") {
            alert(ketQua.message);
          } else {
            alert("Cập nhật thông tin khu vực thành công!");
            setHienThiForm(false);
            taiDanhSachKhuVuc();
          }
        })
        .catch(loi => console.error("Lỗi cập nhật:", loi));
    } else {
      KhuVuc_Service.themKhuVucMoi(duLieuChuanHoa)
        .then(() => {
          alert("Thêm khu vực mới thành công!");
          setHienThiForm(false);
          taiDanhSachKhuVuc();
          taiThongKe();
        })
        .catch((loi) => console.error(loi));
    }
  };

  const danhSachDaLoc = danhSachKhuVuc.filter((khuVuc) => {
    const tuKhoaChuan = tuKhoaTimKiem.trim().toLowerCase();
    if (tuKhoaChuan === "") return true;
    return khuVuc.tenkhuvuc.toLowerCase().includes(tuKhoaChuan);
  });

  return (
    <>
      <div className="admin-bento-grid">
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-round"><span className="material-symbols-outlined">map</span></div>
            <h3>Tổng số khu vực</h3>
          </div>
          <div className="stat-number">{thongKe.tongSo}</div>
        </div>

        {}
        <div className="controls-filter-box" style={{ gridColumn: 'span 9' }}>
          <div className="search-filter-inline-row">
            <div className="inline-search-input-group">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Tìm kiếm tên khu vực..." value={tuKhoaTimKiem} onChange={(e) => setTuKhoaTimKiem(e.target.value)} />
            </div>
            <button type="button" className="btn-admin-filter"><span className="material-symbols-outlined">filter_list</span>Lọc</button>
          </div>
        </div>
      </div>

      <div className="admin-table-card" style={{ marginTop: '24px' }}>
        <div className="user-table-header-bar">
          <span className="user-count-text">Hiển thị 1-{danhSachDaLoc.length} của {danhSachKhuVuc.length} khu vực</span>

          <button type="button" className="btn-export-excel" style={{ gap: '6px' }} onClick={xuLyBamNutThemMoi}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Thêm khu vực
          </button>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: '15%', textAlign: 'center' }}>Mã khu vực</th>
                <th style={{ width: '50%' }}>Tên khu vực</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {dangTai ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-variant)' }}>Đang tải danh mục...</td></tr>
              ) : danhSachDaLoc.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-variant)' }}>Không có dữ liệu.</td></tr>
              ) : (
                danhSachDaLoc.map((khuVuc) => (
                  <tr key={khuVuc.makhuvuc}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>#{khuVuc.makhuvuc}</td>
                    <td><span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>{khuVuc.tenkhuvuc}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      {khuVuc.trangthai === 1 ? (
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

                      <button type="button" className="btn-table-action-view" title="Chỉnh sửa" onClick={() => xuLyBamNutSua(khuVuc)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>

                      {khuVuc.trangthai === 1 ? (
                        <button type="button" className="btn-table-action-view" title="Khóa khu vực" style={{ color: '#f59e0b' }} onClick={() => xuLyKhoa(khuVuc)}>
                          <span className="material-symbols-outlined">lock</span>
                        </button>
                      ) : (
                        <button type="button" className="btn-table-action-view" title="Mở khóa khu vực" style={{ color: '#10b981' }} onClick={() => xuLyMoKhoa(khuVuc)}>
                          <span className="material-symbols-outlined">lock_open</span>
                        </button>
                      )}

                      {}
                      <button type="button" className="btn-table-action-view" title="Xóa vĩnh viễn" style={{ color: 'var(--admin-error)' }} onClick={() => xuLyXoa(khuVuc)}>
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

      {hienThiForm && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="admin-modal-box" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                {idKhuVucDangSua ? "Cập nhật khu vực" : "Thêm khu vực mới"}
              </h2>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setHienThiForm(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={xuLyGuiForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Tên khu vực <span style={{ color: 'red' }}>*</span></label>
                <input type="text" name="tenkhuvuc" required style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieu.tenkhuvuc} onChange={xuLyNhapLieu} placeholder="VD: Quận Hải Châu..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={() => setHienThiForm(false)}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--admin-primary, #005088)', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                  {idKhuVucDangSua ? "Cập nhật" : "Lưu thông tin"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default KhuVucManagementTable;
