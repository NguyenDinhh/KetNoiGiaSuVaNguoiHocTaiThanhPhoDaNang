import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/NguoiHoc.css';

// ================= CÁC SERVICE CẦN THIẾT =================
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';
import ChiTietYeuCau_Service from '../../services/ChiTietYeuCau_Service';
import YeuCau_HocVien_Service from '../../services/YeuCau_HocVien_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import KhuVuc_Service from '../../services/KhuVuc_Service';
import HeLop_Service from '../../services/HeLop_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';
import GiaSu_Service from '../../services/GiaSu_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import HocVien_Service from '../../services/HocVien_Service';
import DanhGia_Service from '../../services/DanhGia_Service';

const QuanLyYeuCau = () => {
  const navigate = useNavigate();

  // QUẢN LÝ TAB CHÍNH CỦA TRANG
  const [activeMainTab, setActiveMainTab] = useState('danh_sach');

  // ================= STATE DANH SÁCH YÊU CẦU =================
  const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [danhSachGiaSuFull, setDanhSachGiaSuFull] = useState([]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formSua, setFormSua] = useState({ mayeucau: '', ngaybatdauhoc: '', sobuoihoc: '', tonghocphi: '', danhSachKhungGio: [] });
  const [khungGioMoi, setKhungGioMoi] = useState({ ngayhoc: 'Thứ 2', thoigianbatdau: '18:00', thoigianketthuc: '19:30', ghichu: '' });

  // STATE PHỤC VỤ ĐÁNH GIÁ (SAO & MODAL)
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ madanhgia: null, mayeucau: null, sosao: 5, nhanxet: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  // 🟢 STATES QUẢN LÝ THU/PHÓNG (EXPAND/COLLAPSE)
  const [expanded, setExpanded] = useState({
    choDuyet: true,
    dangHoc: true,
    hoanThanh: false,
    tuChoi: false
  });

  // ================= STATE FORM TẠO MỚI YÊU CẦU =================
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [danhSachHocVienCuaToi, setDanhSachHocVienCuaToi] = useState([]);

  const [step, setStep] = useState(1);
  const [boLocHeLop, setBoLocHeLop] = useState('');
  const [formData, setFormData] = useState({ makhuvuc: '', mamonhoc: '', ngaybatdauhoc: '', sobuoihoc: '', tonghocphi: '' });
  const [khungGioList, setKhungGioList] = useState([{ ngayhoc: 'Thứ 2', thoigianbatdau: '18:00', thoigianketthuc: '19:30', ghichu: '' }]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // State cho modal từ chối gia sư
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [ungTuyenCanTuChoi, setUngTuyenCanTuChoi] = useState(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');

  // ================= FETCH DỮ LIỆU TỔNG (CHẠY 1 LẦN) =================
  useEffect(() => {
    let isMounted = true;
    const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
    if (!userLocal) {
      navigate('/');
      return;
    }
    const maND = userLocal.manguoidung;

    const loadDuLieu = async () => {
      try {
        const [
          resYeuCau, resMonHoc, resKhuVuc, resHeLop,
          resHocVien, resYCHV, resTatCaUngTuyen,
          resGiaSu, resNguoiDung, resDanhGia,
          resChiTietYC // BỔ SUNG: Lấy chi tiết yêu cầu (Khung giờ)
        ] = await Promise.all([
          YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
          MonHoc_Service.layDanhSachMonHoc().catch(() => []),
          KhuVuc_Service.layDanhSachKhuVuc().catch(() => []),
          HeLop_Service.layDanhSachHeLop().catch(() => []),
          HocVien_Service.layDanhSachHocVien().catch(() => []),
          YeuCau_HocVien_Service.layDanhSachYeuCauHocVien().catch(() => []),
          GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
          GiaSu_Service.layDanhSachGiaSu().catch(() => []),
          NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
          DanhGia_Service.layDanhSachDanhGia().catch(() => []),
          ChiTietYeuCau_Service.layDanhSachChiTietYeuCau().catch(() => [])
        ]);

        if (!isMounted) return;

        const listYeuCau = Array.isArray(resYeuCau) ? resYeuCau : resYeuCau?.data || [];
        const listMonHoc = Array.isArray(resMonHoc) ? resMonHoc : resMonHoc?.data || [];
        const listKhuVuc = Array.isArray(resKhuVuc) ? resKhuVuc : resKhuVuc?.data || [];
        const listHeLop = Array.isArray(resHeLop) ? resHeLop : resHeLop?.data || [];
        const listHocVien = Array.isArray(resHocVien) ? resHocVien : resHocVien?.data || [];
        const listYCHV = Array.isArray(resYCHV) ? resYCHV : resYCHV?.data || [];
        const listTatCaUngTuyen = Array.isArray(resTatCaUngTuyen) ? resTatCaUngTuyen : resTatCaUngTuyen?.data || [];
        const listGiaSu = Array.isArray(resGiaSu) ? resGiaSu : resGiaSu?.data || [];
        const listNguoiDung = Array.isArray(resNguoiDung) ? resNguoiDung : resNguoiDung?.data || [];
        const listDanhGia = Array.isArray(resDanhGia) ? resDanhGia : resDanhGia?.data || [];
        const listChiTietYC = Array.isArray(resChiTietYC) ? resChiTietYC : resChiTietYC?.data || []; // Mảng chứa các khung giờ

        setDanhSachMonHoc(listMonHoc);
        setDanhSachKhuVuc(listKhuVuc);
        setDanhSachHeLop(listHeLop);
        setDanhSachHocVienCuaToi(listHocVien.filter(hv => String(hv.manguoidung) === maND));

        const thongTinChiTietGiaSu = listGiaSu.map(gs => {
          const nd = listNguoiDung.find(n => String(n.id || n.manguoidung) === String(gs.manguoidung)) || {};
          return {
            magiasu: gs.magiasu,
            hoten: nd.name || nd.hoten || 'Chưa cập nhật',
            sdt: nd.phone || nd.sodienthoai || 'Chưa cập nhật',
            email: nd.email || 'Chưa cập nhật'
          };
        });
        setDanhSachGiaSuFull(thongTinChiTietGiaSu);

        const yeuCauCuaToi = listYeuCau.filter(yc => String(yc.manguoidung) === maND);
        const duLieuHoanChinh = yeuCauCuaToi.map(yc => {
          const monHoc = listMonHoc.find(m => String(m.mamonhoc) === String(yc.mamonhoc));
          const khuVuc = listKhuVuc.find(k => String(k.makhuvuc) === String(yc.makhuvuc));
          const danhSachUngTuyenCuaLopNay = listTatCaUngTuyen.filter(ut => String(ut.mayeucau) === String(yc.mayeucau));
          const mangYCHV_CuaLop = listYCHV.filter(y => String(y.mayeucau) === String(yc.mayeucau));
          const danhSachHocVienCuaLop = mangYCHV_CuaLop.map(y => listHocVien.find(h => String(h.mahocvien) === String(y.mahocvien))).filter(Boolean);
          const đánhGiáĐãCó = listDanhGia.find(dg => String(dg.mayeucau) === String(yc.mayeucau));
          const danhSachKhungGio = listChiTietYC.filter(ct => String(ct.mayeucau) === String(yc.mayeucau)); // BỔ SUNG: Lọc khung giờ thuộc yêu cầu này

          return {
            ...yc,
            tenmonhoc: monHoc ? monHoc.tenmonhoc : 'Đang cập nhật',
            tenkhuvuc: khuVuc ? khuVuc.tenkhuvuc : 'Đang cập nhật',
            ngaybatdau_str: yc.ngaybatdauhoc ? new Date(yc.ngaybatdauhoc).toLocaleDateString('vi-VN') : 'Chưa xếp',
            danhGiaCuaToi: đánhGiáĐãCó || null,
            danhSachUngTuyen: danhSachUngTuyenCuaLopNay,
            danhSachHocVien: danhSachHocVienCuaLop,
            danhSachKhungGio: danhSachKhungGio // Đính kèm mảng khung giờ vào YeuCau
          };
        });

        duLieuHoanChinh.sort((a, b) => Number(a.trangthai) - Number(b.trangthai));
        setDanhSachYeuCau(duLieuHoanChinh);
        setDangTai(false);
      } catch (error) {
        setDangTai(false);
      }
    };

    loadDuLieu();
    return () => { isMounted = false; };
  }, [navigate]);

  // ====================================================================
  // LOGIC HÀNH ĐỘNG: DUYỆT - TỪ CHỐI - XÓA - SỬA
  // ====================================================================

  // BỔ SUNG: Hàm xử lý xóa Chi Tiết Yêu Cầu (Khung giờ)
  const handleDeleteChiTiet = async (maChiTietYeuCau) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch học này không?")) return;
    try {
      await ChiTietYeuCau_Service.xoaChiTietYeuCau(maChiTietYeuCau);
      alert("Đã xóa khung giờ thành công!");
      window.location.reload(); // Reload lại để cập nhật danh sách mới nhất
    } catch (error) {
      alert("Xóa khung giờ thất bại!");
    }
  };

  // BỔ SUNG: Hàm thêm khung giờ mới khi đang chỉnh sửa
  const handleThemKhungGioMoi = async () => {
    if (!khungGioMoi.thoigianbatdau || !khungGioMoi.thoigianketthuc) {
      return alert("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc!");
    }
    
    try {
      const payload = {
        mayeucau: formSua.mayeucau,
        ngayhoc: String(khungGioMoi.ngayhoc),
        thoigianbatdau: khungGioMoi.thoigianbatdau,
        thoigianketthuc: khungGioMoi.thoigianketthuc,
        ghichu: String(khungGioMoi.ghichu || "")
      };
      
      await ChiTietYeuCau_Service.themChiTietYeuCauMoi(payload);
      alert("Đã thêm khung giờ mới thành công!");
      
      // Reset form thêm khung giờ
      setKhungGioMoi({ ngayhoc: 'Thứ 2', thoigianbatdau: '18:00', thoigianketthuc: '19:30', ghichu: '' });
      
      // Reload lại để cập nhật danh sách mới nhất
      window.location.reload();
    } catch (error) {
      alert("Thêm khung giờ thất bại!");
    }
  };

  const handleDuyetGiaSu = async (ungTuyenDuocChon, yeuCauHienTai) => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt Gia sư này?\nCác gia sư khác ứng tuyển lớp này sẽ tự động bị từ chối.")) return;
    try {
      const maUngTuyen = ungTuyenDuocChon.magiasu_ungtuyen || ungTuyenDuocChon.id;
      if (!maUngTuyen) return alert("🚨 Lỗi: Không lấy được Mã ứng tuyển.");

      await GiaSu_UngTuyen_Service.capNhatTrangThaiUngTuyen(maUngTuyen, { ...ungTuyenDuocChon, trangthai: 1 });

      const cacGiaSuKhac = yeuCauHienTai.danhSachUngTuyen.filter(ut => String(ut.magiasu_ungtuyen || ut.id) !== String(maUngTuyen) && Number(ut.trangthai) === 0);
      for (const utKhac of cacGiaSuKhac) {
        await GiaSu_UngTuyen_Service.capNhatTrangThaiUngTuyen(utKhac.magiasu_ungtuyen || utKhac.id, { ...utKhac, trangthai: 2 });
      }

      await YeuCauTimGiaSu_Service.capNhatTrangThaiYeuCau(yeuCauHienTai.mayeucau, 1);
      alert("🎉 Đã duyệt Gia sư thành công! Lớp học đã được chốt.");
      window.location.reload();
    } catch (error) { alert("Đã xảy ra lỗi khi duyệt gia sư!"); }
  };

  const handleTuChoiGiaSu = async (ungTuyen) => {
    setUngTuyenCanTuChoi(ungTuyen);
    setLyDoTuChoi('');
    setIsRejectModalOpen(true);
  };
  
  const handleXacNhanTuChoiGiaSu = async () => {
    if (!lyDoTuChoi.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    
    try {
      const payload = {
        ...ungTuyenCanTuChoi,
        trangthai: 2,
        lydotuchoi: lyDoTuChoi
      };
      
      await GiaSu_UngTuyen_Service.capNhatTrangThaiUngTuyen(
        ungTuyenCanTuChoi.magiasu_ungtuyen || ungTuyenCanTuChoi.id, 
        payload
      );
      
      alert("Đã từ chối Gia sư.");
      setIsRejectModalOpen(false);
      setUngTuyenCanTuChoi(null);
      setLyDoTuChoi('');
      window.location.reload();
    } catch (error) { 
      alert("Đã xảy ra lỗi!"); 
    }
  };

  const handleLuuSua = async (e) => {
    e.preventDefault();
    try {
      const payloadYeuCau = {
        manguoidung: formSua.manguoidung,
        makhuvuc: formSua.makhuvuc,
        mamonhoc: formSua.mamonhoc,
        ngaybatdauhoc: formSua.ngaybatdauhoc,
        sobuoihoc: Number(formSua.sobuoihoc),
        tonghocphi: Number(formSua.tonghocphi),
        trangthai: Number(formSua.trangthai)
      };
      await YeuCauTimGiaSu_Service.capNhatYeuCau(formSua.mayeucau, payloadYeuCau);
      alert("Cập nhật yêu cầu thành công!");
      window.location.reload();
    } catch (error) { alert("Lỗi khi lưu thông tin cập nhật."); }
  };

  // ====================================================================
  // HÀM XÓA YÊU CẦU (Backend sẽ xóa cả ứng tuyển, học viên, khung giờ, đánh giá)
  // ====================================================================
  const handleDelete = async (mayeucau) => {
    if (!window.confirm("⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA YÊU CẦU NÀY?\n\nHành động này sẽ XÓA VĨNH VIỄN:\n✗ Tất cả ứng tuyển (kể cả bị từ chối)\n✗ Danh sách học viên\n✗ Khung giờ\n✗ Đánh giá (nếu có)")) {
      return;
    }

    try {
      await YeuCauTimGiaSu_Service.xoaYeuCau(mayeucau);
      alert("🎉 Đã xóa yêu cầu và tất cả dữ liệu liên quan!");
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi xóa Yêu cầu:", error);
      alert("🚨 Xóa thất bại! Vui lòng kiểm tra lại.");
    }
  };

  const handleMoDanhGia = (yc) => {
    if (yc.danhGiaCuaToi) { // Fix lỗi typo từ yc.danhGiaCShadow
      setReviewData({
        madanhgia: yc.danhGiaCuaToi.madanhgia,
        mayeucau: yc.mayeucau,
        sosao: yc.danhGiaCuaToi.sodiem,
        nhanxet: yc.danhGiaCuaToi.noidung
      });
    } else {
      setReviewData({ madanhgia: null, mayeucau: yc.mayeucau, sosao: 5, nhanxet: '' });
    }
    setIsReviewOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const payloadDanhGia = {
        mayeucau: String(reviewData.mayeucau),
        madangky: null,
        sodiem: parseFloat(reviewData.sosao),
        noidung: String(reviewData.nhanxet)
      };

      console.log("DEBUG: Gửi đánh giá với payload:", payloadDanhGia);

      if (reviewData.madanhgia) {
        const result = await DanhGia_Service.capNhatDanhGia(reviewData.madanhgia, payloadDanhGia);
        console.log("DEBUG: Kết quả cập nhật đánh giá:", result);
        
        const resultCapNhat = await YeuCauTimGiaSu_Service.capNhatTrangThaiYeuCau(String(reviewData.mayeucau), 2);
        console.log("DEBUG: Đảm bảo trạng thái yêu cầu = 2:", resultCapNhat);
        
        alert("🎉 Đã cập nhật đánh giá thành công!");
      } else {
        const resultDanhGia = await DanhGia_Service.themDanhGiaMoi(payloadDanhGia);
        console.log("DEBUG: Kết quả thêm đánh giá:", resultDanhGia);
        
        const resultCapNhat = await YeuCauTimGiaSu_Service.capNhatTrangThaiYeuCau(String(reviewData.mayeucau), 2);
        console.log("DEBUG: Kết quả cập nhật trạng thái yêu cầu:", resultCapNhat);
        
        alert("🎉 Đã hoàn thành khóa học và ghi nhận đánh giá Gia sư!");
      }

      setIsReviewOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("LỖI khi xử lý đánh giá:", error);
      alert(`Đã xảy ra lỗi: ${error.message || "Không thể thực hiện đánh giá"}`);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.makhuvuc || !formData.mamonhoc || !formData.ngaybatdauhoc || !formData.sobuoihoc || !formData.tonghocphi) return alert("Vui lòng điền đầy đủ các thông tin có dấu * ở Bước 1!");
    }
    if (step === 2) {
      if (khungGioList.length === 0) return alert("Vui lòng thêm ít nhất 1 khung giờ rảnh!");
      if (!khungGioList.every(kg => kg.thoigianbatdau && kg.thoigianketthuc)) return alert("Vui lòng chọn đầy đủ thời gian!");
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleSubmitTaoMoi = async () => {
    if (selectedStudents.length === 0) return alert("Vui lòng chọn ít nhất 1 Học viên!");
    try {
      const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
      const payloadYeuCau = {
        manguoidung: userLocal.manguoidung, makhuvuc: formData.makhuvuc, mamonhoc: formData.mamonhoc,
        ngaybatdauhoc: formData.ngaybatdauhoc, sobuoihoc: Number(formData.sobuoihoc), tonghocphi: Number(formData.tonghocphi),
        trangthai: 0
      };

      const resYC = await YeuCauTimGiaSu_Service.taoYeuCauMoi(payloadYeuCau);
      const newMaYeuCau = resYC?.data?.mayeucau || resYC?.mayeucau || resYC?.id;

      if (!newMaYeuCau) return alert(`🚨 LỖI: Không khởi tạo được bản ghi yêu cầu.`);

      for (const kg of khungGioList) {
        await ChiTietYeuCau_Service.themChiTietYeuCauMoi({
          mayeucau: newMaYeuCau, ngayhoc: String(kg.ngayhoc),
          thoigianbatdau: kg.thoigianbatdau, thoigianketthuc: kg.thoigianketthuc, ghichu: String(kg.ghichu || "")
        });
      }

      for (const mahocvien of selectedStudents) {
        await YeuCau_HocVien_Service.themYeuCauHocVienMoi({ mayeucau: newMaYeuCau, mahocvien: mahocvien });
      }

      alert("🎉 Đã tạo yêu cầu tìm Gia sư thành công!");
      window.location.reload();
    } catch (error) { alert("Quá trình lưu dữ liệu gặp lỗi."); }
  };

  // Lọc môn học theo:
  // 1. Hệ lớp được chọn (nếu có)
  // 2. Môn học có trangthai = 1
  // 3. Hệ lớp của môn học có trangthai = 1
  const monHocDropdown = danhSachMonHoc.filter(m => {
    // Kiểm tra môn học có hoạt động không
    if (m.trangthai !== 1) return false;
    
    // Kiểm tra hệ lớp của môn học có hoạt động không
    const heLop = danhSachHeLop.find(hl => hl.mahelop === String(m.mahelop));
    if (!heLop || heLop.trangthai !== 1) return false;
    
    // Nếu có bộ lọc hệ lớp, chỉ lấy môn học thuộc hệ lớp đó
    if (boLocHeLop && String(m.mahelop) !== String(boLocHeLop)) return false;
    
    return true;
  });

  // ====================================================================
  // 🟢 PHÂN LOẠI DANH SÁCH THEO MÃ TRẠNG THÁI (0, 1, 2, 3)
  // ====================================================================
  const listChoDuyet = danhSachYeuCau.filter(yc => Number(yc.trangthai) === 0);
  const listDangHoc = danhSachYeuCau.filter(yc => Number(yc.trangthai) === 1);
  const listHoanThanh = danhSachYeuCau.filter(yc => Number(yc.trangthai) === 2);
  const listTuChoi = danhSachYeuCau.filter(yc => Number(yc.trangthai) === 3);

  // 🟢 HÀM RENDER KHỐI DANH SÁCH (CÓ THU PHÓNG)
  const renderSection = (title, list, expandedKey, color, icon, canEditDelete = false) => {
    if (list.length === 0) return null;
    const isExpanded = expanded[expandedKey];
    
    return (
      <div>
        <h3 
          onClick={() => setExpanded(prev => ({...prev, [expandedKey]: !prev[expandedKey]}))}
          style={{ 
            color: color, 
            borderBottom: `2px solid ${color}40`, 
            paddingBottom: '8px', 
            marginBottom: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <span className="material-symbols-outlined">{isExpanded ? 'expand_more' : 'chevron_right'}</span>
          <span className="material-symbols-outlined">{icon}</span> 
          {title} ({list.length})
        </h3>
        {isExpanded && (
          <div className="ql-grid">
            {list.map(yc => renderCardYeuCau(yc, canEditDelete))}
          </div>
        )}
      </div>
    );
  };

  const renderCardYeuCau = (yc, canEditDelete = false) => {
    let statusText = 'Đang tìm Gia sư';
    let statusClass = 'open';
    if (Number(yc.trangthai) === 1) { statusText = 'Đang học'; statusClass = 'closed'; }
    if (Number(yc.trangthai) === 2) { statusText = 'Đã hoàn thành'; statusClass = 'completed'; }
    if (Number(yc.trangthai) === 3) { statusText = 'Đã từ chối'; statusClass = 'rejected'; }

    // ✅ LOGIC MỚI: Kiểm tra có ứng tuyển đang chờ không
    const coGiaSuDangCho = yc.danhSachUngTuyen.some(ut => Number(ut.trangthai) === 0);
    const tatCaBiTuChoi = yc.danhSachUngTuyen.length > 0 && yc.danhSachUngTuyen.every(ut => Number(ut.trangthai) === 2);

    // Hiện nút sửa/xóa khi:
    // - canEditDelete = true (trangthai = 0)
    // - VÀ (không có ứng tuyển HOẶC tất cả ứng tuyển đều bị từ chối)
    const hienNutSuaXoa = canEditDelete && (!coGiaSuDangCho || tatCaBiTuChoi);

    return (
      <div className="ql-card" key={yc.mayeucau}>
        <div className="ql-header">
          <h3 className="ql-monhoc">{yc.tenmonhoc} - {yc.tenkhuvuc}</h3>
          <span className={`ql-status ${statusClass}`}>{statusText}</span>
        </div>
        <div className="ql-info-grid" style={{ marginBottom: '12px' }}>
          <div><strong>Ngày bắt đầu học:</strong> {yc.ngaybatdau_str}</div>
          <div><strong>Tổng số buổi học:</strong> {yc.sobuoihoc}</div>
          <div><strong>Tổng học phí:</strong> <span style={{color: '#ef4444', fontWeight: 'bold'}}>{yc.tonghocphi?.toLocaleString()} đ</span></div>
          <div><strong>Học viên:</strong> {yc.danhSachHocVien.length} người</div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { setDetailData(yc); setIsDetailOpen(true); }} style={{ background: '#f8fafc', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span> Xem chi tiết
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {hienNutSuaXoa && (
              <>
                <button className="ql-btn edit" onClick={() => { 
                  setFormSua({...yc, ngaybatdauhoc: yc.ngaybatdauhoc ? new Date(yc.ngaybatdauhoc).toISOString().split('T')[0] : ''}); 
                  setKhungGioMoi({ ngayhoc: 'Thứ 2', thoigianbatdau: '18:00', thoigianketthuc: '19:30', ghichu: '' });
                  setIsEditOpen(true); 
                }}><span className="material-symbols-outlined" style={{fontSize:'16px'}}>edit</span> Sửa</button>
                <button className="ql-btn delete" onClick={() => handleDelete(yc.mayeucau)}><span className="material-symbols-outlined" style={{fontSize:'16px'}}>delete</span> Xóa</button>
              </>
            )}
            {Number(yc.trangthai) === 1 && (
              <button onClick={() => handleMoDanhGia(yc)} style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>task_alt</span> Hoàn thành & Đánh giá
              </button>
            )}
            {Number(yc.trangthai) === 2 && (
              <button onClick={() => handleMoDanhGia(yc)} style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_square</span> Sửa đánh giá
              </button>
            )}
          </div>
        </div>

        {yc.danhSachUngTuyen.length > 0 && Number(yc.trangthai) <= 1 && (
          <div className="ql-applicants-area" style={{ marginTop: '16px' }}>
            <div style={{fontWeight: '700', color: '#334155', marginBottom: '12px'}}>Danh sách Gia sư ứng tuyển ({yc.danhSachUngTuyen.length}):</div>
            {yc.danhSachUngTuyen.map(ut => {
              const infoGS = danhSachGiaSuFull.find(g => String(g.magiasu) === String(ut.magiasu)) || {};
              return (
                <div className="ql-applicant-card" key={ut.magiasu_ungtuyen}>
                  <div className="ql-tutor-info">
                    <div className="ql-tutor-name"><span className="material-symbols-outlined" style={{fontSize:'18px', verticalAlign:'middle', marginRight:'4px'}}>school</span>{infoGS.hoten}</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}><strong>SĐT:</strong> {infoGS.sdt} | <strong>Email:</strong> {infoGS.email}</div>
                  </div>
                  <div className="ql-btn-group">
                    {Number(ut.trangthai) === 1 ? (
                      <button className="ql-btn contact" disabled><span className="material-symbols-outlined" style={{fontSize:'18px'}}>handshake</span> Đã Chọn</button>
                    ) : Number(ut.trangthai) === 2 ? (
                      <button className="ql-btn reject" disabled style={{backgroundColor: '#cbd5e1', color: '#475569'}}>Đã Từ Chối</button>
                    ) : Number(yc.trangthai) === 0 ? (
                      <>
                        <button className="ql-btn approve" onClick={() => handleDuyetGiaSu(ut, yc)}><span className="material-symbols-outlined" style={{fontSize:'18px'}}>check</span> Duyệt</button>
                        <button className="ql-btn reject" onClick={() => handleTuChoiGiaSu(ut)}><span className="material-symbols-outlined" style={{fontSize:'18px'}}>close</span> Từ chối</button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ql-container">
      <h2 className="ql-title">Quản Lý Yêu Cầu Tìm Gia Sư Của Tôi</h2>

      <div className="ql-main-tabs">
        <button className={`ql-main-tab-btn ${activeMainTab === 'danh_sach' ? 'active' : ''}`} onClick={() => setActiveMainTab('danh_sach')}>
          <span className="material-symbols-outlined">list_alt</span> Danh sách yêu cầu
        </button>
        <button className={`ql-main-tab-btn ${activeMainTab === 'tao_moi' ? 'active' : ''}`} onClick={() => setActiveMainTab('tao_moi')}>
          <span className="material-symbols-outlined">add_circle</span> Tạo yêu cầu mới
        </button>
      </div>

      {dangTai ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải dữ liệu...</div>
      ) : activeMainTab === 'danh_sach' ? (

        /* ================= TAB 1: DANH SÁCH YÊU CẦU ================= */
        <>
          {/* KHỐI Ô THỐNG KÊ */}
          <div className="nh-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #f59e0b' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#d97706' }}><span className="material-symbols-outlined">hourglass_top</span></div>
              <div><div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Chờ duyệt</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listChoDuyet.length}</div></div>
            </div>
            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #0284c7' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#0284c7' }}><span className="material-symbols-outlined">menu_book</span></div>
              <div><div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Đang học</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listDangHoc.length}</div></div>
            </div>
            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #10b981' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10b981' }}><span className="material-symbols-outlined">verified</span></div>
              <div><div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Hoàn thành</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listHoanThanh.length}</div></div>
            </div>
            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #ef4444' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef2f2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444' }}><span className="material-symbols-outlined">cancel</span></div>
              <div><div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Đã từ chối</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listTuChoi.length}</div></div>
            </div>
          </div>

          {danhSachYeuCau.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px' }}>
              Bạn chưa tạo yêu cầu tìm gia sư nào. Hãy chuyển sang Tab <strong>Tạo yêu cầu mới</strong>.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {renderSection('Yêu cầu đang chờ duyệt / Tìm Gia sư', listChoDuyet, 'choDuyet', '#d97706', 'hourglass_empty', true)}
              {renderSection('Lớp học đang diễn ra', listDangHoc, 'dangHoc', '#0284c7', 'local_library', false)}
              {renderSection('Khóa học đã hoàn thành', listHoanThanh, 'hoanThanh', '#10b981', 'task_alt', false)}
              {renderSection('Yêu cầu đã từ chối / Hủy bỏ', listTuChoi, 'tuChoi', '#ef4444', 'block', false)}
            </div>
          )}

          {/* MODAL ĐÁNH GIÁ */}
          {isReviewOpen && (
            <div className="bc-modal-overlay">
              <div className="bc-modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
                <div className="bc-modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
                  <h3 style={{ margin: 0, color: '#1e3a8a' }}>
                    {reviewData.madanhgia ? 'Chỉnh sửa Đánh giá' : 'Đánh giá Gia sư'}
                  </h3>
                  <button onClick={() => setIsReviewOpen(false)} className="bc-close-btn" style={{ position: 'absolute', right: '16px' }}>&times;</button>
                </div>
                <form onSubmit={handleSubmitReview} style={{ padding: '20px 0' }}>
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
                            fontSize: '42px', cursor: 'pointer',
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
                    <textarea className="tcn-input" rows="4" required placeholder="Chia sẻ cảm nhận về thái độ, phương pháp giảng dạy..." value={reviewData.nhanxet} onChange={e => setReviewData({ ...reviewData, nhanxet: e.target.value })} style={{ background: '#f8fafc' }}></textarea>
                  </div>
                  <div className="bc-modal-footer" style={{ marginTop: '24px', justifyContent: 'center', gap: '12px' }}>
                    <button type="button" onClick={() => setIsReviewOpen(false)} className="btn-outline" style={{ minWidth: '100px' }}>Hủy bỏ</button>
                    <button type="submit" className="btn-submit" style={{ background: '#0284c7', minWidth: '160px' }}>{reviewData.madanhgia ? 'Lưu thay đổi' : 'Gửi Đánh Giá'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL TỪ CHỐI GIA SƯ */}
          {isRejectModalOpen && ungTuyenCanTuChoi && (
            <div className="bc-modal-overlay">
              <div className="bc-modal-content" style={{ maxWidth: '500px' }}>
                <div className="bc-modal-header">
                  <h3 style={{ margin: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined">block</span>
                    Từ chối Gia sư ứng tuyển
                  </h3>
                  <button onClick={() => setIsRejectModalOpen(false)} className="bc-close-btn">&times;</button>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
                      Vui lòng nhập lý do từ chối để Gia sư hiểu rõ tình huống.
                    </p>
                  </div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' }}>
                    Lý do từ chối <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={lyDoTuChoi}
                    onChange={(e) => setLyDoTuChoi(e.target.value)}
                    placeholder="VD: Không phù hợp với lịch của học viên, học phí quá cao..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    maxLength={200}
                  />
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {lyDoTuChoi.length}/200 ký tự
                  </div>
                </div>
                <div className="bc-modal-footer">
                  <button 
                    type="button" 
                    onClick={() => setIsRejectModalOpen(false)} 
                    className="btn-outline"
                    style={{ padding: '10px 20px' }}
                  >
                    Hủy
                  </button>
                  <button 
                    type="button" 
                    onClick={handleXacNhanTuChoiGiaSu}
                    style={{
                      padding: '10px 20px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BỔ SUNG: Modal Xem chi tiết (Hiển thị mảng khung giờ) */}
          {isDetailOpen && detailData && (
            <div className="bc-modal-overlay">
              <div className="bc-modal-content" style={{ maxWidth: '500px' }}>
                <div className="bc-modal-header"><h3>Chi tiết yêu cầu</h3><button onClick={() => setIsDetailOpen(false)} className="bc-close-btn">&times;</button></div>
                <div style={{ padding: '16px 0', lineHeight: '1.6' }}>
                  <p><strong>📚 Môn học:</strong> {detailData.tenmonhoc}</p><p><strong>📍 Khu vực:</strong> {detailData.tenkhuvuc}</p>
                  <p><strong>📅 Dự kiến bắt đầu:</strong> {detailData.ngaybatdau_str}</p><p><strong>⏰ Số buổi:</strong> {detailData.sobuoihoc} buổi</p>
                  <p><strong>💰 Mức học phí:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{detailData.tonghocphi?.toLocaleString()} VNĐ</span></p>
                  
                  <div style={{ marginTop: '16px', background: '#f0f9ff', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#0284c7' }}>🕒 Lịch học ({detailData.danhSachKhungGio?.length || 0}):</p>
                    {detailData.danhSachKhungGio?.length === 0 ? <span>Chưa thiết lập khung giờ</span> : (
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {detailData.danhSachKhungGio.map((kg, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            <strong>{kg.ngayhoc}</strong> ({kg.thoigianbatdau} - {kg.thoigianketthuc})
                            {kg.ghichu && <span style={{ fontStyle: 'italic', color: '#64748b' }}> - {kg.ghichu}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>🧑‍🎓 Học viên tham gia ({detailData.danhSachHocVien.length}):</p>
                    {detailData.danhSachHocVien.length === 0 ? <span>Chưa cập nhật</span> : <ul>{detailData.danhSachHocVien.map((hv, idx) => <li key={idx}><strong>{hv.tenhocvien}</strong> (SN: {hv.namsinh})</li>)}</ul>}
                  </div>
                </div>
                <div className="bc-modal-footer"><button onClick={() => setIsDetailOpen(false)} className="btn-outline">Đóng</button></div>
              </div>
            </div>
          )}

          {/* BỔ SUNG: Modal Sửa (Hiển thị mảng khung giờ & nút xóa khung giờ) */}
          {isEditOpen && (
            <div className="bc-modal-overlay">
              <div className="bc-modal-content" style={{ maxWidth: '500px' }}>
                <div className="bc-modal-header"><h3>Chỉnh sửa yêu cầu</h3><button onClick={() => setIsEditOpen(false)} className="bc-close-btn">&times;</button></div>
                
                <form onSubmit={handleLuuSua} style={{ marginTop: '16px' }}>
                  <div className="tcn-form-group"><label>Khai giảng</label><input type="date" className="tcn-input" value={formSua.ngaybatdauhoc} onChange={e => setFormSua({ ...formSua, ngaybatdauhoc: e.target.value })} required/></div>
                  <div className="tcn-row">
                    <div className="tcn-form-group"><label>Số buổi</label><input type="number" className="tcn-input" value={formSua.sobuoihoc} onChange={e => setFormSua({ ...formSua, sobuoihoc: e.target.value })} required/></div>
                    <div className="tcn-form-group"><label>Học phí</label><input type="number" className="tcn-input" value={formSua.tonghocphi} onChange={e => setFormSua({ ...formSua, tonghocphi: e.target.value })} required/></div>
                  </div>
                  <div className="bc-modal-footer" style={{ marginTop: '12px' }}>
                    <button type="button" onClick={() => setIsEditOpen(false)} className="btn-outline">Hủy bỏ</button><button type="submit" className="btn-submit">Lưu cập nhật</button>
                  </div>
                </form>

                {/* KHU VỰC QUẢN LÝ LỊCH HỌC TRONG MODAL SỬA */}
                <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#334155' }}>Quản lý khung giờ (Lịch học)</h4>
                  
                  {/* DANH SÁCH KHUNG GIỜ HIỆN CÓ */}
                  {formSua.danhSachKhungGio && formSua.danhSachKhungGio.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {formSua.danhSachKhungGio.map(kg => (
                        <li key={kg.machitietyeucau} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <strong>{kg.ngayhoc}</strong>: {kg.thoigianbatdau} - {kg.thoigianketthuc}
                            {kg.ghichu && <div style={{ fontSize: '12px', color: '#64748b' }}>Ghi chú: {kg.ghichu}</div>}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteChiTiet(kg.machitietyeucau)} 
                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}
                            title="Xóa lịch học này"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Chưa thiết lập khung giờ nào.</p>
                  )}

                  {/* FORM THÊM KHUNG GIỜ MỚI */}
                  <div style={{ marginTop: '16px', background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <p style={{ fontWeight: 'bold', color: '#0284c7', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                      Thêm khung giờ mới
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Ngày học</label>
                        <select 
                          className="tcn-input" 
                          value={khungGioMoi.ngayhoc} 
                          onChange={e => setKhungGioMoi({ ...khungGioMoi, ngayhoc: e.target.value })}
                          style={{ width: '100%', fontSize: '13px' }}
                        >
                          {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: '1 1 100px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Từ</label>
                        <input 
                          type="time" 
                          className="tcn-input" 
                          value={khungGioMoi.thoigianbatdau} 
                          onChange={e => setKhungGioMoi({ ...khungGioMoi, thoigianbatdau: e.target.value })}
                          style={{ width: '100%', fontSize: '13px' }}
                        />
                      </div>
                      <div style={{ flex: '1 1 100px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Đến</label>
                        <input 
                          type="time" 
                          className="tcn-input" 
                          value={khungGioMoi.thoigianketthuc} 
                          onChange={e => setKhungGioMoi({ ...khungGioMoi, thoigianketthuc: e.target.value })}
                          style={{ width: '100%', fontSize: '13px' }}
                        />
                      </div>
                      <div style={{ flex: '1 1 100%', marginTop: '4px' }}>
                        <input 
                          type="text" 
                          className="tcn-input" 
                          value={khungGioMoi.ghichu} 
                          onChange={e => setKhungGioMoi({ ...khungGioMoi, ghichu: e.target.value })}
                          placeholder="Ghi chú (tùy chọn)"
                          style={{ width: '100%', fontSize: '13px' }}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleThemKhungGioMoi}
                        style={{ 
                          flex: '1 1 100%', 
                          background: '#0284c7', 
                          color: '#ffffff', 
                          border: 'none', 
                          padding: '8px 12px', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '6px',
                          marginTop: '8px'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                        Thêm khung giờ này
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      ) : (

        /* ================= TAB 2: BIỂU MẪU TẠO MỚI 3 BƯỚC (GIỮ NGUYÊN) ================= */
        <div className="yctg-container">
          <div className="yctg-header">
            <h1 className="yctg-title">Tạo Yêu Cầu Tìm Gia Sư Mới</h1>
            <p className="yctg-subtitle">Thiết lập chi tiết lớp học để Gia sư có thể hình dung rõ nhất</p>
          </div>

          <div className="yctg-stepper">
            <div className={`yctg-step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}><div className="yctg-step-circle">{step > 1 ? '✓' : '1'}</div><div className="yctg-step-label">Thông Tin Lớp</div></div>
            <div className={`yctg-step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}><div className="yctg-step-circle">{step > 2 ? '✓' : '2'}</div><div className="yctg-step-label">Lịch & Khung Giờ</div></div>
            <div className={`yctg-step ${step >= 3 ? 'active' : ''}`}><div className="yctg-step-circle">3</div><div className="yctg-step-label">Chọn Học Viên</div></div>
          </div>

          <div className="yctg-form-content">
            {step === 1 && (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Thông tin lớp học cơ bản</h3>
                <div className="yctg-row">
                  <div className="yctg-form-group"><label className="yctg-form-label">Khu vực *</label><select className="yctg-form-control" name="makhuvuc" value={formData.makhuvuc} onChange={e => setFormData({...formData, makhuvuc: e.target.value})}><option value="">-- Chọn khu vực học --</option>{danhSachKhuVuc.filter(k => k.trangthai === 1).map(k => <option key={k.makhuvuc} value={k.makhuvuc}>{k.tenkhuvuc}</option>)}</select></div>
                  <div className="yctg-form-group"><label className="yctg-form-label">Cấp học (Tùy chọn lọc)</label><select className="yctg-form-control" value={boLocHeLop} onChange={e => { setBoLocHeLop(e.target.value); setFormData({...formData, mamonhoc: ''}); }}><option value="">-- Tất cả hệ lớp --</option>{danhSachHeLop.filter(hl => hl.trangthai === 1).map(hl => <option key={hl.mahelop} value={hl.mahelop}>{hl.tenhelop}</option>)}</select></div>
                </div>
                <div className="yctg-row">
                  <div className="yctg-form-group"><label className="yctg-form-label">Môn học *</label><select className="yctg-form-control" name="mamonhoc" value={formData.mamonhoc} onChange={e => setFormData({...formData, mamonhoc: e.target.value})}><option value="">-- Chọn môn học --</option>{monHocDropdown.map(m => <option key={m.mamonhoc} value={m.mamonhoc}>{m.tenmonhoc}</option>)}</select></div>
                  <div className="yctg-form-group"><label className="yctg-form-label">Ngày khai giảng dự kiến *</label><input type="date" className="yctg-form-control" name="ngaybatdauhoc" value={formData.ngaybatdauhoc} onChange={e => setFormData({...formData, ngaybatdauhoc: e.target.value})} min={new Date().toISOString().split('T')[0]} /></div>
                </div>
                <div className="yctg-row">
                  <div className="yctg-form-group"><label className="yctg-form-label">Số buổi học *</label><input type="number" className="yctg-form-control" name="sobuoihoc" value={formData.sobuoihoc} onChange={e => setFormData({...formData, sobuoihoc: e.target.value})} placeholder="VD: 3" /></div>
                  <div className="yctg-form-group"><label className="yctg-form-label">Tổng học phí *</label><input type="number" className="yctg-form-control" name="tonghocphi" value={formData.tonghocphi} onChange={e => setFormData({...formData, tonghocphi: e.target.value})} placeholder="VD: 150000" /></div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Thiết lập các khung giờ rảnh</h3>
                {khungGioList.map((kg, index) => (
                  <div key={index} className="yctg-timeslot-box" style={{ flexWrap: 'wrap' }}>
                    <div className="yctg-form-group" style={{ flex: 1.5 }}><label className="yctg-form-label">Ngày</label><select className="yctg-form-control" value={kg.ngayhoc} onChange={(e) => { const newList=[...khungGioList]; newList[index].ngayhoc=e.target.value; setKhungGioList(newList); }}>{['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="yctg-form-group"><label className="yctg-form-label">Từ</label><input type="time" className="yctg-form-control" value={kg.thoigianbatdau} onChange={(e) => { const newList=[...khungGioList]; newList[index].thoigianbatdau=e.target.value; setKhungGioList(newList); }} /></div>
                    <div className="yctg-form-group"><label className="yctg-form-label">Đến</label><input type="time" className="yctg-form-control" value={kg.thoigianketthuc} onChange={(e) => { const newList=[...khungGioList]; newList[index].thoigianketthuc=e.target.value; setKhungGioList(newList); }} /></div>
                    {khungGioList.length > 1 && <button type="button" className="yctg-btn-remove" onClick={() => { const newList=[...khungGioList]; newList.splice(index,1); setKhungGioList(newList); }}><span className="material-symbols-outlined">delete</span></button>}

                    <div className="yctg-form-group" style={{ flexBasis: '100%', marginBottom: 0, marginTop: '8px' }}>
                      <input type="text" className="yctg-form-control" value={kg.ghichu} onChange={(e) => { const newList=[...khungGioList]; newList[index].ghichu=e.target.value; setKhungGioList(newList); }} placeholder="Ghi chú thêm cho ca này (VD: Học tại nhà ngoại, dạy Online...)" />
                    </div>
                  </div>
                ))}
                <button type="button" className="yctg-btn-add" onClick={() => setKhungGioList([...khungGioList, { ngayhoc: 'Thứ 2', thoigianbatdau: '18:00', thoigianketthuc: '19:30', ghichu: '' }])}><span className="material-symbols-outlined">add_circle</span> Thêm khung giờ khác</button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: '10px' }}>Chọn học viên tham gia ({selectedStudents.length}/3)</h3>
                {selectedStudents.length === 3 && (
                  <div style={{ 
                    background: '#fffbeb', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    color: '#b45309',
                    marginBottom: '16px',
                    border: '1px solid #fcd34d',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    ⚠️ Đã đạt giới hạn 3 học viên. Bỏ chọn học viên hiện tại nếu muốn thay đổi.
                  </div>
                )}
                {danhSachHocVienCuaToi.length === 0 ? (
                  <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '8px', color: '#b45309' }}>Bạn chưa có hồ sơ học viên. Vui lòng quay lại tab Học viên để tạo hồ sơ trước.</div>
                ) : (
                  <div className="yctg-student-grid">
                    {danhSachHocVienCuaToi.map(hv => {
                      const isSelected = selectedStudents.includes(hv.mahocvien);
                      const isDisabled = !isSelected && selectedStudents.length >= 3;
                      return (
                        <div 
                          key={hv.mahocvien} 
                          className={`yctg-student-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`} 
                          onClick={() => {
                            if (isDisabled) {
                              alert("Chỉ được chọn tối đa 3 học viên cho một yêu cầu!");
                              return;
                            }
                            setSelectedStudents(prev => 
                              prev.includes(hv.mahocvien) 
                                ? prev.filter(id => id !== hv.mahocvien) 
                                : [...prev, hv.mahocvien]
                            );
                          }}
                          style={{ 
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.5 : 1
                          }}
                        >
                          <input 
                            type="checkbox" 
                            className="yctg-student-checkbox" 
                            checked={isSelected} 
                            disabled={isDisabled}
                            readOnly 
                          />
                          <div className="yctg-student-info"><h4>{hv.tenhocvien}</h4><p>SN: {hv.namsinh} - Lực học: {hv.hocluc}</p></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="yctg-footer">
            {step > 1 && <button type="button" className="yctg-btn yctg-btn-prev" onClick={prevStep}><span className="material-symbols-outlined">arrow_back</span> Quay lại</button>}
            {step < 3 ? (
              <button type="button" className="yctg-btn yctg-btn-next" onClick={nextStep}>Tiếp tục <span className="material-symbols-outlined">arrow_forward</span></button>
            ) : (
              <button type="button" className="yctg-btn yctg-btn-submit" onClick={handleSubmitTaoMoi} disabled={danhSachHocVienCuaToi.length === 0} style={{ opacity: danhSachHocVienCuaToi.length === 0 ? 0.5 : 1 }}><span className="material-symbols-outlined">publish</span> Đăng Yêu Cầu</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyYeuCau;