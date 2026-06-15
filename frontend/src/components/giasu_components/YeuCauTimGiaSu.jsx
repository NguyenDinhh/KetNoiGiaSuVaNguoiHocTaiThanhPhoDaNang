import React, { useState, useEffect } from 'react';
import '../../assets/css/GiaSu.css';

// ================= CÁC SERVICE CẦN THIẾT =================
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import KhuVuc_Service from '../../services/KhuVuc_Service';
import HeLop_Service from '../../services/HeLop_Service';
import ChiTietYeuCau_Service from '../../services/ChiTietYeuCau_Service';
import YeuCau_HocVien_Service from '../../services/YeuCau_HocVien_Service';
import HocVien_Service from '../../services/HocVien_Service';
import GiaSu_BangCap_Service from '../../services/GiaSu_BangCap_Service';
import BangCap_MonHoc_Service from '../../services/BangCap_MonHoc_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';
import DanhGia_Service from '../../services/DanhGia_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';

const DIA_CHI_API = 'http://localhost:8000';

const BaiDangTimGiaSu = () => {
  const [activeTab, setActiveTab] = useState('tim_lop');
  const [danhSachBaiDang, setDanhSachBaiDang] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  // --- STATE LƯU TRỮ MASTER DATA ---
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [danhSachMonCoTheDay, setDanhSachMonCoTheDay] = useState([]);
  const [maGiaSuHienTai, setMaGiaSuHienTai] = useState(null);
  
  // State lưu lý do từ chối từ bảng GIASU_UNGTUYEN
  const [lyDoTuChoiMap, setLyDoTuChoiMap] = useState({});

  // --- STATE BỘ LỌC ---
  const [boLocKhuVuc, setBoLocKhuVuc] = useState('');
  const [boLocHeLop, setBoLocHeLop] = useState('');
  const [boLocMonHoc, setBoLocMonHoc] = useState('');
  const [boLocHocPhiMin, setBoLocHocPhiMin] = useState('');
  const [boLocHocPhiMax, setBoLocHocPhiMax] = useState('');
  const [chiHienMonPhuHop, setChiHienMonPhuHop] = useState(false);

  // STATE LƯU TRẠNG THÁI ỨNG TUYỂN DƯỚI DẠNG DICTIONARY { mayeucau: trangthai }
  const [danhSachDaUngTuyen, setDanhSachDaUngTuyen] = useState({});

  // 🟢 STATE QUẢN LÝ THU/PHÓNG TAB "ĐÃ ỨNG TUYỂN"
  const [expanded, setExpanded] = useState({
    choDuyet: true,
    dangDay: true,
    hoanThanh: false,
    tuChoi: false
  });

  // STATE PHỤC VỤ HIỂN THỊ MODAL XEM ĐÁNH GIÁ
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewHienTai, setReviewHienTai] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDuLieu = async () => {
      try {
        const userLocal = JSON.parse(localStorage.getItem("thongTinUser"));
        const maND = userLocal?.manguoidung;

        const [
          resYeuCau, resMonHoc, resKhuVuc, resHeLop,
          resChiTiet, resYeuCauHocVien, resHocVien,
          resTatCaUngTuyen, resNguoiDung, resDanhGia
        ] = await Promise.all([
          YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
          MonHoc_Service.layDanhSachMonHoc().catch(() => []),
          KhuVuc_Service.layDanhSachKhuVuc().catch(() => []),
          HeLop_Service.layDanhSachHeLop().catch(() => []),
          ChiTietYeuCau_Service.layDanhSachChiTietYeuCau().catch(() => []),
          YeuCau_HocVien_Service.layDanhSachYeuCauHocVien().catch(() => []),
          HocVien_Service.layDanhSachHocVien().catch(() => []),
          GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
          NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
          DanhGia_Service.layDanhSachDanhGia().catch(() => [])
        ]);

        if (!isMounted) return;

        const listYeuCau = Array.isArray(resYeuCau) ? resYeuCau : resYeuCau?.data || [];
        const listMonHoc = Array.isArray(resMonHoc) ? resMonHoc : resMonHoc?.data || [];
        const listKhuVuc = Array.isArray(resKhuVuc) ? resKhuVuc : resKhuVuc?.data || [];
        const listHeLop = Array.isArray(resHeLop) ? resHeLop : resHeLop?.data || [];
        const listChiTiet = Array.isArray(resChiTiet) ? resChiTiet : resChiTiet?.data || [];
        const listYCHV = Array.isArray(resYeuCauHocVien) ? resYeuCauHocVien : resYeuCauHocVien?.data || [];
        const listHV = Array.isArray(resHocVien) ? resHocVien : resHocVien?.data || [];
        const listTatCaUngTuyen = Array.isArray(resTatCaUngTuyen) ? resTatCaUngTuyen : resTatCaUngTuyen?.data || [];
        const listNguoiDung = Array.isArray(resNguoiDung) ? resNguoiDung : resNguoiDung?.data || [];
        const listDanhGia = Array.isArray(resDanhGia) ? resDanhGia : resDanhGia?.data || [];

        setDanhSachKhuVuc(listKhuVuc);
        setDanhSachMonHoc(listMonHoc);
        setDanhSachHeLop(listHeLop);

        let cacMonCoTheDay = [];
        let mapUngTuyen = {};

        if (maND) {
          try {
            const resGS = await fetch(`${DIA_CHI_API}/giasuvoimanguoidung/${maND}`).then(r => r.json());
            const maGiaSu = resGS?.data?.magiasu;

            if (maGiaSu) {
              setMaGiaSuHienTai(maGiaSu);

              const listGSBC = await GiaSu_BangCap_Service.layDanhSachGiaSuBangCap().catch(() => []);
              const cacBangCapCuaGS = listGSBC.filter(bc => bc.magiasu === maGiaSu).map(bc => bc.mabangcap);
              const listBCMH = await BangCap_MonHoc_Service.layDanhSach().catch(() => []);
              cacMonCoTheDay = listBCMH
                .filter(bcmh => cacBangCapCuaGS.includes(bcmh.mabangcap))
                .map(bcmh => bcmh.mamonhoc);

              const mapLyDoTuChoi = {};
              listTatCaUngTuyen
                .filter(ut => ut.magiasu === maGiaSu)
                .forEach(ut => {
                  mapUngTuyen[ut.mayeucau] = ut.trangthai;
                  if (ut.trangthai === 2 && ut.lydotuchoi) {
                    mapLyDoTuChoi[ut.mayeucau] = ut.lydotuchoi;
                  }
                });
              setLyDoTuChoiMap(mapLyDoTuChoi);
            }
          } catch (err) {
            console.warn("Chưa thể lấy thông tin chi tiết gia sư.", err);
          }
        }

        setDanhSachMonCoTheDay(cacMonCoTheDay);
        setDanhSachDaUngTuyen(mapUngTuyen);

        const duLieuHoanChinh = listYeuCau.map(yc => {
          const monHoc = listMonHoc.find(m => m.mamonhoc === yc.mamonhoc);
          const khuVuc = listKhuVuc.find(k => k.makhuvuc === yc.makhuvuc);
          const chiTietCuaYeuCau = listChiTiet.filter(ct => ct.mayeucau === yc.mayeucau);
          const chuoiLichHoc = chiTietCuaYeuCau.map(ct => {
            const gioBatDau = ct.thoigianbatdau ? ct.thoigianbatdau.substring(0, 5) : '';
            const gioKetThuc = ct.thoigianketthuc ? ct.thoigianketthuc.substring(0, 5) : '';
            return `${ct.ngayhoc} (${gioBatDau}-${gioKetThuc})`;
          }).join(', ');

          const nhungNguoiThamGia = listYCHV.filter(y => y.mayeucau === yc.mayeucau);
          const thongTinHocVien = nhungNguoiThamGia.map(y => listHV.find(h => h.mahocvien === y.mahocvien)).filter(Boolean);

          const nguoiHoc = listNguoiDung.find(nd => String(nd.id) === String(yc.manguoidung)) || {};
          const danhGiaCuaDon = listDanhGia.find(dg => dg.mayeucau === yc.mayeucau);

          const soLuongUngTuyen = listTatCaUngTuyen.filter(ut => ut.mayeucau === yc.mayeucau).length;

          return {
            ...yc,
            mahelop: monHoc ? monHoc.mahelop : null,
            tenmonhoc: monHoc ? monHoc.tenmonhoc : 'Đang cập nhật',
            tenkhuvuc: khuVuc ? khuVuc.tenkhuvuc : 'Đang cập nhật',
            lichhoc_str: chuoiLichHoc || 'Chưa xếp lịch',
            ngaybatdau_str: yc.ngaybatdauhoc ? new Date(yc.ngaybatdauhoc).toLocaleDateString('vi-VN') : 'Đang cập nhật',
            danhsachhocvien: thongTinHocVien,
            nguoihoc_ten: nguoiHoc.name || 'Chưa cập nhật',
            nguoihoc_sdt: nguoiHoc.phone || 'Chưa cập nhật',
            nguoihoc_email: nguoiHoc.email || 'Chưa cập nhật',
            danhGiaCuaDon: danhGiaCuaDon || null,
            soLuongUngTuyen: soLuongUngTuyen
          };
        });

        setDanhSachBaiDang(duLieuHoanChinh);
        setDangTai(false);
      } catch (error) {
        console.error("Lỗi khi load dữ liệu bài đăng:", error);
        setDangTai(false);
      }
    };

    loadDuLieu();
    return () => { isMounted = false; };
  }, []);

  const handleUngTuyen = async (mayeucau, tenMonHoc) => {
    if (!maGiaSuHienTai) {
      return alert("Không tìm thấy thông tin Hồ sơ Gia sư của bạn. Vui lòng cập nhật hồ sơ trước!");
    }

    if (window.confirm(`Bạn muốn ứng tuyển dạy lớp [${tenMonHoc}]?\nHồ sơ của bạn sẽ được gửi đến người học để chờ duyệt.`)) {
      try {
        const payloadUngTuyen = {
          mayeucau: String(mayeucau),
          magiasu: String(maGiaSuHienTai),
          trangthai: 0,
          lydotuchoi: "" 
        };

        await GiaSu_UngTuyen_Service.themUngTuyenMoi(payloadUngTuyen);

        setDanhSachDaUngTuyen(prev => ({ ...prev, [mayeucau]: 0 }));
        
        setDanhSachBaiDang(prevList => prevList.map(yc => 
          yc.mayeucau === mayeucau ? { ...yc, soLuongUngTuyen: yc.soLuongUngTuyen + 1 } : yc
        ));

        alert(`🎉 Đã ứng tuyển thành công! Vui lòng theo dõi ở tab "Đã Ứng Tuyển".`);

      } catch (error) {
        console.error("Lỗi khi ứng tuyển:", error);
        alert("Đã xảy ra lỗi khi gửi yêu cầu ứng tuyển. Vui lòng kiểm tra Console (F12)!");
      }
    }
  };

  const handleHuyUngTuyen = async (mayeucau, tenMonHoc) => {
    if (!window.confirm(`Bạn có chắc chắn muốn RÚT HỒ SƠ ứng tuyển lớp [${tenMonHoc}] không?\nBạn vẫn có thể ứng tuyển lại vào lớp này sau khi rút.`)) {
      return;
    }

    try {
      const resUngTuyen = await GiaSu_UngTuyen_Service.layDanhSachUngTuyen();
      const listUngTuyen = Array.isArray(resUngTuyen) ? resUngTuyen : resUngTuyen?.data || [];
      
      const ungTuyenCanHuy = listUngTuyen.find(ut => 
        ut.mayeucau === mayeucau && ut.magiasu === maGiaSuHienTai
      );

      if (!ungTuyenCanHuy) {
        return alert("Không tìm thấy thông tin ứng tuyển!");
      }

      const maUngTuyen = ungTuyenCanHuy.magiasu_ungtuyen || ungTuyenCanHuy.id;
      await GiaSu_UngTuyen_Service.xoaUngTuyen(maUngTuyen); 

      setDanhSachDaUngTuyen(prev => {
        const newState = { ...prev };
        delete newState[mayeucau]; 
        return newState;
      });

      setDanhSachBaiDang(prevList => prevList.map(yc => 
        yc.mayeucau === mayeucau ? { ...yc, soLuongUngTuyen: Math.max(0, yc.soLuongUngTuyen - 1) } : yc
      ));
      
      alert("Đã rút hồ sơ ứng tuyển thành công! Bạn có thể ứng tuyển lại bất cứ lúc nào.");
    } catch (error) {
      console.error("Lỗi khi hủy ứng tuyển:", error);
      alert("Đã xảy ra lỗi khi hủy ứng tuyển! Vui lòng kiểm tra kết nối mạng.");
    }
  };

  const handleXemDanhGia = (baiDang) => {
    if (baiDang.danhGiaCuaDon) {
      setReviewHienTai(baiDang.danhGiaCuaDon);
      setIsReviewModalOpen(true);
    } else {
      alert("Người học chưa để lại đánh giá chi tiết cho yêu cầu này.");
    }
  };

  // 🟢 HÀM RENDER THẺ BÀI ĐĂNG TÁI SỬ DỤNG
  const renderCard = (baiDang) => {
    const trangThaiUT = danhSachDaUngTuyen[baiDang.mayeucau];
    const trangThaiYeuCau = baiDang.trangthai;
    const daUngTuyen = trangThaiUT !== undefined;
    const duDieuKien = danhSachMonCoTheDay.includes(baiDang.mamonhoc);

    return (
      <div className="baidang-card" key={baiDang.mayeucau}>
        <div className="baidang-header">
          <h3 className="baidang-monhoc">{baiDang.tenmonhoc}</h3>
          <span className="baidang-khuvuc">{baiDang.tenkhuvuc}</span>
        </div>

        <div className="baidang-info">
          <div className="baidang-info-row">
            <span className="material-symbols-outlined">payments</span>
            <span>Tổng học phí: <span className="baidang-hocphi">
              {baiDang.tonghocphi ? baiDang.tonghocphi.toLocaleString() : 0} VNĐ
            </span></span>
          </div>
          <div className="baidang-info-row">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Bắt đầu: {baiDang.ngaybatdau_str} ({baiDang.sobuoihoc} buổi)</span>
          </div>
          <div className="baidang-info-row">
            <span className="material-symbols-outlined">schedule</span>
            <span>Lịch: {baiDang.lichhoc_str}</span>
          </div>
          <div className="baidang-info-row">
            <span className="material-symbols-outlined" style={{color: '#0284c7'}}>group</span>
            <span>Gia sư ứng tuyển: <strong style={{color: '#0284c7'}}>{baiDang.soLuongUngTuyen}</strong> người</span>
          </div>
        </div>

        <div className="baidang-hocvien-box">
          <div className="baidang-hocvien-title">Học viên tham gia ({baiDang.danhsachhocvien.length})</div>
          {baiDang.danhsachhocvien.length > 0 ? (
            baiDang.danhsachhocvien.map((hv) => (
              <div className="baidang-hocvien-item" key={hv.mahocvien}>
                • <strong>{hv.tenhocvien}</strong> (Năm sinh: {hv.namsinh} - Lực học: {hv.hocluc})
              </div>
            ))
          ) : (
            <div className="baidang-hocvien-item" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
              Chưa có thông tin học viên
            </div>
          )}
        </div>

        {/* HIỂN THỊ LIÊN HỆ KHI MÌNH LÀ NGƯỜI ĐƯỢC DUYỆT */}
        {trangThaiUT === 1 && (
          <div className="baidang-contact-box">
            <div style={{fontWeight: '700', color: '#1e3a8a', marginBottom: '8px'}}>
              <span className="material-symbols-outlined" style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '4px'}}>contact_phone</span>
              Liên hệ với Người Học:
            </div>
            <div style={{fontSize: '14px', color: '#1e40af', lineHeight: '1.6'}}>
              <div><strong>Họ Tên:</strong> {baiDang.nguoihoc_ten}</div>
              <div><strong>SĐT:</strong> {baiDang.nguoihoc_sdt}</div>
              <div><strong>Email:</strong> {baiDang.nguoihoc_email}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {daUngTuyen ? (
              trangThaiUT === 1 ? (
                trangThaiYeuCau === 2 ? (
                  <>
                    <button className="btn-ungtuyen" disabled style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', cursor: 'default' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>task_alt</span>
                      Đã Hoàn Thành
                    </button>
                    <button className="btn-ungtuyen" onClick={() => handleXemDanhGia(baiDang)} style={{ flex: 1, backgroundColor: '#0284c7', color: '#fff' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
                      Xem Đánh Giá
                    </button>
                  </>
                ) : (
                  <button className="btn-ungtuyen approved" disabled style={{ flex: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                    Đã Duyệt - Đang Dạy
                  </button>
                )
              ) : trangThaiUT === 2 ? (
                <button className="btn-ungtuyen rejected" disabled style={{ flex: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cancel</span>
                  Đã Từ Chối
                </button>
              ) : (
                <>
                  <button className="btn-ungtuyen pending" disabled style={{ flex: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>hourglass_top</span>
                    Đang Chờ Duyệt
                  </button>
                  <button 
                    className="btn-ungtuyen" 
                    onClick={() => handleHuyUngTuyen(baiDang.mayeucau, baiDang.tenmonhoc)}
                    style={{ flex: '0 0 auto', backgroundColor: '#ef4444', color: '#fff', border: 'none' }}
                    title="Rút hồ sơ ứng tuyển"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    Rút Đơn
                  </button>
                </>
              )
            ) : (
              !duDieuKien ? (
                <button className="btn-ungtuyen disabled" disabled title="Bạn chưa cập nhật bằng cấp/chứng chỉ tương ứng cho môn này" style={{ flex: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>block</span>
                  Không Đủ Điều Kiện
                </button>
              ) : (
                <button className="btn-ungtuyen" onClick={() => handleUngTuyen(baiDang.mayeucau, baiDang.tenmonhoc)} style={{ flex: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>how_to_reg</span>
                  Ứng Tuyển Ngay
                </button>
              )
            )}
          </div>
          
          {/* HIỂN THỊ LÝ DO TỪ CHỐI (NẾU CÓ) */}
          {trangThaiUT === 2 && lyDoTuChoiMap[baiDang.mayeucau] && (
            <div style={{ 
              padding: '12px', 
              background: '#fef2f2', 
              border: '1px solid #fca5a5', 
              borderRadius: '8px', 
              fontSize: '13px', 
              color: '#dc2626',
              fontWeight: '600'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
              Lý do từ chối: {lyDoTuChoiMap[baiDang.mayeucau]}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🟢 HÀM RENDER KHỐI CÓ THU PHÓNG (ACCORDION)
  const renderSection = (title, list, expandedKey, color, icon) => {
    if (list.length === 0) return null;
    const isExpanded = expanded[expandedKey];

    return (
      <div style={{ marginBottom: '24px' }}>
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
          <div className="baidang-grid">
            {list.map(baiDang => renderCard(baiDang))}
          </div>
        )}
      </div>
    );
  };

  const monHocDropdown = boLocHeLop
    ? danhSachMonHoc.filter(m => m.mahelop === String(boLocHeLop))
    : danhSachMonHoc;

  const listTimLopMoi = danhSachBaiDang.filter(bai => {
    if (danhSachDaUngTuyen[bai.mayeucau] !== undefined) return false;
    if (bai.trangthai !== 0) return false;

    // SỬA: Ép kiểu tất cả về String trước khi so sánh
    if (boLocKhuVuc && String(bai.makhuvuc) !== String(boLocKhuVuc)) return false;
    if (boLocHeLop && String(bai.mahelop) !== String(boLocHeLop)) return false;
    if (boLocMonHoc && String(bai.mamonhoc) !== String(boLocMonHoc)) return false;

    // Học phí vẫn là số, giữ nguyên logic cũ
    const hocPhi = Number(bai.tonghocphi) || 0;
    if (boLocHocPhiMin && hocPhi < Number(boLocHocPhiMin)) return false;
    if (boLocHocPhiMax && hocPhi > Number(boLocHocPhiMax)) return false;

    if (chiHienMonPhuHop && !danhSachMonCoTheDay.includes(bai.mamonhoc)) return false;
    return true;
  });

  // Lọc và Phân nhóm cho Tab 2 (Đã Ứng Tuyển)
  const listDaUngTuyenRaw = danhSachBaiDang.filter(bai => danhSachDaUngTuyen[bai.mayeucau] !== undefined);
  const listChoDuyet = listDaUngTuyenRaw.filter(bai => danhSachDaUngTuyen[bai.mayeucau] === 0);
  const listDangDay = listDaUngTuyenRaw.filter(bai => danhSachDaUngTuyen[bai.mayeucau] === 1 && bai.trangthai !== 2);
  const listHoanThanh = listDaUngTuyenRaw.filter(bai => danhSachDaUngTuyen[bai.mayeucau] === 1 && bai.trangthai === 2);
  const listTuChoi = listDaUngTuyenRaw.filter(bai => danhSachDaUngTuyen[bai.mayeucau] === 2);

  return (
    <div className="baidang-container">
      <h2 className="baidang-title">Các yêu cầu tìm gia sư</h2>

      {/* THANH TABS */}
      <div className="baidang-tabs">
        <button
          className={`baidang-tab ${activeTab === 'tim_lop' ? 'active' : ''}`}
          onClick={() => setActiveTab('tim_lop')}
        >
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>search</span>
          Danh sách các yêu cầu
        </button>
        <button
          className={`baidang-tab ${activeTab === 'da_ung_tuyen' ? 'active' : ''}`}
          onClick={() => setActiveTab('da_ung_tuyen')}
        >
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px' }}>history</span>
          Các yêu cầu đã ứng tuyển
        </button>
      </div>

      {dangTai ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải dữ liệu, vui lòng đợi...</div>
      ) : activeTab === 'tim_lop' ? (
        <>
          {/* KHU VỰC BỘ LỌC TAB 1 */}
          <div className="baidang-filter-container">
            <div className="baidang-filter-grid">
              <div className="baidang-filter-group">
                <label>Lọc theo Khu Vực</label>
                <select className="baidang-filter-input" value={boLocKhuVuc} onChange={e => setBoLocKhuVuc(e.target.value)}>
                  <option value="">Tất cả khu vực</option>
                  {danhSachKhuVuc.map(k => (
                    <option key={k.makhuvuc} value={k.makhuvuc}>{k.tenkhuvuc}</option>
                  ))}
                </select>
              </div>
              <div className="baidang-filter-group">
                <label>Lọc theo Hệ Lớp</label>
                <select className="baidang-filter-input" value={boLocHeLop} onChange={e => {
                  setBoLocHeLop(e.target.value);
                  setBoLocMonHoc('');
                }}>
                  <option value="">Tất cả hệ lớp</option>
                  {danhSachHeLop.map(hl => (
                    <option key={hl.mahelop} value={hl.mahelop}>{hl.tenhelop}</option>
                  ))}
                </select>
              </div>
              <div className="baidang-filter-group">
                <label>Lọc theo Môn Học</label>
                <select className="baidang-filter-input" value={boLocMonHoc} onChange={e => setBoLocMonHoc(e.target.value)}>
                  <option value="">Tất cả môn học</option>
                  {monHocDropdown.map(m => (
                    <option key={m.mamonhoc} value={m.mamonhoc}>{m.tenmonhoc}</option>
                  ))}
                </select>
              </div>
              <div className="baidang-filter-group">
                <label>Học phí tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  className="baidang-filter-input"
                  placeholder="VD: 100000"
                  value={boLocHocPhiMin}
                  onChange={e => setBoLocHocPhiMin(e.target.value)}
                  min="0"
                />
              </div>
              <div className="baidang-filter-group">
                <label>Học phí tối đa (VNĐ)</label>
                <input
                  type="number"
                  className="baidang-filter-input"
                  placeholder="VD: 2000000"
                  value={boLocHocPhiMax}
                  onChange={e => setBoLocHocPhiMax(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <label className="baidang-filter-checkbox">
              <input
                type="checkbox"
                checked={chiHienMonPhuHop}
                onChange={e => setChiHienMonPhuHop(e.target.checked)}
              />
              Chỉ hiển thị các lớp tôi có đủ Bằng cấp / Chứng chỉ để dạy
            </label>
          </div>

          {listTimLopMoi.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
              Không có yêu cầu phù hợp.
            </div>
          ) : (
            <div className="baidang-grid">
              {listTimLopMoi.map(baiDang => renderCard(baiDang))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* NỘI DUNG TAB 2 (ĐÃ ỨNG TUYỂN) CHIA NHÓM VÀ THU PHÓNG */}
          {listDaUngTuyenRaw.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
              Bạn chưa nộp hồ sơ ứng tuyển lớp nào.
            </div>
          ) : (
            <div>
              {renderSection('Đang chờ Phụ huynh duyệt', listChoDuyet, 'choDuyet', '#d97706', 'hourglass_empty')}
              {renderSection('Lớp đang diễn ra', listDangDay, 'dangDay', '#0284c7', 'school')}
              {renderSection('Lớp đã hoàn thành', listHoanThanh, 'hoanThanh', '#10b981', 'task_alt')}
              {renderSection('Yêu cầu bị từ chối', listTuChoi, 'tuChoi', '#ef4444', 'block')}
            </div>
          )}
        </>
      )}

      {/* MODAL XEM ĐÁNH GIÁ CỦA PHỤ HUYNH */}
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
                    <span
                      key={star}
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '36px',
                        color: star <= reviewHienTai.sodiem ? '#f59e0b' : '#cbd5e1',
                        fontVariationSettings: star <= reviewHienTai.sodiem ? "'FILL' 1" : "'FILL' 0"
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                  {reviewHienTai.sodiem} / 5 Sao
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'left', fontStyle: 'italic', color: '#475569', lineHeight: '1.6' }}>
                "{reviewHienTai.noidung}"
              </div>
            </div>

            <div className="bc-modal-footer" style={{ justifyContent: 'center' }}>
              <button type="button" onClick={() => setIsReviewModalOpen(false)} className="btn-outline">Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BaiDangTimGiaSu;