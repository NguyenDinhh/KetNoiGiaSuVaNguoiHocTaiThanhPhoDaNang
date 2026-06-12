import React, { useState, useEffect } from 'react';
import '../../assets/css/GiaSu.css';

// ================= CÁC SERVICE HỆ THỐNG =================
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import KhungGio_GiaSu_MonHoc_Service from '../../services/KhungGio_GiaSu_MonHoc_Service';
import GiaSu_Service from '../../services/GiaSu_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import KhuVuc_Service from '../../services/KhuVuc_Service';
import GiaSu_BangCap_Service from '../../services/GiaSu_BangCap_Service';
import BangCap_MonHoc_Service from '../../services/BangCap_MonHoc_Service';
import HeLop_Service from '../../services/HeLop_Service';

import DangKyLich_Service from '../../services/DangKyLich_Service';
import ChiTietDangKyLich_Service from '../../services/ChiTietDangKyLich_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import HocVien_Service from '../../services/HocVien_Service';
import YeuCau_HocVien_Service from '../../services/YeuCau_HocVien_Service';
import DanhGia_Service from '../../services/DanhGia_Service';

const YeuCauDangKyLich = () => {
  const [maGiaSu, setMaGiaSu] = useState(null);

  const [danhSachLop, setDanhSachLop] = useState([]);
  const [danhSachKhungGio, setDanhSachKhungGio] = useState([]);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [monHocDuocPhepDay, setMonHocDuocPhepDay] = useState([]);

  const [danhSachDangKy, setDanhSachDangKy] = useState([]);
  const [loadingDangKy, setLoadingDangKy] = useState(true);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewHienTai, setReviewHienTai] = useState(null);
  
  // State cho modal từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [dangKyCanTuChoi, setDangKyCanTuChoi] = useState(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');

  const [timKiemMon, setTimKiemMon] = useState('');
  const [heLopChon, setHeLopChon] = useState('');

  const [isModalLopOpen, setIsModalLopOpen] = useState(false);
  const [isEditLop, setIsEditLop] = useState(false);
  const [formLop, setFormLop] = useState({ magiasu_monhoc: null, mamonhoc: '', makhuvuc: '', hocphimoibuoi: '', thoiluonghoc: '', sobuoihoc: '' });

  const [isModalKhungGioOpen, setIsModalKhungGioOpen] = useState(false);
  const [isEditKhungGio, setIsEditKhungGio] = useState(false);
  const [formKhungGio, setFormKhungGio] = useState({ makhunggio: null, magiasu_monhoc: null, ngayday: 'Thứ 2', thoigianbatdau: '18:00', thoigianketthuc: '19:30' });

  // State cho thu/phóng các nhóm
  const [isChoDuyetExpanded, setIsChoDuyetExpanded] = useState(true);
  const [isDangDayExpanded, setIsDangDayExpanded] = useState(true);
  const [isHoanThanhExpanded, setIsHoanThanhExpanded] = useState(false);
  const [isTuChoiExpanded, setIsTuChoiExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDuLieu = async () => {
      try {
        let dsMonHoc = [];
        let bc_mh_Res = [];
        try {
          const [mhRes, kvRes, bcmhRes, hlRes] = await Promise.all([
            MonHoc_Service.layDanhSachMonHoc().catch(() => []),
            KhuVuc_Service.layDanhSachKhuVuc().catch(() => []),
            BangCap_MonHoc_Service.layDanhSach().catch(() => []),
            HeLop_Service.layDanhSachHeLop().catch(() => [])
          ]);

          if (isMounted) {
            dsMonHoc = Array.isArray(mhRes) ? mhRes : (mhRes?.data || []);
            bc_mh_Res = Array.isArray(bcmhRes) ? bcmhRes : (bcmhRes?.data || []);
            setDanhSachMonHoc(dsMonHoc);
            setDanhSachKhuVuc(Array.isArray(kvRes) ? kvRes : (kvRes?.data || []));
            setDanhSachHeLop(Array.isArray(hlRes) ? hlRes : (hlRes?.data || []));
          }
        } catch (error) {
          console.error("Lỗi tải danh mục gốc:", error);
        }

        const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
        if (!userLocal) return;

        const giasuData = await GiaSu_Service.layChiTietGiaSuvoimanguoidung(userLocal.manguoidung);

        if (giasuData?.magiasu && isMounted) {
          setMaGiaSu(giasuData.magiasu);
          fetchDanhSachLopVaKhungGio(giasuData.magiasu);

          try {
            const cacBangCapRes = await GiaSu_BangCap_Service.layDanhSachGiaSuBangCap();
            const cacBangCap = Array.isArray(cacBangCapRes) ? cacBangCapRes : (cacBangCapRes?.data || []);

            const bangCapHopLe = cacBangCap.filter(bc => bc.magiasu === giasuData.magiasu && Number(bc.trangthaiduyet) === 1);
            const mangMaBangCapHopLe = bangCapHopLe.map(bc => Number(bc.mabangcap));

            const mangMaMonHocChoPhep = bc_mh_Res
              .filter(mapping => mangMaBangCapHopLe.includes(Number(mapping.mabangcap)))
              .map(mapping => Number(mapping.mamonhoc));

            const maMonHocKhongTrungLap = [...new Set(mangMaMonHocChoPhep)];
            const monHocChoUI = dsMonHoc.filter(m => 
              maMonHocKhongTrungLap.includes(Number(m.mamonhoc)) && 
              m.trangthai === 1
            );

            setMonHocDuocPhepDay(monHocChoUI);
          } catch (error) {
            console.error("Lỗi khi lọc môn học theo bằng cấp:", error);
          }
        }
      } catch (error) {
        console.error("Lỗi tải thông tin tổng hợp:", error);
      }
    };

    loadDuLieu();
    return () => { isMounted = false; };
  }, []);

  const fetchDanhSachLopVaKhungGio = async (maGS) => {
    try {
      setLoadingDangKy(true);

      const [cacLop, cacKhungGio, cacDangKy, cacChiTietDK, cacNguoiDung, cacHocVien, cacYeuCauHocVien, resMonHoc, resDanhGia] = await Promise.all([
        GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
        KhungGio_GiaSu_MonHoc_Service.layDanhSachKhungGio().catch(() => []),
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
        ChiTietDangKyLich_Service.layDanhSachChiTietDangKyLich().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
        HocVien_Service.layDanhSachHocVien().catch(() => []),
        YeuCau_HocVien_Service.layDanhSachYeuCauHocVien().catch(() => []),
        MonHoc_Service.layDanhSachMonHoc().catch(() => []),
        DanhGia_Service.layDanhSachDanhGia().catch(() => [])
      ]);

      const listMonHoc = Array.isArray(resMonHoc) ? resMonHoc : (resMonHoc?.data || []);
      const arrDanhGia = Array.isArray(resDanhGia) ? resDanhGia : (resDanhGia?.data || []);
      const arrYeuCauHocVien = Array.isArray(cacYeuCauHocVien) ? cacYeuCauHocVien : (cacYeuCauHocVien?.data || []);

      const lopCuaToi = cacLop.filter(l => Number(l.magiasu) === Number(maGS));
      
      // Sắp xếp: Lớp đang hoạt động (trangthai=1) lên trên, lớp bị khóa (trangthai=0) xuống dưới
      lopCuaToi.sort((a, b) => Number(b.trangthai) - Number(a.trangthai));
      
      setDanhSachLop(lopCuaToi);
      setDanhSachKhungGio(cacKhungGio);

      const mangMaLopCuaToi = lopCuaToi.map(l => Number(l.magiasu_monhoc));
      const listDangKyCuaToi = (cacDangKy || []).filter(dk => mangMaLopCuaToi.includes(Number(dk.magiasu_monhoc)));

      const danhSachDangKyHoanChinh = listDangKyCuaToi.map(dk => {
        const lopHoc = lopCuaToi.find(l => Number(l.magiasu_monhoc) === Number(dk.magiasu_monhoc)) || {};
        const mon = listMonHoc.find(m => Number(m.mamonhoc) === Number(lopHoc.mamonhoc));

        const nguoiHoc = (cacNguoiDung || []).find(nd => Number(nd.id || nd.manguoidung) === Number(dk.manguoidung)) || {};
        
        // Lọc học viên từ YEUCAU_HOCVIEN theo madangky, sau đó join với bảng HOCVIEN
        const maHocVienDangKy = arrYeuCauHocVien
          .filter(yc => Number(yc.madangky) === Number(dk.madangky))
          .map(yc => Number(yc.mahocvien));
        
        const hocVienLienQuan = (cacHocVien || []).filter(hv => maHocVienDangKy.includes(Number(hv.mahocvien)));
        
        const khungGioChon = (cacChiTietDK || []).filter(ct => Number(ct.madangky) === Number(dk.madangky));
        const danhGiaCuaDon = arrDanhGia.find(dg => Number(dg.madangky) === Number(dk.madangky));

        return {
          ...dk,
          tenmonhoc: mon ? mon.tenmonhoc : 'Đang cập nhật',
          nguoihoc_ten: nguoiHoc.name || nguoiHoc.hoten || 'Chưa cập nhật',
          nguoihoc_sdt: nguoiHoc.phone || nguoiHoc.sodienthoai || 'Chưa cập nhật',
          nguoihoc_email: nguoiHoc.email || 'Chưa cập nhật',
          danhGiaCuaDon: danhGiaCuaDon || null,
          danhSachHocVien: hocVienLienQuan,
          danhSachKhungGioChon: khungGioChon
        };
      });

      // Sắp xếp theo trạng thái trước (0 lên trên), sau đó sắp xếp mỗi nhóm theo madangky giảm dần (mới nhất lên trên)
      danhSachDangKyHoanChinh.sort((a, b) => {
        if (Number(a.trangthai) !== Number(b.trangthai)) {
          return Number(a.trangthai) - Number(b.trangthai);
        }
        return Number(b.madangky) - Number(a.madangky);
      });
      
      setDanhSachDangKy(danhSachDangKyHoanChinh);

    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoadingDangKy(false);
    }
  };

  const handlePheDuyetDangKy = async (dk, trangThaiMoi) => {
    // Nếu từ chối (trangThaiMoi = 2), mở modal nhập lý do
    if (trangThaiMoi === 2) {
      setDangKyCanTuChoi(dk);
      setLyDoTuChoi('');
      setIsRejectModalOpen(true);
      return;
    }
    
    // Nếu phê duyệt (trangThaiMoi = 1)
    const hanhDong = "ĐỒNG Ý";
    if (!window.confirm(`Bạn có chắc chắn muốn ${hanhDong} yêu cầu đăng ký lịch học này không?`)) return;

    try {
      const payload = {
        madangky: dk.madangky,
        manguoidung: dk.manguoidung,
        magiasu_monhoc: dk.magiasu_monhoc,
        ngaybatdauhoc: dk.ngaybatdauhoc,
        tonghocphi: dk.tonghocphi,
        ghichu: dk.ghichu || "",
        trangthai: trangThaiMoi
      };

      await DangKyLich_Service.capNhatDangKyLich(dk.madangky, payload);

      if (dk.danhSachKhungGioChon && dk.danhSachKhungGioChon.length > 0) {
        const trangThaiKhungGioMoi = 2; // Đang dạy
        for (const ct of dk.danhSachKhungGioChon) {
          const kgGoc = danhSachKhungGio.find(k => Number(k.makhunggio) === Number(ct.makhunggio));
          if (kgGoc) {
            const payloadKhungGio = {
              magiasu_monhoc: kgGoc.magiasu_monhoc,
              ngayday: kgGoc.ngayday,
              thoigianbatdau: String(kgGoc.thoigianbatdau).slice(0, 5),
              thoigianketthuc: String(kgGoc.thoigianketthuc).slice(0, 5),
              trangthai: trangThaiKhungGioMoi
            };
            await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(ct.makhunggio, payloadKhungGio);
          }
        }
      }

      alert(`Đã thực hiện xử lý thành công!`);
      fetchDanhSachLopVaKhungGio(maGiaSu);
    } catch (error) {
      alert("Đã xảy ra lỗi hệ thống, phê duyệt thất bại!");
    }
  };
  
  const handleXacNhanTuChoi = async () => {
    if (!lyDoTuChoi.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    
    const dk = dangKyCanTuChoi;
    
    try {
      const payload = {
        madangky: dk.madangky,
        manguoidung: dk.manguoidung,
        magiasu_monhoc: dk.magiasu_monhoc,
        ngaybatdauhoc: dk.ngaybatdauhoc,
        tonghocphi: dk.tonghocphi,
        ghichu: dk.ghichu || "",
        trangthai: 2, // Từ chối
        lydotuchoi: lyDoTuChoi
      };

      await DangKyLich_Service.capNhatDangKyLich(dk.madangky, payload);

      // Mở lại khung giờ (chuyển về trạng thái 1 - Sẵn sàng)
      if (dk.danhSachKhungGioChon && dk.danhSachKhungGioChon.length > 0) {
        for (const ct of dk.danhSachKhungGioChon) {
          const kgGoc = danhSachKhungGio.find(k => Number(k.makhunggio) === Number(ct.makhunggio));
          if (kgGoc) {
            const payloadKhungGio = {
              magiasu_monhoc: kgGoc.magiasu_monhoc,
              ngayday: kgGoc.ngayday,
              thoigianbatdau: String(kgGoc.thoigianbatdau).slice(0, 5),
              thoigianketthuc: String(kgGoc.thoigianketthuc).slice(0, 5),
              trangthai: 1 // Mở lại
            };
            await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(ct.makhunggio, payloadKhungGio);
          }
        }
      }

      alert("Đã từ chối yêu cầu đăng ký!");
      setIsRejectModalOpen(false);
      setDangKyCanTuChoi(null);
      setLyDoTuChoi('');
      fetchDanhSachLopVaKhungGio(maGiaSu);
    } catch (error) {
      alert("Đã xảy ra lỗi hệ thống, từ chối thất bại!");
    }
  };

  const handleXemDanhGia = (dk) => {
    if (dk.danhGiaCuaDon) {
      setReviewHienTai(dk.danhGiaCuaDon);
      setIsReviewModalOpen(true);
    } else {
      alert("Người học chưa để lại đánh giá cho khóa học này.");
    }
  };

  const timTenMonHoc = (maMon) => {
    const mon = danhSachMonHoc.find(m => m.mamonhoc === Number(maMon));
    return mon ? mon.tenmonhoc : `Mã môn: ${maMon}`;
  };

  const timTenKhuVuc = (maKV) => {
    const kv = danhSachKhuVuc.find(k => k.makhuvuc === Number(maKV));
    return kv ? kv.tenkhuvuc : `Mã KV: ${maKV}`;
  };

  const monHocDaLoc = monHocDuocPhepDay.filter(m => {
    const matchTen = m.tenmonhoc.toLowerCase().includes(timKiemMon.toLowerCase());
    const matchHeLop = heLopChon ? Number(m.mahelop) === Number(heLopChon) : true;
    return matchTen && matchHeLop;
  });

  const handleMoModalThemLop = () => {
    if (!maGiaSu) return alert("Vui lòng cập nhật hồ sơ Gia sư trước!");
    if (monHocDuocPhepDay.length === 0) return alert("Bạn chưa có bằng cấp nào được hệ thống phê duyệt.");
    setTimKiemMon(''); setHeLopChon('');
    setFormLop({ magiasu_monhoc: null, mamonhoc: '', makhuvuc: '', hocphimoibuoi: '', thoiluonghoc: '', sobuoihoc: '' });
    setIsEditLop(false); setIsModalLopOpen(true);
  };

  const handleMoModalSuaLop = (lop) => {
    setTimKiemMon(''); setHeLopChon('');
    setFormLop({ magiasu_monhoc: lop.magiasu_monhoc, mamonhoc: lop.mamonhoc, makhuvuc: lop.makhuvuc, hocphimoibuoi: lop.hocphimoibuoi, thoiluonghoc: lop.thoiluonghoc, sobuoihoc: lop.sobuoihoc });
    setIsEditLop(true); setIsModalLopOpen(true);
  };

  const handleSubmitLop = async (e) => {
    e.preventDefault();
    if (!formLop.mamonhoc) return alert("Vui lòng chọn môn học!");
    try {
      const payload = {
        magiasu: maGiaSu,
        mamonhoc: Number(formLop.mamonhoc),
        makhuvuc: Number(formLop.makhuvuc),
        hocphimoibuoi: Number(formLop.hocphimoibuoi),
        thoiluonghoc: Number(formLop.thoiluonghoc),
        sobuoihoc: Number(formLop.sobuoihoc)
      };

      if (isEditLop) {
        await GiaSu_MonHoc_Service.capNhatGiaSuMonHoc(formLop.magiasu_monhoc, payload);
        alert("Cập nhật thành công!");
      } else {
        await GiaSu_MonHoc_Service.themGiaSuMonHocMoi(payload);
        alert("Đã mở lớp học mới!");
      }
      setIsModalLopOpen(false);
      fetchDanhSachLopVaKhungGio(maGiaSu);
    } catch (error) {
      alert("Lỗi khi lưu thông tin lớp học!");
    }
  };

  const handleKhoaLop = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn KHÓA lớp học này không?")) {
      try {
        await GiaSu_MonHoc_Service.khoaGiaSuMonHoc(id);
        alert("Đã khóa lớp học thành công!"); fetchDanhSachLopVaKhungGio(maGiaSu);
      } catch (error) { alert("Lỗi khi thực hiện khóa lớp!"); }
    }
  };

  const handleMoLaiLop = async (lop) => {
    if (window.confirm(`Bạn có chắc chắn muốn MỞ LẠI lớp học "${timTenMonHoc(lop.mamonhoc)}" không?`)) {
      try {
        await GiaSu_MonHoc_Service.moKhoaGiaSuMonHoc(lop.magiasu_monhoc);
        alert("Đã mở lại lớp học thành công!");
        fetchDanhSachLopVaKhungGio(maGiaSu);
      } catch (error) {
        alert("Lỗi khi mở lại lớp học!");
      }
    }
  };

  const handleMoModalThemKhungGio = (maGiaSuMonHoc) => {
    setFormKhungGio({ makhunggio: null, magiasu_monhoc: maGiaSuMonHoc, ngayday: 'Thứ 2', thoigianbatdau: '18:00', thoigianketthuc: '19:30' });
    setIsEditKhungGio(false); setIsModalKhungGioOpen(true);
  };

  const handleMoModalSuaKhungGio = (kg) => {
    setFormKhungGio({ makhunggio: kg.makhunggio, magiasu_monhoc: kg.magiasu_monhoc, ngayday: kg.ngayday, thoigianbatdau: String(kg.thoigianbatdau).slice(0, 5), thoigianketthuc: String(kg.thoigianketthuc).slice(0, 5) });
    setIsEditKhungGio(true); setIsModalKhungGioOpen(true);
  };

  const handleSubmitKhungGio = async (e) => {
    e.preventDefault();
    try {
      const tBatDau = formKhungGio.thoigianbatdau.length === 5 ? `${formKhungGio.thoigianbatdau}:00` : formKhungGio.thoigianbatdau;
      const tKetThuc = formKhungGio.thoigianketthuc.length === 5 ? `${formKhungGio.thoigianketthuc}:00` : formKhungGio.thoigianketthuc;
      const payload = {
        magiasu_monhoc: formKhungGio.magiasu_monhoc,
        ngayday: formKhungGio.ngayday,
        thoigianbatdau: tBatDau,
        thoigianketthuc: tKetThuc
      };

      if (isEditKhungGio) {
        await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(formKhungGio.makhunggio, payload);
        alert("Cập nhật thành công!");
      } else {
        await KhungGio_GiaSu_MonHoc_Service.themKhungGioMoi(payload);
        alert("Thêm lịch học thành công!");
      }
      setIsModalKhungGioOpen(false);
      fetchDanhSachLopVaKhungGio(maGiaSu);
    } catch (error) {
      alert("Lỗi thao tác lịch học!");
    }
  };

  const handleKhoaKhungGio = async (id, trangthai) => {
    if (trangthai === 2) return alert("Lịch học này đang ở trạng thái [Đang dạy], không được phép hủy bỏ!");
    if (trangthai === 3) return alert("Lịch học đang ở trạng thái [Chờ duyệt], không được phép thao tác!");

    if (window.confirm("Bạn có chắc chắn muốn HỦY lịch học này không?")) {
      try {
        await KhungGio_GiaSu_MonHoc_Service.khoaKhungGio(id);
        alert("Đã hủy lịch học thành công!"); fetchDanhSachLopVaKhungGio(maGiaSu);
      } catch (error) { alert("Lỗi khi hủy lịch học!"); }
    }
  };

  // ====================================================================
  // TÍNH TOÁN 4 NHÓM DANH SÁCH & HÀM RENDER COMPONENT CON
  // ====================================================================
  const listChoDuyet = danhSachDangKy.filter(dk => Number(dk.trangthai) === 0);
  const listDangDay = danhSachDangKy.filter(dk => Number(dk.trangthai) === 1);
  const listHoanThanh = danhSachDangKy.filter(dk => Number(dk.trangthai) === 3);
  const listTuChoi = danhSachDangKy.filter(dk => Number(dk.trangthai) === 2);

  // Hàm render thẻ Đăng ký
  const renderCardDangKy = (dk, badgeText, badgeColor) => (
    <div key={dk.madangky} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', color: '#1e3a8a' }}>Môn dạy đăng ký: {dk.tenmonhoc}</h4>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', backgroundColor: badgeColor, padding: '4px 12px', borderRadius: '16px' }}>
          {badgeText}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', fontSize: '14px', color: '#334155', marginBottom: '16px' }}>

        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284c7' }}>person</span> Thông tin Người đăng ký
          </div>
          <div style={{lineHeight: '1.5'}}>• <strong>Họ tên:</strong> {dk.nguoihoc_ten}</div>
          <div style={{lineHeight: '1.5'}}>• <strong>SĐT:</strong> {dk.nguoihoc_sdt}</div>
          <div style={{lineHeight: '1.5'}}>• <strong>Email:</strong> {dk.nguoihoc_email}</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284c7' }}>face</span> Học viên tham gia
          </div>
          {dk.danhSachHocVien.length === 0 ? (
            <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Không có chi tiết học viên</div>
          ) : (
            dk.danhSachHocVien.map(hv => (
              <div key={hv.mahocvien} style={{ marginBottom: '8px', fontSize: '13px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                <div>• <strong>{hv.tenhocvien}</strong> (SN: {hv.namsinh} - Lớp: {hv.hocluc})</div>
                <div style={{ color: '#475569', marginLeft: '10px', marginTop: '2px' }}>
                  📍 Địa chỉ: {hv.diachi || 'Chưa cập nhật'}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284c7' }}>alarm</span> Khung giờ đăng ký
          </div>
          {dk.danhSachKhungGioChon.length === 0 ? (
            <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Chưa thiết lập khung lịch</div>
          ) : (
            dk.danhSachKhungGioChon.map(ct => (
              <div key={ct.machitietdangky} style={{ marginBottom: '4px', fontSize: '13px' }}>
                • <strong>{ct.ngayhoc}</strong>: {String(ct.thoigianbatdau).slice(0, 5)} - {String(ct.thoigianketthuc).slice(0, 5)}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13.5px', color: '#475569' }}>
          <div>Khai giảng dự kiến: <strong style={{ color: '#0f172a' }}>{dk.ngaybatdauhoc ? new Date(dk.ngaybatdauhoc).toLocaleDateString('vi-VN') : 'Chưa xếp'}</strong></div>
          <div style={{ marginTop: '4px' }}>Tổng học phí lớp học: <strong style={{ color: '#ef4444', fontSize: '15px' }}>{dk.tonghocphi?.toLocaleString()} VNĐ</strong></div>
          {dk.ghichu && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>💬 Ghi chú: "{dk.ghichu}"</div>}
          {Number(dk.trangthai) === 2 && dk.lydotuchoi && (
            <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '8px', fontWeight: '600', background: '#fef2f2', padding: '8px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
              Lý do từ chối: {dk.lydotuchoi}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {Number(dk.trangthai) === 0 && (
            <>
              <button onClick={() => handlePheDuyetDangKy(dk, 1)} style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span> Phê duyệt
              </button>
              <button onClick={() => handlePheDuyetDangKy(dk, 2)} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span> Từ chối
              </button>
            </>
          )}
          {Number(dk.trangthai) === 3 && (
            <button onClick={() => handleXemDanhGia(dk)} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>star</span> Xem Đánh Giá
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="yc-container">

      {/* ==================== PHẦN TRÊN: CÁC LỚP HỌC ĐANG MỞ ==================== */}
      <div className="lh-bottom-section" style={{ marginBottom: '40px' }}>
        <div className="lh-header">
          <div>
            <h3>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>class</span>
              Các Lớp Học Đang Mở
            </h3>
            <p>Quản lý môn dạy, học phí và lịch học của bạn.</p>
          </div>
          <button className="btn-submit" onClick={handleMoModalThemLop} style={{ margin: 0, padding: '10px 20px', backgroundColor: '#006b54' }}>
            + Mở lớp mới
          </button>
        </div>

        {danhSachLop.length === 0 ? (
          <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
            Bạn chưa mở lớp học nào hoặc các lớp học đã bị khóa.
          </div>
        ) : (
          /* 🟢 SỬ DỤNG LẠI CLASS CHUẨN GRID MÀ ÔNG YÊU CẦU (.lh-grid) */
          <div className="lh-grid">
            {danhSachLop.map((lop) => {
              const khungGioCuaLop = danhSachKhungGio.filter(kg => kg.magiasu_monhoc === lop.magiasu_monhoc && (kg.trangthai === 1 || kg.trangthai === 2 || kg.trangthai === 3));
              
              const isLopBiKhoa = Number(lop.trangthai) === 0;
              
              // ✅ LOGIC: Kiểm tra có khung giờ nào đang ở trạng thái 2 (đang dạy) hoặc 3 (chờ duyệt)
              const coKhungGioDangDay = khungGioCuaLop.some(kg => kg.trangthai === 2);
              const coKhungGioChoDuyet = khungGioCuaLop.some(kg => kg.trangthai === 3);
              const hienNutChinhSua = !isLopBiKhoa && !coKhungGioDangDay && !coKhungGioChoDuyet;

              return (
                <div key={lop.magiasu_monhoc} className="lh-card" style={{ opacity: isLopBiKhoa ? 0.7 : 1, border: isLopBiKhoa ? '2px dashed #cbd5e1' : '1px solid #e2e8f0' }}>
                  {hienNutChinhSua && (
                    <div className="lh-action-btns">
                      <button className="lh-icon-btn edit" onClick={() => handleMoModalSuaLop(lop)} title="Sửa thông tin lớp"><span className="material-symbols-outlined">edit</span></button>
                      <button className="lh-icon-btn delete" onClick={() => handleKhoaLop(lop.magiasu_monhoc)} title="Khóa lớp học"><span className="material-symbols-outlined">lock</span></button>
                    </div>
                  )}

                  {isLopBiKhoa ? (
                    <span className="lh-badge" style={{ backgroundColor: '#ef4444' }}>Đã khóa</span>
                  ) : (
                    <span className="lh-badge">Đang hoạt động</span>
                  )}
                  
                  <h4 className="lh-card-title">{timTenMonHoc(lop.mamonhoc)}</h4>

                  <div className="lh-card-info">
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>payments</span>
                    <strong>Học phí:</strong> {lop.hocphimoibuoi.toLocaleString()} VNĐ/Buổi
                  </div>
                  <div className="lh-card-info">
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>schedule</span>
                    <strong>Thời lượng:</strong> {lop.thoiluonghoc} Phút
                  </div>
                  <div className="lh-card-info">
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>schedule</span>
                    <strong>Tổng số buổi học:</strong> {lop.sobuoihoc} Buổi
                  </div>
                  <div className="lh-card-info">
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>location_on</span>
                    <strong>Khu vực:</strong> {timTenKhuVuc(lop.makhuvuc)}
                  </div>

                  {isLopBiKhoa ? (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#991b1b', fontWeight: 'bold' }}>
                        Lớp học này đã bị khóa
                      </p>
                      <button 
                        onClick={() => handleMoLaiLop(lop)}
                        style={{ 
                          background: '#10b981', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          margin: '0 auto'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_open</span>
                        Mở lại lớp học
                      </button>
                    </div>
                  ) : (
                    <div className="lh-schedule-box">
                      <div className="lh-schedule-title">
                        <span>LỊCH HỌC ({khungGioCuaLop.length})</span>
                        <button className="lh-btn-add-schedule" onClick={() => handleMoModalThemKhungGio(lop.magiasu_monhoc)}>
                          + Thêm lịch
                        </button>
                      </div>

                      <div className="lh-schedule-list" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                        {khungGioCuaLop.length === 0 ? (
                          <span style={{fontSize: '12px', color: '#94a3b8', fontStyle: 'italic'}}>Chưa xếp lịch.</span>
                        ) : (
                          khungGioCuaLop.map(kg => (
                            <div key={kg.makhunggio} className="lh-schedule-item">
                              <span style={{ fontSize: '13px' }}><strong>{kg.ngayday}</strong>: {String(kg.thoigianbatdau).slice(0, 5)} - {String(kg.thoigianketthuc).slice(0, 5)}</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {kg.trangthai === 1 ? (
                                  <>
                                    <button className="lh-icon-btn edit" onClick={() => handleMoModalSuaKhungGio(kg)} style={{ padding: '2px' }} title="Sửa lịch học">
                                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                                    </button>
                                    <button className="lh-icon-btn delete" onClick={() => handleKhoaKhungGio(kg.makhunggio, kg.trangthai)} style={{ padding: '2px' }} title="Hủy lịch học này">
                                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                                    </button>
                                  </>
                                ) : kg.trangthai === 2 ? (
                                  <span style={{ fontSize: '10px', backgroundColor: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Đang dạy</span>
                                ) : (
                                  <span style={{ fontSize: '10px', backgroundColor: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Chờ duyệt</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== PHẦN DƯỚI: KHU VỰC YÊU CẦU ĐĂNG KÝ ==================== */}
      <div className="yc-top-section" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#f59e0b' }}>event_available</span>
          <div>
            <h2 style={{ color: '#1e293b', margin: 0, fontSize: '22px' }}>Yêu Cầu Đăng Ký Lịch Từ Người Học</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>Danh sách phụ huynh học viên chọn khung giờ đăng ký học chờ bạn duyệt.</p>
          </div>
        </div>

        {/* 🟢 KHỐI Ô THỐNG KÊ SỐ LƯỢNG YÊU CẦU */}
        {!loadingDangKy && (
          <div className="nh-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #f59e0b' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#d97706' }}>
                <span className="material-symbols-outlined">hourglass_top</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Chờ xác nhận</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listChoDuyet.length}</div>
              </div>
            </div>

            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #0284c7' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#0284c7' }}>
                <span className="material-symbols-outlined">school</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Đang dạy</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listDangDay.length}</div>
              </div>
            </div>

            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #10b981' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#10b981' }}>
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Đã hoàn thành</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listHoanThanh.length}</div>
              </div>
            </div>

            <div className="nh-stat-card" style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderLeft: '5px solid #ef4444' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef2f2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444' }}>
                <span className="material-symbols-outlined">cancel</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Đã từ chối</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>{listTuChoi.length}</div>
              </div>
            </div>
          </div>
        )}

        {loadingDangKy ? (
          <div style={{ padding: '20px', color: '#475569', fontStyle: 'italic' }}>Đang kết nối hệ thống đồng bộ dữ liệu...</div>
        ) : danhSachDangKy.length === 0 ? (
          <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Hiện chưa có yêu cầu đăng ký lịch học nào được gửi đến bạn.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {listChoDuyet.length > 0 && (
              <div>
                <h3 
                  onClick={() => setIsChoDuyetExpanded(!isChoDuyetExpanded)}
                  style={{ 
                    color: '#d97706', 
                    borderBottom: '2px solid #fde68a', 
                    paddingBottom: '8px', 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span className="material-symbols-outlined">{isChoDuyetExpanded ? 'expand_more' : 'chevron_right'}</span>
                  <span className="material-symbols-outlined">hourglass_empty</span> 
                  Yêu cầu đang chờ duyệt ({listChoDuyet.length})
                </h3>
                {isChoDuyetExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {listChoDuyet.map(dk => renderCardDangKy(dk, 'Chờ xác nhận (0)', '#f59e0b'))}
                  </div>
                )}
              </div>
            )}

            {listDangDay.length > 0 && (
              <div>
                <h3 
                  onClick={() => setIsDangDayExpanded(!isDangDayExpanded)}
                  style={{ 
                    color: '#0284c7', 
                    borderBottom: '2px solid #bae6fd', 
                    paddingBottom: '8px', 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span className="material-symbols-outlined">{isDangDayExpanded ? 'expand_more' : 'chevron_right'}</span>
                  <span className="material-symbols-outlined">school</span> 
                  Lớp đang diễn ra ({listDangDay.length})
                </h3>
                {isDangDayExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {listDangDay.map(dk => renderCardDangKy(dk, 'Đang dạy (1)', '#0284c7'))}
                  </div>
                )}
              </div>
            )}

            {listHoanThanh.length > 0 && (
              <div>
                <h3 
                  onClick={() => setIsHoanThanhExpanded(!isHoanThanhExpanded)}
                  style={{ 
                    color: '#10b981', 
                    borderBottom: '2px solid #a7f3d0', 
                    paddingBottom: '8px', 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span className="material-symbols-outlined">{isHoanThanhExpanded ? 'expand_more' : 'chevron_right'}</span>
                  <span className="material-symbols-outlined">task_alt</span> 
                  Lớp đã hoàn thành ({listHoanThanh.length})
                </h3>
                {isHoanThanhExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {listHoanThanh.map(dk => renderCardDangKy(dk, 'Hoàn thành (3)', '#10b981'))}
                  </div>
                )}
              </div>
            )}

            {listTuChoi.length > 0 && (
              <div>
                <h3 
                  onClick={() => setIsTuChoiExpanded(!isTuChoiExpanded)}
                  style={{ 
                    color: '#ef4444', 
                    borderBottom: '2px solid #fca5a5', 
                    paddingBottom: '8px', 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span className="material-symbols-outlined">{isTuChoiExpanded ? 'expand_more' : 'chevron_right'}</span>
                  <span className="material-symbols-outlined">block</span> 
                  Yêu cầu đã từ chối ({listTuChoi.length})
                </h3>
                {isTuChoiExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {listTuChoi.map(dk => renderCardDangKy(dk, 'Đã từ chối (2)', '#ef4444'))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🟢 MODAL XEM ĐÁNH GIÁ */}
      {isReviewModalOpen && reviewHienTai && (
        <div className="bc-modal-overlay">
          <div className="bc-modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="bc-modal-header" style={{ justifyContent: 'center', position: 'relative', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>kid_star</span>
                Học viên đánh giá lớp
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="bc-close-btn" style={{ position: 'absolute', right: '0' }}>&times;</button>
            </div>
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="material-symbols-outlined" style={{ fontSize: '36px', color: star <= reviewHienTai.sodiem ? '#f59e0b' : '#cbd5e1', fontVariationSettings: star <= reviewHienTai.sodiem ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  ))}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{reviewHienTai.sodiem} / 5 Sao</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'left', fontStyle: 'italic', color: '#475569', lineHeight: '1.6' }}>"{reviewHienTai.noidung}"</div>
            </div>
            <div className="bc-modal-footer" style={{ justifyContent: 'center' }}><button type="button" onClick={() => setIsReviewModalOpen(false)} className="btn-outline">Đóng</button></div>
          </div>
        </div>
      )}

      {/* 🟢 MODAL NHẬP LÝ DO TỪ CHỐI */}
      {isRejectModalOpen && dangKyCanTuChoi && (
        <div className="bc-modal-overlay">
          <div className="bc-modal-content" style={{ maxWidth: '500px' }}>
            <div className="bc-modal-header">
              <h3 style={{ margin: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined">block</span>
                Từ chối yêu cầu đăng ký
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="bc-close-btn">&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
                  Vui lòng nhập lý do từ chối để người học hiểu rõ tình huống.
                </p>
              </div>
              <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' }}>
                Lý do từ chối <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={lyDoTuChoi}
                onChange={(e) => setLyDoTuChoi(e.target.value)}
                placeholder="VD: Khung giờ không phù hợp, học viên quá xa khu vực dạy của tôi..."
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
                onClick={handleXacNhanTuChoi}
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

      {/* MODAL THÊM/SỬA LỚP */}
      {isModalLopOpen && (
        <div className="bc-modal-overlay">
          <div className="bc-modal-content">
            <div className="bc-modal-header">
              <h3>{isEditLop ? "Sửa thông tin Lớp" : "Mở Lớp Học Mới"}</h3>
              <button type="button" onClick={() => setIsModalLopOpen(false)} className="bc-close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmitLop} className="tcn-form-col">
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Bộ lọc môn học</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" className="tcn-input" placeholder="🔍 Gõ tìm tên môn..." value={timKiemMon} onChange={e => setTimKiemMon(e.target.value)} style={{ flex: 1, padding: '8px' }} />
                  <select className="tcn-input" value={heLopChon} onChange={e => setHeLopChon(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                    <option value="">-- Tất cả hệ lớp --</option>
                    {danhSachHeLop.filter(hl => hl.trangthai === 1).map(hl => <option key={hl.mahelop} value={hl.mahelop}>{hl.tenhelop}</option>)}
                  </select>
                </div>
              </div>

              <div className="tcn-row">
                <div className="tcn-form-group" style={{ flex: 1 }}>
                  <label>Môn Học Được Phép Dạy <span style={{color: '#005088'}}>({monHocDaLoc.length})</span></label>
                  <select className="tcn-input" value={formLop.mamonhoc} onChange={e => setFormLop({...formLop, mamonhoc: e.target.value})} required size="4" style={{ height: 'auto', padding: '6px', overflowY: 'auto' }}>
                    {monHocDaLoc.length === 0 ? <option value="" disabled>Không tìm thấy môn học nào</option> : monHocDaLoc.map(m => <option key={m.mamonhoc} value={m.mamonhoc} style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>{m.tenmonhoc}</option>)}
                  </select>
                </div>

                <div className="tcn-form-group" style={{ flex: 1 }}>
                  <label>Khu Vực Dạy</label>
                  <select className="tcn-input" value={formLop.makhuvuc} onChange={e => setFormLop({...formLop, makhuvuc: e.target.value})} required>
                    <option value="">-- Chọn khu vực --</option>
                    {danhSachKhuVuc.filter(kv => kv.trangthai === 1).map(kv => <option key={kv.makhuvuc} value={kv.makhuvuc}>{kv.tenkhuvuc}</option>)}
                  </select>
                </div>
              </div>

              <div className="tcn-form-group">
                <label>Học phí mỗi buổi (VNĐ)</label>
                <input type="number" className="tcn-input" value={formLop.hocphimoibuoi} onChange={e => setFormLop({...formLop, hocphimoibuoi: e.target.value})} required placeholder="VD: 150000" />
              </div>

              <div className="tcn-row">
                <div className="tcn-form-group"><label>Thời lượng (Phút/Buổi)</label><input type="number" className="tcn-input" value={formLop.thoiluonghoc} onChange={e => setFormLop({...formLop, thoiluonghoc: e.target.value})} required placeholder="VD: 90" /></div>
                <div className="tcn-form-group"><label>Tổng số buổi</label><input type="number" className="tcn-input" value={formLop.sobuoihoc} onChange={e => setFormLop({...formLop, sobuoihoc: e.target.value})} required placeholder="VD: 3" /></div>
              </div>

              <div className="bc-modal-footer">
                <button type="button" onClick={() => setIsModalLopOpen(false)} className="btn-outline">Hủy</button>
                <button type="submit" className="btn-submit">Lưu Lớp Học</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA KHUNG GIỜ */}
      {isModalKhungGioOpen && (
        <div className="bc-modal-overlay">
          <div className="bc-modal-content" style={{maxWidth: '400px'}}>
            <div className="bc-modal-header">
              <h3>{isEditKhungGio ? "Sửa Lịch Học" : "Thêm Lịch Học"}</h3>
              <button type="button" onClick={() => setIsModalKhungGioOpen(false)} className="bc-close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmitKhungGio} className="tcn-form-col">
              <div className="tcn-form-group">
                <label>Ngày dạy</label>
                <select className="tcn-input" value={formKhungGio.ngayday} onChange={e => setFormKhungGio({...formKhungGio, ngayday: e.target.value})} required>
                  <option value="Thứ 2">Thứ 2</option><option value="Thứ 3">Thứ 3</option><option value="Thứ 4">Thứ 4</option>
                  <option value="Thứ 5">Thứ 5</option><option value="Thứ 6">Thứ 6</option><option value="Thứ 7">Thứ 7</option><option value="Chủ Nhật">Chủ Nhật</option>
                </select>
              </div>
              <div className="tcn-row">
                <div className="tcn-form-group"><label>Giờ bắt đầu</label><input type="time" className="tcn-input" value={formKhungGio.thoigianbatdau} onChange={e => setFormKhungGio({...formKhungGio, thoigianbatdau: e.target.value})} required /></div>
                <div className="tcn-form-group"><label>Giờ kết thúc</label><input type="time" className="tcn-input" value={formKhungGio.thoigianketthuc} onChange={e => setFormKhungGio({...formKhungGio, thoigianketthuc: e.target.value})} required /></div>
              </div>
              <div className="bc-modal-footer">
                <button type="button" onClick={() => setIsModalKhungGioOpen(false)} className="btn-outline">Hủy</button>
                <button type="submit" className="btn-submit">Lưu Lịch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YeuCauDangKyLich;
