import { useState, useEffect } from 'react';
import '../../assets/css/NguoiHoc.css';
import DangKyLich_Service from '../../services/DangKyLich_Service';
import ChiTietDangKyLich_Service from '../../services/ChiTietDangKyLich_Service';
import KhungGio_GiaSu_MonHoc_Service from '../../services/KhungGio_GiaSu_MonHoc_Service';
import GiaSu_MonHoc_Service from '../../services/GiaSu_MonHoc_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';
import ChiTietYeuCau_Service from '../../services/ChiTietYeuCau_Service';
import GiaSu_Service from '../../services/GiaSu_Service';
import NguoiDung_Service from '../../services/NguoiDung_Service';
import HocVien_Service from '../../services/HocVien_Service';
import YeuCau_HocVien_Service from '../../services/YeuCau_HocVien_Service';
import DanhGia_Service from '../../services/DanhGia_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';

const DangKyLich = () => {
  
  const [activeMainTab, setActiveMainTab] = useState('danh_sach'); 

  const [danhSachDangKy, setDanhSachDangKy] = useState([]);
  const [danhSachYeuCau, setDanhSachYeuCau] = useState([]); 
  const [loading, setLoading] = useState(true);

  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [donDangChon, setDonDangChon] = useState(null);
  const [formSua, setFormSua] = useState({ ngaybatdauhoc: '', ghichu: '' });

  
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ madanhgia: null, madangky: null, sosao: 5, nhanxet: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  
  const [expanded, setExpanded] = useState({
    choDuyet: true,
    dangHoc: true,
    hoanThanh: false,
    tuChoi: false
  });

  
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
        resGiaSu, resNguoiDung, resYeuCauHV, resHocVien, resDanhGia,
        resYeuCauTimGiaSu, resChiTietYeuCau, resGiaSuUngTuyen
      ] = await Promise.all([
        DangKyLich_Service.layDanhSachDangKyLich().catch(() => []),
        ChiTietDangKyLich_Service.layDanhSachChiTietDangKyLich().catch(() => []),
        GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
        MonHoc_Service.layDanhSachMonHoc().catch(() => []),
        GiaSu_Service.layDanhSachGiaSu().catch(() => []),
        NguoiDung_Service.layDanhSachNguoiDung().catch(() => []),
        YeuCau_HocVien_Service.layDanhSachYeuCauHocVien().catch(() => []),
        HocVien_Service.layDanhSachHocVien().catch(() => []),
        DanhGia_Service.layDanhSachDanhGia().catch(() => []),
        YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
        ChiTietYeuCau_Service.layDanhSachChiTietYeuCau().catch(() => []),
        GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => [])
      ]);

      const listMonHoc = Array.isArray(resMonHoc) ? resMonHoc : (resMonHoc?.data || []);
      const arrGiaSu = Array.isArray(resGiaSu) ? resGiaSu : (resGiaSu?.data || []);
      const arrNguoiDung = Array.isArray(resNguoiDung) ? resNguoiDung : (resNguoiDung?.data || []);
      const arrYeuCauHV = Array.isArray(resYeuCauHV) ? resYeuCauHV : (resYeuCauHV?.data || []);
      const arrHocVien = Array.isArray(resHocVien) ? resHocVien : (resHocVien?.data || []);
      const arrDanhGia = Array.isArray(resDanhGia) ? resDanhGia : (resDanhGia?.data || []);

      const hocVienCuaToi = arrHocVien.filter(hv => String(hv.manguoidung) === String(maND));
      setDanhSachHocVienCuaToi(hocVienCuaToi);

      const donCuaToi = (resDangKy || []).filter(dk => String(dk.manguoidung) === String(maND));

      const dataHoanChinh = donCuaToi.map(dk => {
        const lopHoc = (resGiaSuMon || []).find(l => String(l.magiasu_monhoc) === String(dk.magiasu_monhoc)) || {};
        const mon = listMonHoc.find(m => String(m.mamonhoc) === String(lopHoc.mamonhoc));

        const giaSu = arrGiaSu.find(gs => String(gs.magiasu) === String(lopHoc.magiasu)) || {};
        const thongTinGS = arrNguoiDung.find(nd => String(nd.manguoidung || nd.id) === String(giaSu.manguoidung)) || {};

        const khungGioChon = (resChiTiet || []).filter(ct => String(ct.madangky) === String(dk.madangky));

        const cacYeuCau = arrYeuCauHV.filter(yc => String(yc.madangky) === String(dk.madangky));
        const danhSachHocVienChon = cacYeuCau.map(yc => arrHocVien.find(hv => String(hv.mahocvien) === String(yc.mahocvien))).filter(Boolean);

        const đánhGiáĐãCó = arrDanhGia.find(dg => String(dg.madangky) === String(dk.madangky));

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

      
      setDanhSachDangKy(dataHoanChinh.sort((a, b) => {
        if (Number(a.trangthai) !== Number(b.trangthai)) {
          return Number(a.trangthai) - Number(b.trangthai);
        }
        return String(b.madangky) - String(a.madangky);
      }));

      
      const arrYeuCau = Array.isArray(resYeuCauTimGiaSu) ? resYeuCauTimGiaSu : (resYeuCauTimGiaSu?.data || []);
      const arrChiTietYC = Array.isArray(resChiTietYeuCau) ? resChiTietYeuCau : (resChiTietYeuCau?.data || []);
      const arrGiaSuUngTuyen = Array.isArray(resGiaSuUngTuyen) ? resGiaSuUngTuyen : (resGiaSuUngTuyen?.data || []);

      const yeuCauCuaToi = arrYeuCau.filter(yc => String(yc.manguoidung) === String(maND));

      const dataYeuCau = yeuCauCuaToi.map(yc => {
        const mon = listMonHoc.find(m => String(m.mamonhoc) === String(yc.mamonhoc));
        
        
        const ungTuyenDuocDuyet = arrGiaSuUngTuyen.find(ut => 
          String(ut.mayeucau) === String(yc.mayeucau) && Number(ut.trangthai) === 1
        );
        
        let giaSu = {};
        let thongTinGS = {};
        
        if (ungTuyenDuocDuyet) {
          giaSu = arrGiaSu.find(gs => String(gs.magiasu) === String(ungTuyenDuocDuyet.magiasu)) || {};
          thongTinGS = arrNguoiDung.find(nd => String(nd.manguoidung || nd.id) === String(giaSu.manguoidung)) || {};
        }

        const khungGioYC = arrChiTietYC.filter(ct => String(ct.mayeucau) === String(yc.mayeucau));

        const cacYeuCauHV = arrYeuCauHV.filter(ychv => String(ychv.mayeucau) === String(yc.mayeucau));
        const danhSachHocVienYC = cacYeuCauHV.map(ychv => arrHocVien.find(hv => String(hv.mahocvien) === String(ychv.mahocvien))).filter(Boolean);

        return {
          mayeucau: yc.mayeucau,
          nguon: 'yeucau', 
          trangthai: yc.trangthai,
          tenmonhoc: mon ? mon.tenmonhoc : 'Môn học ẩn',
          giasu_ten: thongTinGS.name || thongTinGS.hoten || 'Chưa cập nhật',
          giasu_sdt: thongTinGS.phone || thongTinGS.sodienthoai || 'Chưa cập nhật',
          giasu_email: thongTinGS.email || 'Chưa cập nhật',
          danhSachKhungGioChon: khungGioYC,
          danhSachHocVien: danhSachHocVienYC,
          tonghocphi: yc.tonghocphi,
          ghichu: yc.ghichu,
          ngaybatdauhoc: yc.ngaybatdauhoc
        };
      });

      setDanhSachYeuCau(dataYeuCau.sort((a, b) => {
        if (Number(a.trangthai) !== Number(b.trangthai)) {
          return Number(a.trangthai) - Number(b.trangthai);
        }
        return String(b.mayeucau) - String(a.mayeucau);
      }));
      
    } catch (error) {
      console.error("Lỗi tải tiến trình lịch đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleHuyDonDangKy = async (dk) => {
    if (Number(dk.trangthai) !== 0) {
        return alert("Chỉ có thể hủy những đơn đang ở trạng thái 'Chờ gia sư duyệt'!");
    }

    if (!window.confirm("⚠️ BẠN CÓ CHẮC CHẮN MUỐN HỦY ĐƠN ĐĂNG KÝ NÀY?\n\nHành động này sẽ XÓA VĨNH VIỄN toàn bộ dữ liệu của đơn này.\nĐồng thời, các Khung giờ bạn đã giữ chỗ sẽ được mở lại cho người khác.")) return;
    
    try {
      if (dk.danhSachKhungGioChon && dk.danhSachKhungGioChon.length > 0) {
        for (const ct of dk.danhSachKhungGioChon) {
          await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(ct.makhunggio, { trangthai: 1 });
          await ChiTietDangKyLich_Service.xoaChiTietDangKyLich(ct.machitietdangky);
        }
      }

      const resYCHV = await YeuCau_HocVien_Service.layDanhSachYeuCauHocVien();
      const arrYCHV = Array.isArray(resYCHV) ? resYCHV : (resYCHV?.data || []);
      const cacYCHVCanXoa = arrYCHV.filter(yc => String(yc.madangky) === String(dk.madangky));
      
      for (const yc of cacYCHVCanXoa) {
        await YeuCau_HocVien_Service.xoaYeuCauHocVien(yc.mayeucau_hocvien);
      }

      const xoaGoc = await DangKyLich_Service.xoaDangKyLich(dk.madangky);
      if (xoaGoc.code && xoaGoc.code !== "200" && xoaGoc.code !== 200) {
          throw new Error(xoaGoc.message || "Backend từ chối xóa gốc");
      }

      alert("🎉 Đã hủy đơn và dọn dẹp hệ thống thành công!");
      fetchLichDaDangKy();
    } catch (error) {
      console.error("Lỗi khi hủy đơn:", error);
      alert("❌ Hủy đơn thất bại! Vui lòng kiểm tra lại đường truyền.");
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
        madangky: String(reviewData.madangky),
        sodiem: parseFloat(reviewData.sosao),
        noidung: String(reviewData.nhanxet)
      };

      console.log("DEBUG: Gửi đánh giá đăng ký lịch với payload:", payloadDanhGia);

      if (reviewData.madanhgia) {
        const result = await DanhGia_Service.capNhatDanhGia(reviewData.madanhgia, payloadDanhGia);
        console.log("DEBUG: Kết quả cập nhật đánh giá:", result);
        
        if (donDangChon) {
          const resultCapNhat = await DangKyLich_Service.capNhatDangKyLich(donDangChon.madangky, { ...donDangChon, trangthai: 3 });
          console.log("DEBUG: Đảm bảo trạng thái đăng ký lịch = 3:", resultCapNhat);
        }
        
        alert("🎉 Đã cập nhật đánh giá thành công!");
      } else {
        const resultDanhGia = await DanhGia_Service.themDanhGiaMoi(payloadDanhGia);
        console.log("DEBUG: Kết quả thêm đánh giá:", resultDanhGia);

        if (donDangChon) {
          const resultCapNhat = await DangKyLich_Service.capNhatDangKyLich(donDangChon.madangky, { ...donDangChon, trangthai: 3 });
          console.log("DEBUG: Cập nhật trạng thái đăng ký lịch = 3:", resultCapNhat);

          if (donDangChon.danhSachKhungGioChon && donDangChon.danhSachKhungGioChon.length > 0) {
            for (const ct of donDangChon.danhSachKhungGioChon) {
              await KhungGio_GiaSu_MonHoc_Service.suaKhungGio(ct.makhunggio, { trangthai: 1 });
            }
            console.log("DEBUG: Đã mở lại khung giờ (trangthai = 1)");
          }
        }
        alert("🎉 Đã hoàn thành khóa học và ghi nhận đánh giá Gia sư thành công!");
      }
      setIsReviewOpen(false);
      fetchLichDaDangKy();
    } catch (error) {
      console.error("LỖI khi xử lý đánh giá đăng ký lịch:", error);
      alert(`Đã xảy ra lỗi: ${error.message || "Không thể thực hiện đánh giá"}`);
    }
  };

  
  const getLichHocData = () => {
    let dsCaHoc = [];
    
    
    const cacLopDangHocTuDangKy = danhSachDangKy.filter(dk => Number(dk.trangthai) === 1);
    
    
    const cacLopDangHocTuYeuCau = danhSachYeuCau.filter(yc => Number(yc.trangthai) === 1);

    
    cacLopDangHocTuDangKy.forEach(dk => {
      const coHocVienDuocChon = tabHocVien === 'Tất cả'
        ? true
        : dk.danhSachHocVien.some(hv => String(hv.mahocvien) === String(tabHocVien));

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

    
    cacLopDangHocTuYeuCau.forEach(yc => {
      const coHocVienDuocChon = tabHocVien === 'Tất cả'
        ? true
        : yc.danhSachHocVien.some(hv => String(hv.mahocvien) === String(tabHocVien));

      if (coHocVienDuocChon) {
        yc.danhSachKhungGioChon?.forEach(ct => {
          dsCaHoc.push({
            machitiet: ct.machitietyeucau,
            thu: ct.ngayhoc,
            giobatdau: String(ct.thoigianbatdau).slice(0, 5),
            gioketthuc: String(ct.thoigianketthuc).slice(0, 5),
            tenmonhoc: yc.tenmonhoc,
            giasu_ten: yc.giasu_ten,
            giasu_sdt: yc.giasu_sdt,
            ghichudon: yc.ghichu,
            hocvien: yc.danhSachHocVien
          });
        });
      }
    });

    dsCaHoc.sort((a, b) => a.giobatdau.localeCompare(b.giobatdau));
    return dsCaHoc.filter(ca => tabThu === 'Tất cả' || ca.thu === tabThu);
  };

  const lichHocHienThi = getLichHocData();

  
  const listChoDuyet = danhSachDangKy.filter(dk => Number(dk.trangthai) === 0);
  const listDangHoc = danhSachDangKy.filter(dk => Number(dk.trangthai) === 1);
  const listTuChoi = danhSachDangKy.filter(dk => Number(dk.trangthai) === 2);
  const listHoanThanh = danhSachDangKy.filter(dk => Number(dk.trangthai) === 3);
  
  const tongDon = danhSachDangKy.length;
  const donDangHoc = listDangHoc.length;
  const donHoanThanh = listHoanThanh.length;

  
  const renderSection = (title, list, expandedKey, color, icon) => {
    if (list.length === 0) return null;
    const isExpanded = expanded[expandedKey];
    
    let badgeText = '';
    let badgeColor = '';
    switch(expandedKey) {
      case 'choDuyet': badgeText = 'Chờ gia sư duyệt'; badgeColor = '#f59e0b'; break;
      case 'dangHoc': badgeText = 'Đang học (Gia sư đã nhận)'; badgeColor = '#0284c7'; break;
      case 'hoanThanh': badgeText = 'Đã Hoàn Thành'; badgeColor = '#10b981'; break;
      case 'tuChoi': badgeText = 'Gia sư từ chối'; badgeColor = '#ef4444'; break;
      default: break;
    }

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
          <div className="dkl-section-items">
            {list.map(dk => (
              <div key={dk.madangky} className="dkl-card">

                <div className="dkl-card-header">
                  <span className="dkl-card-title">📚 Khóa học: {dk.tenmonhoc}</span>
                  <span className="dkl-status-badge" style={{ backgroundColor: badgeColor }}>
                    {badgeText}
                  </span>
                </div>

                <div className="dkl-info-grid">
                  <div className="dkl-info-box giasu">
                    <div className="dkl-info-box-title giasu">
                      <span className="material-symbols-outlined dkl-info-box-icon">school</span> Thông tin Gia sư
                    </div>
                    <div className="dkl-info-item">• <strong>Họ tên:</strong> {dk.giasu_ten}</div>
                    <div className="dkl-info-item">• <strong>SĐT:</strong> {dk.giasu_sdt}</div>
                    <div className="dkl-info-item">• <strong>Email:</strong> {dk.giasu_email}</div>
                  </div>

                  <div className="dkl-info-box default">
                    <div className="dkl-info-box-title default">
                      <span className="material-symbols-outlined dkl-info-box-icon primary">face</span> Học viên tham gia
                    </div>
                    {dk.danhSachHocVien.length === 0 ? (
                      <div className="dkl-info-empty">Chưa cập nhật</div>
                    ) : (
                      dk.danhSachHocVien.map(hv => (
                        <div key={hv.mahocvien} className="dkl-info-item small">
                          • <strong>{hv.tenhocvien}</strong> (SN: {hv.namsinh})
                        </div>
                      ))
                    )}
                  </div>

                  <div className="dkl-info-box default">
                    <div className="dkl-info-box-title default">
                      <span className="material-symbols-outlined dkl-info-box-icon primary">alarm</span> Khung lịch đã chọn
                    </div>
                    {dk.danhSachKhungGioChon?.map(ct => (
                      <div key={ct.machitietdangky} className="dkl-schedule-item">
                        • <strong>{ct.ngayhoc}</strong>: {String(ct.thoigianbatdau).slice(0, 5)} - {String(ct.thoigianketthuc).slice(0, 5)}
                      </div>
                    ))}
                    <div className="dkl-schedule-divider">
                      • <strong>Học phí:</strong> <span className="dkl-fee-text">{dk.tonghocphi?.toLocaleString()} đ</span>
                    </div>
                  </div>
                </div>

                <div className="dkl-card-footer">
                  <div className="dkl-footer-info">
                    <div>Khai giảng dự kiến: <strong>{dk.ngaybatdauhoc ? new Date(dk.ngaybatdauhoc).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}</strong></div>
                    {dk.ghichu && <div className="dkl-footer-note">💬 Ghi chú: "{dk.ghichu}"</div>}
                    {Number(dk.trangthai) === 2 && dk.lydotuchoi && (
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        background: '#fef2f2', 
                        border: '1px solid #fca5a5', 
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#dc2626',
                        fontWeight: '600'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
                        Lý do từ chối: {dk.lydotuchoi}
                      </div>
                    )}
                  </div>

                  <div className="dkl-footer-actions">
                    {Number(dk.trangthai) === 0 && (
                      <>
                        <button onClick={() => handleMoModalSua(dk)} className="dkl-btn edit">
                          <span className="material-symbols-outlined dkl-btn-icon">edit</span> Sửa
                        </button>
                        <button onClick={() => handleHuyDonDangKy(dk)} className="dkl-btn delete">
                          <span className="material-symbols-outlined dkl-btn-icon">delete</span> Hủy đơn
                        </button>
                      </>
                    )}
                    {Number(dk.trangthai) === 1 && (
                      <button onClick={() => handleMoDanhGia(dk)} className="dkl-btn complete">
                        <span className="material-symbols-outlined dkl-btn-icon">task_alt</span> Hoàn thành khóa học
                      </button>
                    )}
                    {Number(dk.trangthai) === 3 && (
                      <button onClick={() => handleMoDanhGia(dk)} className="dkl-btn review-edit">
                        <span className="material-symbols-outlined dkl-btn-icon">edit_square</span> Sửa đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="nh-content-card">
      <div className="dkl-header-section">
        <span className="material-symbols-outlined dkl-header-icon">calendar_month</span>
        <div>
          <h2 className="dkl-header-title">Quản lý đăng ký học</h2>
          <p className="dkl-header-subtitle">Xem tiến độ phê duyệt và thời khóa biểu của các lớp học từ Gia sư.</p>
        </div>
      </div>

      <div className="dkl-tabs-container">
        <button
          onClick={() => setActiveMainTab('danh_sach')}
          className={`dkl-tab-button ${activeMainTab === 'danh_sach' ? 'active-danh-sach' : 'inactive'}`}
        >
          <span className="material-symbols-outlined dkl-tab-icon">list_alt</span>
          Danh sách Đơn đăng ký
        </button>
        <button
          onClick={() => setActiveMainTab('lich_hoc')}
          className={`dkl-tab-button ${activeMainTab === 'lich_hoc' ? 'active-lich-hoc' : 'inactive'}`}
        >
          <span className="material-symbols-outlined dkl-tab-icon">view_timeline</span>
          Lịch học của Học viên
        </button>
      </div>

      {loading ? (
        <div className="dkl-loading-message">Đang đồng bộ dữ liệu học tập của bạn...</div>
      ) : activeMainTab === 'danh_sach' ? (

        <>
          {}
          <div className="dkl-stats-grid">
            <div className="dkl-stat-card">
              <div className="dkl-stat-icon-wrapper neutral">
                <span className="material-symbols-outlined dkl-stat-icon">receipt_long</span>
              </div>
              <div>
                <div className="dkl-stat-label">Tổng số đơn</div>
                <div className="dkl-stat-value neutral">{tongDon}</div>
              </div>
            </div>

            <div className="dkl-stat-card">
              <div className="dkl-stat-icon-wrapper primary">
                <span className="material-symbols-outlined dkl-stat-icon">menu_book</span>
              </div>
              <div>
                <div className="dkl-stat-label">Lớp đang học</div>
                <div className="dkl-stat-value primary">{donDangHoc}</div>
              </div>
            </div>

            <div className="dkl-stat-card">
              <div className="dkl-stat-icon-wrapper success">
                <span className="material-symbols-outlined dkl-stat-icon">verified</span>
              </div>
              <div>
                <div className="dkl-stat-label">Đã hoàn thành</div>
                <div className="dkl-stat-value success">{donHoanThanh}</div>
              </div>
            </div>
          </div>

          {}
          {danhSachDangKy.length === 0 ? (
            <div className="dkl-empty-state">
              Bạn chưa thực hiện gửi đơn đăng ký lịch học nào.
            </div>
          ) : (
            <div className="dkl-sections-container">
              {renderSection('Đơn đang chờ duyệt', listChoDuyet, 'choDuyet', '#d97706', 'hourglass_empty')}
              {renderSection('Lớp đang diễn ra', listDangHoc, 'dangHoc', '#0284c7', 'school')}
              {renderSection('Lớp đã hoàn thành', listHoanThanh, 'hoanThanh', '#10b981', 'task_alt')}
              {renderSection('Đơn đã bị từ chối / Hủy', listTuChoi, 'tuChoi', '#ef4444', 'block')}
            </div>
          )}
        </>
      ) : (
        <div className="dkl-schedule-container">

          <div className="dkl-filter-box">
            <div className="dkl-filter-label">
              <span className="material-symbols-outlined dkl-filter-label-icon">face</span>
              Chọn xem lịch của học viên:
            </div>
            <div className="dkl-filter-buttons">
              <button
                onClick={() => setTabHocVien('Tất cả')}
                className={`dkl-filter-button ${tabHocVien === 'Tất cả' ? 'student-active' : 'student-inactive'}`}
              >
                Tất cả học viên
              </button>
              {danhSachHocVienCuaToi.map(hv => (
                <button
                  key={hv.mahocvien}
                  onClick={() => setTabHocVien(hv.mahocvien)}
                  className={`dkl-filter-button ${tabHocVien === hv.mahocvien ? 'student-active' : 'student-inactive'}`}
                >
                  Bé {hv.tenhocvien}
                </button>
              ))}
            </div>
          </div>

          <div className="dkl-day-buttons">
            {cacThuTrongTuan.map(thu => (
              <button
                key={thu}
                onClick={() => setTabThu(thu)}
                className={`dkl-filter-button ${tabThu === thu ? 'day-active' : 'day-inactive'}`}
              >
                {thu}
              </button>
            ))}
          </div>

          {lichHocHienThi.length === 0 ? (
            <div className="dkl-empty-state">
              Không có tiết học nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="dkl-schedule-grid">
              {lichHocHienThi.map((ca, idx) => (
                <div key={idx} className="dkl-schedule-card">

                  <div className="dkl-schedule-card-header">
                    <span className="dkl-day-badge">
                      {ca.thu}
                    </span>
                    <span className="dkl-time-display">
                      <span className="material-symbols-outlined dkl-time-icon">schedule</span>
                      {ca.giobatdau} - {ca.gioketthuc}
                    </span>
                  </div>

                  <h4 className="dkl-schedule-subject">Môn: {ca.tenmonhoc}</h4>

                  <div className="dkl-schedule-tutor">
                    <span className="material-symbols-outlined dkl-schedule-tutor-icon">school</span>
                    <span><strong>Gia sư:</strong> {ca.giasu_ten} ({ca.giasu_sdt})</span>
                  </div>

                  <div className="dkl-schedule-students-box">
                    <div className="dkl-schedule-students-title">Người đi học ca này:</div>
                    {ca.hocvien.length === 0 ? <span className="dkl-schedule-student-empty">Chưa cập nhật</span> :
                      ca.hocvien.map((hv, hIdx) => (
                        <div key={hIdx} className="dkl-schedule-student-item">
                          • <strong>Bé {hv.tenhocvien}</strong> <span className="dkl-schedule-student-year">(SN: {hv.namsinh})</span>
                        </div>
                      ))
                    }
                  </div>

                  {ca.ghichudon && (
                    <div className="dkl-schedule-note">
                      "{ca.ghichudon}"
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {}
      {isReviewOpen && (
        <div className="dkl-modal-overlay">
          <div className="dkl-modal-content small">
            <div className="dkl-modal-header centered">
              <h3 className="dkl-modal-title">
                {reviewData.madanhgia ? 'Chỉnh sửa Đánh giá' : 'Đánh giá Gia sư'}
              </h3>
              <button onClick={() => setIsReviewOpen(false)} className="dkl-modal-close absolute">&times;</button>
            </div>

            <form onSubmit={handleSubmitHoanThanhHoc} className="dkl-modal-form">
              <div className="dkl-rating-section">
                <p className="dkl-rating-question">
                  {reviewData.madanhgia ? 'Bạn muốn thay đổi mức độ hài lòng?' : 'Mức độ hài lòng của bạn về khóa học?'}
                </p>
                <div className="dkl-stars-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined dkl-star ${star <= (hoveredStar || reviewData.sosao) ? 'filled' : 'empty'}`}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setReviewData({ ...reviewData, sosao: star })}
                      style={{
                        fontVariationSettings: star <= (hoveredStar || reviewData.sosao) ? "'FILL' 1" : "'FILL' 0"
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <div className="dkl-rating-label">
                  {reviewData.sosao === 5 ? 'Rất tuyệt vời (5 Sao)' :
                   reviewData.sosao === 4 ? 'Hài lòng (4 Sao)' :
                   reviewData.sosao === 3 ? 'Bình thường (3 Sao)' :
                   reviewData.sosao === 2 ? 'Không hài lòng (2 Sao)' : 'Rất tệ (1 Sao)'}
                </div>
              </div>

              <div className="nh-form-group">
                <label className="nh-form-label">Nhận xét chi tiết *</label>
                <textarea
                  className="nh-input" rows="4" required
                  placeholder="Chia sẻ cảm nhận về thái độ, phương pháp giảng dạy..."
                  value={reviewData.nhanxet}
                  onChange={e => setReviewData({ ...reviewData, nhanxet: e.target.value })}
                ></textarea>
              </div>

              <div className="dkl-modal-footer">
                <button type="button" onClick={() => setIsReviewOpen(false)} className="dkl-modal-btn cancel">Hủy bỏ</button>
                <button type="submit" className="dkl-modal-btn submit">
                  {reviewData.madanhgia ? 'Lưu thay đổi' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="dkl-modal-overlay">
          <div className="dkl-modal-content medium">
            <div className="dkl-modal-header">
              <h3 className="dkl-modal-title">Chỉnh sửa thông tin đăng ký</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="dkl-modal-close">&times;</button>
            </div>
            <form onSubmit={handleLuuChinhSua} className="dkl-edit-form">
              <div className="nh-form-group">
                <label className="nh-form-label">Chọn lại ngày bắt đầu học</label>
                <input
                  type="date"
                  className="nh-input"
                  value={formSua.ngaybatdauhoc}
                  onChange={e => setFormSua({ ...formSua, ngaybatdauhoc: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="nh-form-group">
                <label className="nh-form-label">Nội dung lời nhắn cho Gia sư</label>
                <textarea
                  className="nh-input dkl-textarea-no-resize"
                  rows="3"
                  placeholder="Nhập địa điểm học chi tiết hoặc ghi chú mới..."
                  value={formSua.ghichu}
                  onChange={e => setFormSua({ ...formSua, ghichu: e.target.value })}
                />
              </div>
              <div className="dkl-modal-footer default">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-nh-outline">Hủy bỏ</button>
                <button type="submit" className="btn-nh-submit">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangKyLich;