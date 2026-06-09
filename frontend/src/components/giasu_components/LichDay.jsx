import React, { useState, useEffect } from 'react';
import '../../assets/css/GiaSu.css';

// ================= CÁC SERVICE KẾT NỐI API =================
import GiaSu_Service from '../../services/GiaSu_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import ChiTietDangKyLich_Service from '../../services/ChiTietDangKyLich_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import HocVien_Service from '../../services/HocVien_Service';
import YeuCau_HocVien_Service from '../../services/YeuCau_HocVien_Service';

// CÁC SERVICE CỦA LUỒNG YÊU CẦU TÌM GIA SƯ
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';
import ChiTietYeuCau_Service from '../../services/ChiTietYeuCau_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';

const LichDay = () => {
  const [loading, setLoading] = useState(true);
  const [tabHienTai, setTabHienTai] = useState('Tất cả');
  const [timetableDay, setTimetableDay] = useState([]); // Chỉ giữ lại mảng chứa lịch đi dạy

  const cacThuTrongTuan = ['Tất cả', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  useEffect(() => {
    taiToanBoLichThoiGianBieu();
  }, []);

  const taiToanBoLichThoiGianBieu = async () => {
    try {
      setLoading(true);
      const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
      if (!userLocal) return;
      const maND = Number(userLocal.manguoidung);

      // Tải đồng bộ các bảng để map thông tin hiển thị lên Card ca dạy
      const [
        resLopHoc, resDangKy, resChiTietLich, resMonHoc,
        resNguoiDung, resHocVien, resYeuCauHV, resGiaSuFull,
        resYeuCau, resChiTietYeuCau, resUngTuyen
      ] = await Promise.all([
        GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
        ChiTietDangKyLich_Service.layDanhSachChiTietDangKyLich().catch(() => []),
        MonHoc_Service.layDanhSachMonHoc().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
        HocVien_Service.layDanhSachHocVien().catch(() => []),
        YeuCau_HocVien_Service.layDanhSachYeuCauHocVien().catch(() => []),
        GiaSu_Service.layDanhSachGiaSu().catch(() => []),
        YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
        ChiTietYeuCau_Service.layDanhSachChiTietYeuCau().catch(() => []),
        GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => [])
      ]);

      const listMonHoc = Array.isArray(resMonHoc) ? resMonHoc : (resMonHoc?.data || []);
      const listNguoiDung = Array.isArray(resNguoiDung) ? resNguoiDung : (resNguoiDung?.data || []);
      const listHocVien = Array.isArray(resHocVien) ? resHocVien : (resHocVien?.data || []);
      const listYeuCauHV = Array.isArray(resYeuCauHV) ? resYeuCauHV : (resYeuCauHV?.data || []);
      const listGiaSu = Array.isArray(resGiaSuFull) ? resGiaSuFull : (resGiaSuFull?.data || []);

      const listDangKy = Array.isArray(resDangKy) ? resDangKy : (resDangKy?.data || []);
      const listChiTietLich = Array.isArray(resChiTietLich) ? resChiTietLich : (resChiTietLich?.data || []);
      const listLopHoc = Array.isArray(resLopHoc) ? resLopHoc : (resLopHoc?.data || []);

      const listYeuCau = Array.isArray(resYeuCau) ? resYeuCau : (resYeuCau?.data || []);
      const listChiTietYeuCau = Array.isArray(resChiTietYeuCau) ? resChiTietYeuCau : (resChiTietYeuCau?.data || []);
      const listUngTuyen = Array.isArray(resUngTuyen) ? resUngTuyen : (resUngTuyen?.data || []);

      const giasuCuaToi = listGiaSu.find(gs => Number(gs.manguoidung) === maND);

      let danhSachCaDayHoanChinh = [];

      if (giasuCuaToi?.magiasu) {

        // --- LUỒNG ĐĂNG KÝ LỊCH (Học viên chủ động chọn lịch của tôi) ---
        const lopCuaToi = listLopHoc.filter(l => Number(l.magiasu) === Number(giasuCuaToi.magiasu));
        const mangMaLopCuaToi = lopCuaToi.map(l => Number(l.magiasu_monhoc));
        const dangKyLopCuaToi = listDangKy.filter(dk => mangMaLopCuaToi.includes(Number(dk.magiasu_monhoc)) && Number(dk.trangthai) === 1);

        dangKyLopCuaToi.forEach(dk => {
          const lop = lopCuaToi.find(l => Number(l.magiasu_monhoc) === Number(dk.magiasu_monhoc)) || {};
          const mon = listMonHoc.find(m => Number(m.mamonhoc) === Number(lop.mamonhoc));
          const phuHuynh = listNguoiDung.find(nd => Number(nd.id || nd.manguoidung) === Number(dk.manguoidung)) || {};

          const mangYCHocVien = listYeuCauHV.filter(yc => Number(yc.madangky) === Number(dk.madangky));
          const hocVienCuaDon = mangYCHocVien.map(yc => listHocVien.find(hv => Number(hv.mahocvien) === Number(yc.mahocvien))).filter(Boolean);
          const chiTietKhungGio = listChiTietLich.filter(ct => Number(ct.madangky) === Number(dk.madangky));

          chiTietKhungGio.forEach(ct => {
            danhSachCaDayHoanChinh.push({
              machitiet: `dk-${ct.machitietdangky}`,
              thu: ct.ngayhoc,
              giobatdau: String(ct.thoigianbatdau).slice(0, 5),
              gioketthuc: String(ct.thoigianketthuc).slice(0, 5),
              tenmonhoc: mon ? mon.tenmonhoc : 'Môn học',
              doiTuong_ten: phuHuynh.name || phuHuynh.hoten || 'Chưa cập nhật',
              doiTuong_sdt: phuHuynh.phone || phuHuynh.sodienthoai || 'Không rõ',
              ghichudon: dk.ghichu,
              hocvien: hocVienCuaDon,
              loaiDon: 'Học viên chủ động đăng ký lịch'
            });
          });
        });

        // --- LUỒNG YÊU CẦU TÌM GIA SƯ (Tôi đi ứng tuyển bài viết lớp học khác và đậu) ---
        const ungTuyenDauCuaToi = listUngTuyen.filter(ut => Number(ut.magiasu) === Number(giasuCuaToi.magiasu) && Number(ut.trangthai) === 1);

        ungTuyenDauCuaToi.forEach(ut => {
          const yc = listYeuCau.find(y => Number(y.mayeucau) === Number(ut.mayeucau) && Number(y.trangthai) === 1);
          if (yc) {
            const mon = listMonHoc.find(m => Number(m.mamonhoc) === Number(yc.mamonhoc));
            const phuHuynh = listNguoiDung.find(nd => Number(nd.id || nd.manguoidung) === Number(yc.manguoidung)) || {};

            const mangYCHocVien = listYeuCauHV.filter(y => Number(y.mayeucau) === Number(yc.mayeucau));
            const hocVienCuaYeuCau = mangYCHocVien.map(y => listHocVien.find(hv => Number(hv.mahocvien) === Number(y.mahocvien))).filter(Boolean);
            const chiTietKhungGioYC = listChiTietYeuCau.filter(ct => Number(ct.mayeucau) === Number(yc.mayeucau));

            chiTietKhungGioYC.forEach(ct => {
              danhSachCaDayHoanChinh.push({
                machitiet: `yc-${ct.machitietyeucau || ct.id}`,
                thu: ct.ngayhoc,
                giobatdau: String(ct.thoigianbatdau).slice(0, 5),
                gioketthuc: String(ct.thoigianketthuc).slice(0, 5),
                tenmonhoc: mon ? mon.tenmonhoc : 'Môn học',
                doiTuong_ten: phuHuynh.name || phuHuynh.hoten || 'Chưa cập nhật',
                doiTuong_sdt: phuHuynh.phone || phuHuynh.sodienthoai || 'Không rõ',
                ghichudon: ct.ghichu || yc.ghichu,
                hocvien: hocVienCuaYeuCau,
                loaiDon: 'Đã ứng tuyển lớp học thành công'
              });
            });
          }
        });
      }
      danhSachCaDayHoanChinh.sort((a, b) => a.giobatdau.localeCompare(b.giobatdau));
      setTimetableDay(danhSachCaDayHoanChinh);

    } catch (error) {
      console.error("Lỗi khi kết nối hệ thống lập lịch dạy gia sư tổng hợp:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo Thứ trong tuần
  const danhSachLichDaLoc = timetableDay.filter(ca => tabHienTai === 'Tất cả' || ca.thu === tabHienTai);

  return (
    <div className="yc-container">
      {/* Khối tiêu đề đồng bộ màu xanh chủ đạo của Gia sư */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#006b54' }}>
          table_chart
        </span>
        <div>
          <h2 style={{ color: '#1e293b', margin: 0, fontSize: '22px' }}>Thời Gian Biểu & Lịch Dạy Học</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Hệ thống tự động đồng bộ tất cả các khung lịch dạy đang hoạt động của bạn từ Đơn học viên & Đơn ứng tuyển.</p>
        </div>
      </div>

      {/* Bộ chọn các Thứ trong tuần */}
      <div className="ld-tabs-container" style={{ marginBottom: '20px' }}>
        {cacThuTrongTuan.map(thu => (
          <button
            key={thu}
            onClick={() => setTabHienTai(thu)}
            className={`ld-tab-btn ${tabHienTai === thu ? 'active' : ''}`}
            style={{
              borderColor: tabHienTai === thu ? '#006b54' : '',
              backgroundColor: tabHienTai === thu ? '#006b54' : ''
            }}
          >
            {thu}
          </button>
        ))}
      </div>

      {/* Kết xuất danh sách ca biểu đồ thời gian */}
      {loading ? (
        <div style={{ padding: '20px', color: '#475569', fontStyle: 'italic' }}>Đang kết xuất sơ đồ lịch biểu tuần...</div>
      ) : danhSachLichDaLoc.length === 0 ? (
        <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
          Không ghi nhận lịch dạy kèm học tập nào hoạt động trong ngày này.
        </div>
      ) : (
        <div className="lh-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))' }}>
          {danhSachLichDaLoc.map((ca) => (
            <div
              key={ca.machitiet}
              className="lh-card"
              style={{ borderLeft: '5px solid #006b54' }}
            >
              {/* Giờ học */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span
                  className="lh-badge"
                  style={{
                    backgroundColor: '#e2f1ed',
                    color: '#006b54',
                    fontWeight: 'bold'
                  }}
                >
                  {ca.thu}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>schedule</span>
                  {ca.giobatdau} - {ca.gioketthuc}
                </span>
              </div>

              {/* Tên môn học */}
              <h4 className="lh-card-title" style={{ color: '#1e3a8a', fontSize: '16px', marginBottom: '12px' }}>
                Môn: {ca.tenmonhoc}
              </h4>

              {/* Hiển thị đối tượng liên kết (Phụ huynh liên hệ) */}
              <div className="lh-card-info" style={{ marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0f766e' }}>
                  supervisor_account
                </span>
                <span>
                  <strong>Phụ huynh:</strong> {ca.doiTuong_ten} ({ca.doiTuong_sdt})
                </span>
              </div>

              {/* Nhãn thể hiện nguồn gốc của ca dạy */}
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', marginBottom: '12px', fontStyle: 'italic' }}>
                🏷 Nguồn lớp: {ca.loaiDon}
              </div>

              {/* Danh sách Học viên tham gia trực tiếp ca này */}
              <div className="ld-student-section">
                <div className="ld-student-header">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#006b54' }}>groups</span>
                  Học viên tham gia lớp:
                </div>

                {ca.hocvien.length === 0 ? (
                  <div style={{ padding: '4px 10px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật danh sách</div>
                ) : (
                  ca.hocvien.map((hv, idx) => (
                    <div key={idx} className="ld-student-item">
                      <div className="ld-student-name">
                        • <strong>{hv.tenhocvien}</strong> (Năm sinh: {hv.namsinh})
                      </div>

                      <div className="ld-student-address">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ef4444', flexShrink: 0 }}>location_on</span>
                        <span style={{ wordBreak: 'break-word' }}>
                          <strong>Địa điểm học:</strong> {hv.diachi || 'Chưa cập nhật cụ thể'}
                        </span>
                      </div>

                      {hv.diachi && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(hv.diachi)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ld-map-link"
                          style={{ color: '#006b54' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>explore</span> Xem bản đồ chỉ đường
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Lời nhắn lớp học nếu có */}
              {ca.ghichudon && (
                <div className="ld-note-box" style={{ borderLeftColor: '#cbd5e1' }}>
                  💬 Lời nhắn từ đơn: "{ca.ghichudon}"
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LichDay;
