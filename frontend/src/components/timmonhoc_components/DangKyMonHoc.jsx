import React, { useState, useEffect } from 'react';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import ChiTietDangKyLich_Service from '../../services/ChiTietDangKyLich_Service';
import KhungGio_GiaSu_MonHoc_Service from '../../services/KhungGio_GiaSu_MonHoc_Service';
import HocVien_Service from '../../services/HocVien_Service';
import YeuCau_HocVien_Service from '../../services/YeuCau_HocVien_Service';

const DangKyMonHoc = ({ item, onClose, onSuccess }) => {
  const [danhSachKhungGio, setDanhSachKhungGio] = useState([]);
  const [danhSachHocVien, setDanhSachHocVien] = useState([]);
  const [khungGioDaChon, setKhungGioDaChon] = useState([]);
  const [hocVienDaChon, setHocVienDaChon] = useState([]);

  const [ngayBatDauHoc, setNgayBatDauHoc] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
        const maND = userLocal?.manguoidung;

        if (!maND) {
          alert("Hệ thống yêu cầu đăng nhập tài khoản Người học trước khi thao tác!");
          onClose();
          return;
        }

        const [resKhungGio, resHocVien] = await Promise.all([
          KhungGio_GiaSu_MonHoc_Service.layDanhSachKhungGio().catch(() => []),
          HocVien_Service.layDanhSachHocVien().catch(() => [])
        ]);

        const mangKhungGio = Array.isArray(resKhungGio) ? resKhungGio : [];
        // Lọc lấy các khung giờ đang sẵn sàng (trạng thái 1)
        const khungGioHopLe = mangKhungGio.filter(
          kg => Number(kg.magiasu_monhoc) === Number(item.magiasu_monhoc) && Number(kg.trangthai) === 1
        );
        setDanhSachKhungGio(khungGioHopLe);

        const mangHocVien = Array.isArray(resHocVien) ? resHocVien : (resHocVien?.data || []);
        const hocVienCuaToi = mangHocVien.filter(hv => Number(hv.manguoidung) === Number(maND));
        setDanhSachHocVien(hocVienCuaToi);

      } catch (error) {
        console.error("Lỗi cấu hình dữ liệu biểu mẫu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (item) loadInitialData();
  }, [item, onClose]);

  const toggleKhungGio = (kg) => {
    if (khungGioDaChon.some(x => Number(x.makhunggio) === Number(kg.makhunggio))) {
      setKhungGioDaChon(khungGioDaChon.filter(x => Number(x.makhunggio) !== Number(kg.makhunggio)));
    } else {
      setKhungGioDaChon([...khungGioDaChon, kg]);
    }
  };

  const toggleHocVien = (id) => {
    if (hocVienDaChon.includes(id)) {
      setHocVienDaChon(hocVienDaChon.filter(x => x !== id));
    } else {
      setHocVienDaChon([...hocVienDaChon, id]);
    }
  };

  const donGiaHocPhi = item.hocphitong || item.hocphimoibuoi || 0;
  const tongHocPhiTinhToan = hocVienDaChon.length * donGiaHocPhi;

  // ====================================================================
  // 🟢 HÀM XỬ LÝ ĐĂNG KÝ: CHẠY TUẦN TỰ 3 BƯỚC TRANSACTION VÀ KHÓA MỀM
  // ====================================================================
  const handleSubmitDangKy = async (e) => {
    e.preventDefault();
    if (hocVienDaChon.length === 0) return alert("Vui lòng tích chọn ít nhất một học viên!");
    if (khungGioDaChon.length === 0) return alert("Vui lòng tích chọn các khung giờ học mong muốn!");
    if (!ngayBatDauHoc) return alert("Vui lòng xác định ngày dự kiến bắt đầu!");

    try {
      setIsSubmitting(true);
      const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
      const maND = Number(userLocal?.manguoidung || userLocal?.id);

      // --- 🟢 BƯỚC 1: LƯU BẢNG MASTER (DANG KY LICH) ---
      const formMaster = {
        manguoidung: maND,
        magiasu_monhoc: Number(item.magiasu_monhoc),
        ngaybatdauhoc: String(ngayBatDauHoc),
        tonghocphi: Number(tongHocPhiTinhToan),
        ghichu: ghiChu || ""
      };

      console.log("👉 [BƯỚC 1] Gửi dữ liệu đăng ký Master:", formMaster);
      const resMaster = await DangKyLich_Service.themDangKyLichMoi(formMaster);

      if (resMaster.code === "400" || resMaster.code === 400 || resMaster.code === "422") {
        alert(`❌ Backend từ chối tạo đơn đăng ký! Lý do: ${resMaster.message || 'Lỗi dữ liệu'}`);
        setIsSubmitting(false);
        return;
      }

      const maDangKyMoi = resMaster?.data?.madangky || resMaster?.madangky;

      if (!maDangKyMoi) {
        throw new Error(`Thêm đơn đăng ký lịch thất bại, không tìm thấy mã đăng ký trả về!`);
      }

      console.log(`✅ [BƯỚC 1 OK] Đã tạo thành công Đơn Đăng Ký với mã ID: ${maDangKyMoi}`);

      // --- 🟢 BƯỚC 2: LƯU CHI TIẾT ĐĂNG KÝ VÀ KHÓA MỀM KHUNG GIỜ ---
      console.log(`👉 [BƯỚC 2] Đang lưu dữ liệu khung giờ học và chuyển trạng thái Chờ duyệt (3)...`);
      for (const kg of khungGioDaChon) {
        const formDetail = {
          makhunggio: Number(kg.makhunggio),
          madangky: Number(maDangKyMoi),
          ngayhoc: kg.ngayday,
          thoigianbatdau: kg.thoigianbatdau,
          thoigianketthuc: kg.thoigianketthuc,
          ghichu: ""
        };
        await ChiTietDangKyLich_Service.themChiTietDangKyLichMoi(formDetail);

        // 🟢 Cập nhật trạng thái Khung giờ thành 3 (Chờ duyệt)
        // Vì Backend đã hỗ trợ Optional nên chỉ cần gửi đúng trường cần đổi là ăn ngay.
        await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(kg.makhunggio, { trangthai: 3 });
      }
      console.log(`✅ [BƯỚC 2 OK] Đã đồng bộ và khóa mềm ${khungGioDaChon.length} khung giờ học.`);

      // --- 🟢 BƯỚC 3: LƯU DANH SÁCH HỌC VIÊN THEO MÃ ĐĂNG KÝ (YÊU CẦU HỌC VIÊN) ---
      console.log(`👉 [BƯỚC 3] Đang ánh xạ học viên tham gia với mã đăng ký...`);
      for (const maHV of hocVienDaChon) {
        const formHV = {
          mahocvien: Number(maHV),
          madangky: Number(maDangKyMoi)
        };
        await YeuCau_HocVien_Service.themYeuCauHocVienTheoMaDangKy(formHV);
      }
      console.log(`✅ [BƯỚC 3 OK] Đã liên kết xong ${hocVienDaChon.length} học viên tham gia.`);

      alert("🎉 Chúc mừng! Đơn đăng ký học phần kèm khung giờ và học viên đã được gửi đến Gia sư thành công.");
      if (onSuccess) onSuccess();
      onClose();

    } catch (error) {
      console.error("❌ LỖI HỆ THỐNG TRONG QUY TRÌNH ĐĂNG KÝ LỊCH:", error);
      alert("Quá trình thực hiện đăng ký thất bại! Vui lòng kiểm tra Console (F12) hoặc xem log Backend để biết chi tiết lỗi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '16px', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
        Đang đồng bộ biểu mẫu ứng dụng...
      </div>
    );
  }

  return (
    <div className="dkmh-form-container">
      <h3 className="ctmh-schedule-title" style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <span className="material-symbols-outlined" style={{color: '#0284c7'}}>edit_note</span>
        Biểu mẫu đăng ký khóa học học phần
      </h3>

      <form onSubmit={handleSubmitDangKy} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '14px' }}>

        {/* 1. SELECTION HỌC VIÊN */}
        <div>
          <label className="dkmh-label">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px', color: '#0284c7' }}>groups</span>
            Bước 1: Tích chọn học viên tham gia học ({hocVienDaChon.length})
          </label>
          {danhSachHocVien.length === 0 ? (
            <p style={{ color: '#ef4444', fontSize: '13px', fontStyle: 'italic', margin: '4px 0 0 0' }}>
              * Tài khoản của bạn chưa đăng ký hồ sơ học viên nào. Vui lòng vào mục "Quản lý Học viên" thiết lập trước!
            </p>
          ) : (
            <div className="dkmh-checkbox-grid">
              {danhSachHocVien.map(hv => {
                const isSelected = hocVienDaChon.includes(hv.mahocvien);
                return (
                  <div
                    key={hv.mahocvien}
                    className={`dkmh-checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleHocVien(hv.mahocvien)}
                  >
                    <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{hv.tenhocvien}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Năm sinh: {hv.namsinh} | Học lực: {hv.hocluc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. SELECTION KHUNG GIỜ */}
        <div>
          <label className="dkmh-label">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px', color: '#0284c7' }}>calendar_month</span>
            Bước 2: Lựa chọn các khung giờ học trong tuần ({khungGioDaChon.length})
          </label>
          {danhSachKhungGio.length === 0 ? (
            <p style={{ color: '#ef4444', fontSize: '13px', fontStyle: 'italic', margin: '4px 0 0 0' }}>* Không tìm thấy khung lịch dạy trống khả dụng từ Gia sư.</p>
          ) : (
            <div className="dkmh-checkbox-grid">
              {danhSachKhungGio.map(kg => {
                const isSelected = khungGioDaChon.some(x => Number(x.makhunggio) === Number(kg.makhunggio));
                return (
                  <div
                    key={kg.makhunggio}
                    className={`dkmh-checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleKhungGio(kg)}
                  >
                    <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{kg.ngayday}</div>
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                        {String(kg.thoigianbatdau).slice(0, 5)} - {String(kg.thoigianketthuc).slice(0, 5)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. INPUT NGÀY & GHI CHÚ */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="dkmh-input-group" style={{ flex: 1, minWidth: '220px' }}>
            <label className="dkmh-label">Bước 3: Chọn ngày bắt đầu học khóa mới</label>
            <input
              type="date"
              className="dkmh-input"
              value={ngayBatDauHoc}
              onChange={e => setNgayBatDauHoc(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="dkmh-input-group" style={{ flex: 2, minWidth: '280px' }}>
            <label className="dkmh-label">Bước 4: Nội dung lời nhắn / Ghi chú cho gia sư</label>
            <input
              type="text"
              className="dkmh-input"
              placeholder="Nhập địa điểm học hoặc yêu cầu đặc biệt của học viên..."
              value={ghiChu}
              onChange={e => setGhiChu(e.target.value)}
            />
          </div>
        </div>

        {/* 4. TỔNG HỢP GIÁ TIỀN */}
        <div className="dkmh-summary-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontWeight: '700', fontSize: '14px', display: 'block' }}>Bảng kê khai học phí tạm tính:</span>
              <span style={{ fontSize: '13px', color: '#475569', marginTop: '2px', display: 'block' }}>
                Công thức: {hocVienDaChon.length} học viên &times; {donGiaHocPhi.toLocaleString()} VNĐ
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Tổng chi phí toàn khóa học:</span>
              <div className="dkmh-total-price">{tongHocPhiTinhToan.toLocaleString('vi-VN')} VNĐ</div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            className="tgs-btn-detail-custom"
            style={{ background: '#e2e8f0', color: '#475569' }}
            disabled={isSubmitting}
          >
            Hủy đơn
          </button>
          <button
            type="submit"
            className="ctmh-btn-register"
            style={{ margin: 0, padding: '10px 24px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Hệ thống xử lý..." : "Xác nhận gửi yêu cầu đăng ký"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default DangKyMonHoc;
