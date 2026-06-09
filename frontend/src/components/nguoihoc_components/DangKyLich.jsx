import React, { useState, useEffect } from 'react';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import ChiTietDangKyLich_Service from '../../services/ChiTietDangKyLich_Service';
import KhungGio_GiaSu_MonHoc_Service from '../../services/KhungGio_GiaSu_MonHoc_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import MonHoc_Service from '../../services/MonHoc_Service';

import GiaSu_Service from '../../services/GiaSu_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import HocVien_Service from '../../services/HocVien_Service';
import YeuCau_HocVien_Service from '../../services/YeuCau_HocVien_Service';
import DanhGia_Service from '../../services/DanhGia_Service';

const DangKyLich = () => {
  // STATE QUẢN LÝ TAB CHÍNH CỦA TRANG
  const [activeMainTab, setActiveMainTab] = useState('danh_sach'); // 'danh_sach' | 'lich_hoc'

  const [danhSachDangKy, setDanhSachDangKy] = useState([]);
  const [loading, setLoading] = useState(true);

  // States phục vụ việc Chỉnh sửa đơn
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [donDangChon, setDonDangChon] = useState(null);
  const [formSua, setFormSua] = useState({ ngaybatdauhoc: '', ghichu: '' });

  // STATES PHỤC VỤ ĐÁNH GIÁ
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ madanhgia: null, madangky: null, sosao: 5, nhanxet: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  // STATES PHỤC VỤ LỊCH HỌC CỦA TỪNG HỌC VIÊN
  const [danhSachHocVienCuaToi, setDanhSachHocVienCuaToi] = useState([]);
  const [tabHocVien, setTabHocVien] = useState('Tất cả');
  const [tabThu, setTabThu] = useState('Tất cả');
  const cacThuTrongTuan = ['Tất cả', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  useEffect(() => {
    fetchLichDaDangKy();
  }, []);

  const fetchLichDaDangKy = async () => {
    try {
      setLoading(true);
      const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
      const maND = userLocal?.manguoidung;

      if (!maND) return;

      const [
        resDangKy, resChiTiet, resGiaSuMon, resMonHoc,
        resGiaSu, resNguoiDung, resYeuCauHV, resHocVien, resDanhGia
      ] = await Promise.all([
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
        ChiTietDangKyLich_Service.layDanhSachChiTietDangKyLich().catch(() => []),
        GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
        MonHoc_Service.layDanhSachMonHoc().catch(() => []),
        GiaSu_Service.layDanhSachGiaSu().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
        YeuCau_HocVien_Service.layDanhSachYeuCauHocVien().catch(() => []),
        HocVien_Service.layDanhSachHocVien().catch(() => []),
        DanhGia_Service.layDanhSachDanhGia().catch(() => [])
      ]);

      const listMonHoc = Array.isArray(resMonHoc) ? resMonHoc : (resMonHoc?.data || []);
      const arrGiaSu = Array.isArray(resGiaSu) ? resGiaSu : (resGiaSu?.data || []);
      const arrNguoiDung = Array.isArray(resNguoiDung) ? resNguoiDung : (resNguoiDung?.data || []);
      const arrYeuCauHV = Array.isArray(resYeuCauHV) ? resYeuCauHV : (resYeuCauHV?.data || []);
      const arrHocVien = Array.isArray(resHocVien) ? resHocVien : (resHocVien?.data || []);
      const arrDanhGia = Array.isArray(resDanhGia) ? resDanhGia : (resDanhGia?.data || []);

      const hocVienCuaToi = arrHocVien.filter(hv => Number(hv.manguoidung) === Number(maND));
      setDanhSachHocVienCuaToi(hocVienCuaToi);

      const donCuaToi = (resDangKy || []).filter(dk => Number(dk.manguoidung) === Number(maND));

      const dataHoanChinh = donCuaToi.map(dk => {
        const lopHoc = (resGiaSuMon || []).find(l => Number(l.magiasu_monhoc) === Number(dk.magiasu_monhoc)) || {};
        const mon = listMonHoc.find(m => Number(m.mamonhoc) === Number(lopHoc.mamonhoc));

        const giaSu = arrGiaSu.find(gs => Number(gs.magiasu) === Number(lopHoc.magiasu)) || {};
        const thongTinGS = arrNguoiDung.find(nd => Number(nd.manguoidung || nd.id) === Number(giaSu.manguoidung)) || {};

        const khungGioChon = (resChiTiet || []).filter(ct => Number(ct.madangky) === Number(dk.madangky));

        const cacYeuCau = arrYeuCauHV.filter(yc => Number(yc.madangky) === Number(dk.madangky));
        const danhSachHocVienChon = cacYeuCau.map(yc => arrHocVien.find(hv => Number(hv.mahocvien) === Number(yc.mahocvien))).filter(Boolean);

        const đánhGiáĐãCó = arrDanhGia.find(dg => Number(dg.madangky) === Number(dk.madangky));

        return {
          ...dk,
          tenmonhoc: mon ? mon.tenmonhoc : 'Môn học ẩn',
          giasu_ten: thongTinGS.name || thongTinGS.hoten || 'Chưa cập nhật',
          giasu_sdt: thongTinGS.phone || thongTinGS.sodienthoai || 'Chưa cập nhật',
          giasu_email: thongTinGS.email || 'Chưa cập nhật',
          danhGiaCuaToi: đánhGiáĐãCó || null,
          danhSachKhungGioChon: khungGioChon,
          danhSachHocVien: danhSachHocVienChon
        };
      });

      setDanhSachDangKy(dataHoanChinh.sort((a, b) => Number(a.trangthai) - Number(b.trangthai)));
    } catch (error) {
      console.error("Lỗi tải tiến trình lịch đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHuyDonDangKy = async (dk) => {
    if (!window.confirm("Bạn có chắc chắn muốn HỦY đơn đăng ký khóa học này không?\nHệ thống sẽ rút lại các khung giờ đã giữ chỗ.")) return;
    try {
      if (dk.danhSachKhungGioChon && dk.danhSachKhungGioChon.length > 0) {
        for (const ct of dk.danhSachKhungGioChon) {
          await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(ct.makhunggio, { trangthai: 1 });
        }
      }
      await DangKyLich_Service.xoaDangKyLich(dk.madangky);
      alert("Đã hủy và xóa yêu cầu đăng ký lịch học thành công!");
      fetchLichDaDangKy();
    } catch (error) {
      alert("Hủy đơn thất bại, vui lòng thử lại!");
    }
  };

  const handleMoModalSua = (dk) => {
    setDonDangChon(dk);
    setFormSua({ ngaybatdauhoc: dk.ngaybatdauhoc || '', ghichu: dk.ghichu || '' });
    setIsEditModalOpen(true);
  };

  const handleLuuChinhSua = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...donDangChon, ngaybatdauhoc: formSua.ngaybatdauhoc, ghichu: formSua.ghichu };
      await DangKyLich_Service.capNhatDangKyLich(donDangChon.madangky, payload);
      alert("Cập nhật thông tin đơn đăng ký thành công!");
      setIsEditModalOpen(false);
      fetchLichDaDangKy();
    } catch (error) {
      alert("Lỗi cập nhật thông tin đơn!");
    }
  };

  const handleMoDanhGia = (dk) => {
    setDonDangChon(dk);
    if (dk.danhGiaCuaToi) {
      setReviewData({ madanhgia: dk.danhGiaCuaToi.madanhgia, madangky: dk.madangky, sosao: dk.danhGiaCuaToi.sodiem, nhanxet: dk.danhGiaCuaToi.noidung });
    } else {
      setReviewData({ madanhgia: null, madangky: dk.madangky, sosao: 5, nhanxet: '' });
    }
    setIsReviewOpen(true);
  };

  const handleSubmitHoanThanhHoc = async (e) => {
    e.preventDefault();
    try {
      const payloadDanhGia = {
        mayeucau: null,
        madangky: Number(reviewData.madangky),
        sodiem: parseFloat(reviewData.sosao),
        noidung: String(reviewData.nhanxet)
      };

      if (reviewData.madanhgia) {
        // Cập nhật đánh giá
        await DanhGia_Service.capNhatDanhGia(reviewData.madanhgia, payloadDanhGia);
        alert("🎉 Đã cập nhật đánh giá thành công!");
      } else {
        // Thêm đánh giá mới
        await DanhGia_Service.themDanhGiaMoi(payloadDanhGia);

        if (donDangChon) {
          // 1. Chuyển trạng thái đơn Đăng ký thành 3 (Đã hoàn thành)
          await DangKyLich_Service.capNhatDangKyLich(donDangChon.madangky, { ...donDangChon, trangthai: 3 });

          // 🟢 2. LOGIC MỚI: GIẢI PHÓNG KHUNG GIỜ CHO GIA SƯ
          // Khóa học hoàn thành thì lịch của Gia sư phải được trống trở lại (trangthai = 1)
          if (donDangChon.danhSachKhungGioChon && donDangChon.danhSachKhungGioChon.length > 0) {
            for (const ct of donDangChon.danhSachKhungGioChon) {
              await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(ct.makhunggio, { trangthai: 1 });
            }
          }
        }
        alert("🎉 Đã hoàn thành khóa học và ghi nhận đánh giá Gia sư thành công!");
      }
      setIsReviewOpen(false);
      fetchLichDaDangKy();
    } catch (error) {
      alert(`Đã xảy ra lỗi: ${error.message || "Không thể thực hiện đánh giá"}`);
    }
  };

  const getLichHocData = () => {
    let dsCaHoc = [];
    // 🟢 Trạng thái 1 vẫn là Đang học (Hợp lệ)
    const cacLopDangHoc = danhSachDangKy.filter(dk => Number(dk.trangthai) === 1);

    cacLopDangHoc.forEach(dk => {
      const coHocVienDuocChon = tabHocVien === 'Tất cả'
        ? true
        : dk.danhSachHocVien.some(hv => Number(hv.mahocvien) === Number(tabHocVien));

      if (coHocVienDuocChon) {
        dk.danhSachKhungGioChon?.forEach(ct => {
          dsCaHoc.push({
            machitiet: ct.machitietdangky,
            thu: ct.ngayhoc,
            giobatdau: String(ct.thoigianbatdau).slice(0, 5),
            gioketthuc: String(ct.thoigianketthuc).slice(0, 5),
            tenmonhoc: dk.tenmonhoc,
            giasu_ten: dk.giasu_ten,
            giasu_sdt: dk.giasu_sdt,
            ghichudon: dk.ghichu,
            hocvien: dk.danhSachHocVien
          });
        });
      }
    });

    dsCaHoc.sort((a, b) => a.giobatdau.localeCompare(b.giobatdau));
    return dsCaHoc.filter(ca => tabThu === 'Tất cả' || ca.thu === tabThu);
  };

  const lichHocHienThi = getLichHocData();

  // 🟢 THAY ĐỔI LOGIC ĐẾM THỐNG KÊ THEO MÃ TRẠNG THÁI MỚI
  const tongDon = danhSachDangKy.length;
  const donDangHoc = danhSachDangKy.filter(dk => Number(dk.trangthai) === 1).length; // 1: Đang học
  const donHoanThanh = danhSachDangKy.filter(dk => Number(dk.trangthai) === 3).length; // 3: Đã hoàn thành

  return (
    <div className="nh-content-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#0284c7' }}>calendar_month</span>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>Quản lý đăng ký học</h2>
          <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>Xem tiến độ phê duyệt và thời khóa biểu của các lớp học từ Gia sư.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: '#f8fafc', padding: '6px', borderRadius: '10px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveMainTab('danh_sach')}
          style={{ padding: '8px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', backgroundColor: activeMainTab === 'danh_sach' ? '#0284c7' : 'transparent', color: activeMainTab === 'danh_sach' ? '#fff' : '#475569', transition: 'all 0.2s' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '4px' }}>list_alt</span>
          Danh sách Đơn đăng ký
        </button>
        <button
          onClick={() => setActiveMainTab('lich_hoc')}
          style={{ padding: '8px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', backgroundColor: activeMainTab === 'lich_hoc' ? '#10b981' : 'transparent', color: activeMainTab === 'lich_hoc' ? '#fff' : '#475569', transition: 'all 0.2s' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '4px' }}>view_timeline</span>
          Lịch học của Học viên
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '20px', color: '#475569', fontStyle: 'italic' }}>Đang đồng bộ dữ liệu học tập của bạn...</div>
      ) : activeMainTab === 'danh_sach' ? (

        <>
          {/* KHỐI THỐNG KÊ (DASHBOARD SUMMARY) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#475569' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>receipt_long</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Tổng số đơn</div>
                <div style={{ fontSize: '24px', color: '#0f172a', fontWeight: 'bold' }}>{tongDon}</div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#0284c7' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu_book</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Lớp đang học</div>
                <div style={{ fontSize: '24px', color: '#0284c7', fontWeight: 'bold' }}>{donDangHoc}</div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10b981' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>verified</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Đã hoàn thành</div>
                <div style={{ fontSize: '24px', color: '#10b981', fontWeight: 'bold' }}>{donHoanThanh}</div>
              </div>
            </div>
          </div>

          {/* DANH SÁCH ĐƠN */}
          {danhSachDangKy.length === 0 ? (
            <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
              Bạn chưa thực hiện gửi đơn đăng ký lịch học nào.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {danhSachDangKy.map((dk) => {
                // 🟢 THAY ĐỔI LOGIC MÀU SẮC HUY HIỆU THEO CHUẨN MỚI
                let badgeColor = '#f59e0b';
                let badgeText = 'Chờ gia sư duyệt';
                if (Number(dk.trangthai) === 1) { badgeColor = '#0284c7'; badgeText = 'Đang học (Gia sư đã nhận)'; }
                if (Number(dk.trangthai) === 2) { badgeColor = '#ef4444'; badgeText = 'Gia sư từ chối'; }
                if (Number(dk.trangthai) === 3) { badgeColor = '#10b981'; badgeText = 'Đã Hoàn Thành'; }

                return (
                  <div key={dk.madangky} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                      <span style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '16px' }}>📚 Khóa học: {dk.tenmonhoc}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', backgroundColor: badgeColor, padding: '4px 12px', borderRadius: '20px' }}>
                        {badgeText}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', fontSize: '14px', color: '#334155' }}>
                      <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <div style={{ fontWeight: '700', color: '#0369a1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>school</span> Thông tin Gia sư
                        </div>
                        <div style={{lineHeight: '1.6'}}>• <strong>Họ tên:</strong> {dk.giasu_ten}</div>
                        <div style={{lineHeight: '1.6'}}>• <strong>SĐT:</strong> {dk.giasu_sdt}</div>
                        <div style={{lineHeight: '1.6'}}>• <strong>Email:</strong> {dk.giasu_email}</div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284c7' }}>face</span> Học viên tham gia
                        </div>
                        {dk.danhSachHocVien.length === 0 ? (
                          <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Chưa cập nhật</div>
                        ) : (
                          dk.danhSachHocVien.map(hv => (
                            <div key={hv.mahocvien} style={{ marginBottom: '4px', fontSize: '13px' }}>
                              • <strong>{hv.tenhocvien}</strong> (SN: {hv.namsinh})
                            </div>
                          ))
                        )}
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284c7' }}>alarm</span> Khung lịch đã chọn
                        </div>
                        {dk.danhSachKhungGioChon?.map(ct => (
                          <div key={ct.machitietdangky} style={{ fontSize: '13px', padding: '2px 0' }}>
                            • <strong>{ct.ngayhoc}</strong>: {String(ct.thoigianbatdau).slice(0, 5)} - {String(ct.thoigianketthuc).slice(0, 5)}
                          </div>
                        ))}
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                          • <strong>Học phí:</strong> <span style={{ color: '#ef4444', fontWeight: '700' }}>{dk.tonghocphi?.toLocaleString()} đ</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '13.5px', color: '#475569' }}>
                        <div>Khai giảng dự kiến: <strong style={{ color: '#0f172a' }}>{dk.ngaybatdauhoc ? new Date(dk.ngaybatdauhoc).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}</strong></div>
                        {dk.ghichu && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>💬 Ghi chú: "{dk.ghichu}"</div>}
                      </div>

                      {/* 🟢 ĐIỀU CHỈNH LOGIC ĐIỀU KIỆN RENDER NÚT BẤM */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {Number(dk.trangthai) === 0 && (
                          <>
                            <button onClick={() => handleMoModalSua(dk)} style={{ padding: '6px 14px', background: '#ffffff', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span> Sửa
                            </button>
                            <button onClick={() => handleHuyDonDangKy(dk)} style={{ padding: '6px 14px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span> Hủy đơn
                            </button>
                          </>
                        )}
                        {Number(dk.trangthai) === 1 && (
                          <button onClick={() => handleMoDanhGia(dk)} style={{ padding: '6px 14px', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>task_alt</span> Hoàn thành khóa học
                          </button>
                        )}
                        {Number(dk.trangthai) === 3 && (
                          <button onClick={() => handleMoDanhGia(dk)} style={{ padding: '6px 14px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_square</span> Sửa đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (

        // =================================================================================
        // TAB 2: LỊCH HỌC TỪNG HỌC VIÊN
        // =================================================================================
        <div style={{ marginTop: '10px' }}>

          <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '600', color: '#334155', marginBottom: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10b981' }}>face</span>
              Chọn xem lịch của học viên:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setTabHocVien('Tất cả')}
                style={{
                  padding: '6px 16px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  borderColor: tabHocVien === 'Tất cả' ? '#10b981' : '#cbd5e1',
                  backgroundColor: tabHocVien === 'Tất cả' ? '#10b981' : '#ffffff',
                  color: tabHocVien === 'Tất cả' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                Tất cả học viên
              </button>
              {danhSachHocVienCuaToi.map(hv => (
                <button
                  key={hv.mahocvien}
                  onClick={() => setTabHocVien(hv.mahocvien)}
                  style={{
                    padding: '6px 16px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                    borderColor: tabHocVien === hv.mahocvien ? '#10b981' : '#cbd5e1',
                    backgroundColor: tabHocVien === hv.mahocvien ? '#10b981' : '#ffffff',
                    color: tabHocVien === hv.mahocvien ? '#ffffff' : '#475569',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Bé {hv.tenhocvien}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {cacThuTrongTuan.map(thu => (
              <button
                key={thu}
                onClick={() => setTabThu(thu)}
                style={{
                  padding: '6px 16px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                  borderColor: tabThu === thu ? '#0284c7' : '#e2e8f0',
                  backgroundColor: tabThu === thu ? '#e0f2fe' : '#ffffff',
                  color: tabThu === thu ? '#0284c7' : '#64748b',
                  transition: 'all 0.2s ease'
                }}
              >
                {thu}
              </button>
            ))}
          </div>

          {lichHocHienThi.length === 0 ? (
            <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
              Không có tiết học nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
              {lichHocHienThi.map((ca, idx) => (
                <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', borderLeft: '5px solid #10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {ca.thu}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>schedule</span>
                      {ca.giobatdau} - {ca.gioketthuc}
                    </span>
                  </div>

                  <h4 style={{ color: '#065f46', fontSize: '16px', margin: '0 0 12px 0' }}>Môn: {ca.tenmonhoc}</h4>

                  <div style={{ fontSize: '13.5px', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0369a1' }}>school</span>
                    <span><strong>Gia sư:</strong> {ca.giasu_ten} ({ca.giasu_sdt})</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: '600', color: '#475569', fontSize: '13px', marginBottom: '6px' }}>Người đi học ca này:</div>
                    {ca.hocvien.length === 0 ? <span style={{fontSize: '12px', color: '#94a3b8'}}>Chưa cập nhật</span> :
                      ca.hocvien.map((hv, hIdx) => (
                        <div key={hIdx} style={{ fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>
                          • <strong>Bé {hv.tenhocvien}</strong> <span style={{ color: '#64748b' }}>(SN: {hv.namsinh})</span>
                        </div>
                      ))
                    }
                  </div>

                  {ca.ghichudon && (
                    <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', paddingLeft: '8px', borderLeft: '3px solid #bae6fd' }}>
                      "{ca.ghichudon}"
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL ĐÁNH GIÁ VÀ MODAL SỬA */}
      {isReviewOpen && (
        <div className="bc-modal-overlay">
          <div className="bc-modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="bc-modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
              <h3 style={{ margin: 0, color: '#1e3a8a' }}>
                {reviewData.madanhgia ? 'Chỉnh sửa Đánh giá' : 'Đánh giá Gia sư'}
              </h3>
              <button onClick={() => setIsReviewOpen(false)} className="bc-close-btn" style={{ position: 'absolute', right: '16px' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmitHoanThanhHoc} style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
                  {reviewData.madanhgia ? 'Bạn muốn thay đổi mức độ hài lòng?' : 'Mức độ hài lòng của bạn về khóa học?'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setReviewData({ ...reviewData, sosao: star })}
                      style={{
                        fontSize: '42px',
                        cursor: 'pointer',
                        color: star <= (hoveredStar || reviewData.sosao) ? '#f59e0b' : '#cbd5e1',
                        transition: 'color 0.2s',
                        fontVariationSettings: star <= (hoveredStar || reviewData.sosao) ? "'FILL' 1" : "'FILL' 0"
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 'bold', marginTop: '8px' }}>
                  {reviewData.sosao === 5 ? 'Rất tuyệt vời (5 Sao)' :
                   reviewData.sosao === 4 ? 'Hài lòng (4 Sao)' :
                   reviewData.sosao === 3 ? 'Bình thường (3 Sao)' :
                   reviewData.sosao === 2 ? 'Không hài lòng (2 Sao)' : 'Rất tệ (1 Sao)'}
                </div>
              </div>

              <div className="tcn-form-group" style={{ textAlign: 'left', marginBottom: '0' }}>
                <label style={{ fontWeight: '600', color: '#475569' }}>Nhận xét chi tiết *</label>
                <textarea
                  className="tcn-input" rows="4" required
                  placeholder="Chia sẻ cảm nhận về thái độ, phương pháp giảng dạy..."
                  value={reviewData.nhanxet}
                  onChange={e => setReviewData({ ...reviewData, nhanxet: e.target.value })}
                  style={{ background: '#f8fafc' }}
                ></textarea>
              </div>

              <div className="bc-modal-footer" style={{ marginTop: '24px', justifyContent: 'center', gap: '12px' }}>
                <button type="button" onClick={() => setIsReviewOpen(false)} className="btn-outline" style={{ minWidth: '100px' }}>Hủy bỏ</button>
                <button type="submit" className="btn-submit" style={{ background: '#0284c7', minWidth: '160px' }}>
                  {reviewData.madanhgia ? 'Lưu thay đổi' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="bc-modal-overlay">
          <div className="bc-modal-content" style={{ maxWidth: '450px' }}>
            <div className="bc-modal-header">
              <h3>Chỉnh sửa thông tin đăng ký</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="bc-close-btn">&times;</button>
            </div>
            <form onSubmit={handleLuuChinhSua} className="tcn-form-col" style={{ marginTop: '10px' }}>
              <div className="tcn-form-group">
                <label>Chọn lại ngày bắt đầu học</label>
                <input
                  type="date"
                  className="tcn-input"
                  value={formSua.ngaybatdauhoc}
                  onChange={e => setFormSua({ ...formSua, ngaybatdauhoc: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="tcn-form-group">
                <label>Nội dung lời nhắn cho Gia sư</label>
                <textarea
                  className="tcn-input"
                  rows="3"
                  placeholder="Nhập địa điểm học chi tiết hoặc ghi chú mới..."
                  value={formSua.ghichu}
                  onChange={e => setFormSua({ ...formSua, ghichu: e.target.value })}
                  style={{ resize: 'none', padding: '8px' }}
                />
              </div>
              <div className="bc-modal-footer" style={{ marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-outline">Hủy bỏ</button>
                <button type="submit" className="btn-submit" style={{ backgroundColor: '#0284c7' }}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangKyLich;
