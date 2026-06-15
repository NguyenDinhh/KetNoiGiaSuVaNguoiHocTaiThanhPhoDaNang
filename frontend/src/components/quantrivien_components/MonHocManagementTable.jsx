import React, { useState, useEffect } from 'react';
import MonHoc_Service from '../../services/MonHoc_Service';
import HeLop_Service from '../../services/HeLop_Service';

const MonHocManagementTable = () => {
  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [thongKe, setThongKe] = useState({ tongSo: 0, dangHoatDong: 0, dangTamNgung: 0 });
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [heLopDangLoc, setHeLopDangLoc] = useState("ALL"); // State lọc theo hệ lớp

  const [hienThiForm, setHienThiForm] = useState(false);
  const [formDuLieu, setFormDuLieu] = useState({ mahelop: "", tenmonhoc: "", mota: "", trangthai: 1 });

  const [idMonHocDangSua, setIdMonHocDangSua] = useState(null);

  useEffect(() => {
    taiDanhSachMonHoc();
    taiDanhSachHeLop();
    taiThongKe();
  }, []);

  const taiDanhSachMonHoc = () => {
    setDangTai(true);
    MonHoc_Service.layDanhSachMonHoc()
      .then((duLieu) => {
        setDanhSachMonHoc(duLieu);
        setDangTai(false);
      })
      .catch((loi) => {
        alert("Không thể tải danh sách môn học!");
        console.error(loi);
        setDangTai(false);
      });
  };

  const taiDanhSachHeLop = () => {
    HeLop_Service.layDanhSachHeLop()
      .then((duLieu) => {
        setDanhSachHeLop(duLieu);
      })
      .catch((loi) => {
        console.error("Không thể tải danh sách hệ lớp!", loi);
      });
  };

  const taiThongKe = () => {
    MonHoc_Service.layThongKeMonHoc()
      .then((soLieu) => setThongKe(soLieu))
      .catch((loi) => console.error("Lỗi lấy thống kê:", loi));
  };

  const xuLyBamNutSua = (monHoc) => {
    setIdMonHocDangSua(monHoc.mamonhoc);
    setFormDuLieu({
      mahelop: monHoc.mahelop || "",
      tenmonhoc: monHoc.tenmonhoc,
      mota: monHoc.mota || "",
      trangthai: monHoc.trangthai
    });
    setHienThiForm(true);
  };

  const xuLyBamNutThemMoi = () => {
    setIdMonHocDangSua(null);
    setFormDuLieu({ mahelop: "", tenmonhoc: "", mota: "", trangthai: 1 });
    setHienThiForm(true);
  };

  const xuLyDoiTrangThai = (monHoc) => {
    const dangHoatDong = monHoc.trangthai === 1;
    const thongBaoXacNhan = dangHoatDong
      ? `Bạn có chắc chắn muốn NGỪNG HOẠT ĐỘNG môn "${monHoc.tenmonhoc}" không?`
      : `Bạn có muốn KÍCH HOẠT LẠI môn "${monHoc.tenmonhoc}" không?`;

    if (window.confirm(thongBaoXacNhan)) {
      const trangThaiMoi = dangHoatDong ? 0 : 1;

      const duLieuMoi = {
        mahelop: monHoc.mahelop,
        tenmonhoc: monHoc.tenmonhoc,
        mota: monHoc.mota,
        trangthai: trangThaiMoi
      };

      MonHoc_Service.capNhatMonHoc(monHoc.mamonhoc, duLieuMoi)
        .then((ketQua) => {
          if (ketQua.code === "404") {
            alert(ketQua.message);
          } else {
            alert("Cập nhật trạng thái thành công!");
            taiDanhSachMonHoc();
            taiThongKe();
          }
        })
        .catch(loi => console.error("Lỗi cập nhật:", loi));
    }
  };

  const xuLyNhapLieu = (suKien) => {
    const { name, value } = suKien.target;
    setFormDuLieu({ ...formDuLieu, [name]: value });
  };

  const xuLyGuiForm = (suKien) => {
    suKien.preventDefault();

    if (!formDuLieu.mahelop || formDuLieu.mahelop === "") {
      alert("Vui lòng chọn hệ lớp!");
      return;
    }

    const duLieuChuanHoa = {
      mahelop: formDuLieu.mahelop,
      tenmonhoc: formDuLieu.tenmonhoc,
      mota: formDuLieu.mota,
      trangthai: parseInt(formDuLieu.trangthai) || 1
    };

    if (idMonHocDangSua) {
      MonHoc_Service.capNhatMonHoc(idMonHocDangSua, duLieuChuanHoa)
        .then((ketQua) => {
          if(ketQua.code === "404") {
            alert(ketQua.message);
          } else {
            alert("Cập nhật thông tin môn học thành công!");
            setHienThiForm(false);
            taiDanhSachMonHoc();
          }
        })
        .catch(loi => console.error("Lỗi cập nhật:", loi));

    } else {
      MonHoc_Service.themMonHocMoi(duLieuChuanHoa)
        .then(() => {
          alert("Thêm môn học mới thành công!");
          setHienThiForm(false);
          taiDanhSachMonHoc();
          taiThongKe();
        })
        .catch((loi) => console.error(loi));
    }
  };

  const danhSachDaLoc = danhSachMonHoc.filter((monHoc) => {
    const tuKhoaChuan = tuKhoaTimKiem.trim().toLowerCase();
    const khopTimKiem = tuKhoaChuan === "" || monHoc.tenmonhoc.toLowerCase().includes(tuKhoaChuan);
    const khopHeLop = heLopDangLoc === "ALL" || String(monHoc.mahelop) === String(heLopDangLoc);
    return khopTimKiem && khopHeLop;
  });

  return (
    <>
      <div className="admin-bento-grid">
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-round"><span className="material-symbols-outlined">menu_book</span></div>
            <h3>Tổng số môn học</h3>
          </div>
          <div className="stat-number">{thongKe.tongSo}</div>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid var(--admin-secondary, #006b54)' }}>
          <div className="stat-card-header">
            <div className="stat-icon-round" style={{ backgroundColor: 'rgba(0, 107, 84, 0.1)', color: 'var(--admin-secondary)' }}><span className="material-symbols-outlined">check_circle</span></div>
            <h3>Đang giảng dạy</h3>
          </div>
          <div className="stat-number">{thongKe.dangHoatDong}</div>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid var(--admin-error, #ba1a1a)' }}>
          <div className="stat-card-header">
            <div className="stat-icon-round" style={{ backgroundColor: 'rgba(186, 26, 26, 0.1)', color: 'var(--admin-error)' }}><span className="material-symbols-outlined">unpublished</span></div>
            <h3>Đang tạm ngưng</h3>
          </div>
          <div className="stat-number">{thongKe.dangTamNgung}</div>
        </div>

        <div className="controls-filter-box">
          <div className="search-filter-inline-row">
            <div className="inline-search-input-group">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Tìm kiếm tên môn học..." value={tuKhoaTimKiem} onChange={(e) => setTuKhoaTimKiem(e.target.value)} />
            </div>
            
            {/* Dropdown lọc theo Hệ lớp */}
            <select 
              value={heLopDangLoc} 
              onChange={(e) => setHeLopDangLoc(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '6px', 
                border: '1px solid #cbd5e1', 
                backgroundColor: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              <option value="ALL">Tất cả hệ lớp</option>
              {danhSachHeLop.map((heLop) => (
                <option key={heLop.mahelop} value={heLop.mahelop}>
                  {heLop.tenhelop}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-card" style={{ marginTop: '24px' }}>
        <div className="user-table-header-bar">
          <span className="user-count-text">Hiển thị 1-{danhSachDaLoc.length} của {danhSachMonHoc.length} môn học</span>

          <button type="button" className="btn-export-excel" style={{ gap: '6px' }} onClick={xuLyBamNutThemMoi}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Thêm môn học
          </button>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: '8%', textAlign: 'center' }}>Mã môn</th>
                <th style={{ width: '20%' }}>Tên môn học</th>
                <th style={{ width: '15%' }}>Thuộc hệ lớp</th>
                <th style={{ width: '32%' }}>Mô tả chi tiết</th>
                <th style={{ width: '15%' }}>Trạng thái</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* 2. CHỈNH LẠI colSpan=6 ĐỂ KHUNG LOADING KHÔNG BỊ HỤT */}
              {dangTai ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-variant)' }}>Đang tải danh mục...</td></tr>
              ) : danhSachDaLoc.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-variant)' }}>Không có dữ liệu.</td></tr>
              ) : (
                danhSachDaLoc.map((monHoc) => {

                  // 3. LOGIC TÌM TÊN HỆ LỚP: Lấy mahelop đi tra cứu trong danhSachHeLop
                  const heLopTuongUng = danhSachHeLop.find(hl => hl.mahelop === monHoc.mahelop);
                  const tenHeLopHienThi = heLopTuongUng ? heLopTuongUng.tenhelop : "Chưa gắn hệ";

                  return (
                    <tr key={monHoc.mamonhoc} className={monHoc.trangthai === 0 ? 'user-row-locked' : ''}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#555' }}>#{monHoc.mamonhoc}</td>
                      <td><span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>{monHoc.tenmonhoc}</span></td>

                      {/* 4. IN TÊN HỆ LỚP RA GIAO DIỆN */}
                      <td>
                        <span style={{ fontWeight: 500, color: '#005088', backgroundColor: '#e6f0f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {tenHeLopHienThi}
                        </span>
                      </td>

                      <td style={{ color: 'var(--admin-text-variant)', fontSize: '13px' }}>{monHoc.mota || "Chưa có mô tả."}</td>
                      <td>
                        {monHoc.trangthai === 1 ? (
                          <span className="user-status-dot-badge active"><span className="status-dot active"></span> Hoạt động</span>
                        ) : (
                          <span className="user-status-dot-badge locked"><span className="status-dot locked"></span> Tạm ngưng</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>

                        <button type="button" className="btn-table-action-view" title="Chỉnh sửa" onClick={() => xuLyBamNutSua(monHoc)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>

                        {monHoc.trangthai === 1 ? (
                          <button type="button" className="btn-table-action-view" title="Ngừng hoạt động" style={{ color: 'var(--admin-error)' }} onClick={() => xuLyDoiTrangThai(monHoc)}>
                            <span className="material-symbols-outlined">visibility_off</span>
                          </button>
                        ) : (
                          <button type="button" className="btn-table-action-view" title="Kích hoạt lại" style={{ color: 'var(--admin-secondary)' }} onClick={() => xuLyDoiTrangThai(monHoc)}>
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hienThiForm && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="admin-modal-box" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                {idMonHocDangSua ? "Cập nhật môn học" : "Thêm môn học mới"}
              </h2>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setHienThiForm(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={xuLyGuiForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>
                    Thuộc hệ lớp <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                    name="mahelop"
                    required
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                    value={formDuLieu.mahelop}
                    onChange={xuLyNhapLieu}
                >
                    <option value="" disabled>-- Vui lòng chọn hệ lớp --</option>
                    {danhSachHeLop.map((heLop) => (
                    <option key={heLop.mahelop} value={heLop.mahelop}>
                        {heLop.tenhelop}
                    </option>
                    ))}
                </select>
                </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Tên môn học <span style={{ color: 'red' }}>*</span></label>
                <input type="text" name="tenmonhoc" required style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }} value={formDuLieu.tenmonhoc} onChange={xuLyNhapLieu} placeholder="VD: Toán, Ngữ Văn, IELTS..." />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Mô tả môn học</label>
                <textarea name="mota" rows={4} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none', fontFamily: 'inherit' }} value={formDuLieu.mota} onChange={xuLyNhapLieu} placeholder="Ghi chú về môn học..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={() => setHienThiForm(false)}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--admin-primary, #005088)', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                  {idMonHocDangSua ? "Cập nhật" : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MonHocManagementTable;
