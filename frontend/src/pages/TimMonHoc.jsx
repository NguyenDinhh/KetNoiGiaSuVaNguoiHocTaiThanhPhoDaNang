import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import '../assets/css/TimMonHoc.css';

import GiaSu_MonHoc_Service from '../services/GiaSu_MonHoc_Service';
import MonHoc_Service from '../services/MonHoc_Service';
import HeLop_Service from '../services/HeLop_Service';
import KhuVuc_Service from '../services/KhuVuc_Service';
import GiaSu_Service from '../services/GiaSu_Service';
import NguoiDung_Service from '../services/NguoiDung_Service';
import ChiTietMonHoc from '../components/timmonhoc_components/ChiTietMonHoc.jsx';

const xuLyHocPhi = (item) => Number(item.hocphimoibuoi || item.hocPhiMoiBuoi) || 0;
const xuLySoBuoi = (item) => Number(item.sobuoihoc || item.soBuoiHoc) || 1;
const xuLyThoiLuong = (item) => (item.thoiluonghoc || item.thoiLuongHoc) ? `${item.thoiluonghoc || item.thoiLuongHoc} phút/buổi` : 'Chưa cập nhật';

const layDataAnToan = (res) => {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

const TimMonHoc = () => {
  
  const [searchParams] = useSearchParams();
  const paramHeLop = searchParams.get('mahelop') || '';
  const paramMonHoc = searchParams.get('mamonhoc') || '';
  const paramKhuVuc = searchParams.get('makhuvuc') || '';

  const [monHocDuocChon, setMonHocDuocChon] = useState(null);
  const [danhSachGiaSuMonHoc, setDanhSachGiaSuMonHoc] = useState([]);
  const [tatCaMonHoc, setTatCaMonHoc] = useState([]);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [danhSachKhuVuc, setDanhSachKhuVuc] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [boLoc, setBoLoc] = useState({
    heLop: paramHeLop,
    monHoc: paramMonHoc,
    hocPhi: '',
    khuVuc: paramKhuVuc
  });

  useEffect(() => {
    const fetchToanBoDuLieu = async () => {
      try {
        setIsLoading(true);
        const [resGSMH, resMonHoc, resHeLop, resKhuVuc, resGiaSu, resNguoiDung] = await Promise.all([
          GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc().catch(() => []),
          MonHoc_Service.layDanhSachMonHoc().catch(() => []),
          HeLop_Service.layDanhSachHeLop().catch(() => []),
          KhuVuc_Service.layDanhSachKhuVuc().catch(() => []),
          GiaSu_Service.layDanhSachGiaSu().catch(() => []),
          NguoiDung_Service.layDanhSachNguoiDung().catch(() => [])
        ]);

        const listMonHoc = layDataAnToan(resMonHoc);
        const listHeLop = layDataAnToan(resHeLop);
        const listKhuVuc = layDataAnToan(resKhuVuc);
        const listGSMH = layDataAnToan(resGSMH);
        const listGiaSu = layDataAnToan(resGiaSu);
        const listNguoiDung = layDataAnToan(resNguoiDung);

        setTatCaMonHoc(listMonHoc);
        setDanhSachHeLop(listHeLop);
        setDanhSachKhuVuc(listKhuVuc);

        
        if (paramHeLop) {
          setDanhSachMonHoc(listMonHoc.filter(m => String(m.mahelop || m.maHeLop) === String(paramHeLop)));
        } else {
          setDanhSachMonHoc(listMonHoc);
        }

        const mappedData = await Promise.all(listGSMH.map(async (item) => {
          const m_mamonhoc = item.mamonhoc || item.maMonHoc;
          const m_makhuvuc = item.makhuvuc || item.maKhuVuc;

          const mon = listMonHoc.find(m => String(m.mamonhoc || m.maMonHoc) === String(m_mamonhoc));
          const he = listHeLop.find(h => String(h.mahelop || h.maHeLop) === String(mon?.mahelop || mon?.maHeLop));
          const khu = listKhuVuc.find(k => String(k.makhuvuc || k.maKhuVuc) === String(m_makhuvuc));

          let tenGiaSu = 'Đang cập nhật';
          const maGiaSuCuaMonHoc = item.magiasu || item.maGiaSu;

          if (maGiaSuCuaMonHoc) {
            const giaSu = listGiaSu.find(g => String(g.magiasu || g.maGiaSu || g.id) === String(maGiaSuCuaMonHoc));
            if (giaSu) {
              const maNguoiDung = giaSu.manguoidung || giaSu.maNguoiDung;
              if (maNguoiDung) {
                const nguoiDung = listNguoiDung.find(nd => String(nd.manguoidung || nd.maNguoiDung || nd.id) === String(maNguoiDung));
                if (nguoiDung) tenGiaSu = nguoiDung.hoten || nguoiDung.hoTen || nguoiDung.name || 'Tên trống';
              }
            }
          }

          const cleanHocPhi = xuLyHocPhi(item);
          const cleanSoBuoi = xuLySoBuoi(item);
          const tongHocPhiApi = await GiaSu_MonHoc_Service.tinhHocPhi(cleanHocPhi, cleanSoBuoi);

          return {
            ...item,
            mahelop: mon ? (mon.mahelop || mon.maHeLop) : null, 
            tenmonhoc: mon ? (mon.tenmonhoc || mon.tenMonHoc) : 'Chưa cập nhật',
            tenhelop: he ? (he.tenhelop || he.tenHeLop) : 'Chưa cập nhật',
            tenkhuvuc: khu ? (khu.tenkhuvuc || khu.tenKhuVuc) : 'Chưa cập nhật',
            tengiasu: tenGiaSu,
            sobuoihoc: cleanSoBuoi,
            thoiluonghienthi: xuLyThoiLuong(item),
            hocphitong: tongHocPhiApi
          };
        }));

        const activeData = mappedData.filter(item => item.trangthai === 1);
        setDanhSachGiaSuMonHoc(activeData);
      } catch (err) {
        console.error("Lỗi đồng bộ API tổng hợp:", err);
        setError("Không thể kết nối dữ liệu từ máy chủ!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchToanBoDuLieu();
  }, []);

  
  useEffect(() => {
    if (boLoc.heLop) {
      const monDaLoc = tatCaMonHoc.filter((mon) => String(mon.mahelop || mon.maHeLop) === String(boLoc.heLop));
      setDanhSachMonHoc(monDaLoc);
    } else {
      setDanhSachMonHoc(tatCaMonHoc);
    }
  }, [boLoc.heLop, tatCaMonHoc]);

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBoLoc(prev => {
      const newFilters = { ...prev, [name]: value };
      
      if (name === 'heLop') {
        newFilters.monHoc = '';
      }
      return newFilters;
    });
  };

  const danhSachHienThi = danhSachGiaSuMonHoc.filter(item => {
    const khớpHệLớp = boLoc.heLop === '' || String(item.mahelop) === String(boLoc.heLop); 
    const khớpMôn = boLoc.monHoc === '' || String(item.mamonhoc || item.maMonHoc) === String(boLoc.monHoc);
    const khớpKhuVực = boLoc.khuVuc === '' || String(item.makhuvuc || item.maKhuVuc) === String(boLoc.khuVuc);
    const khớpHọcPhí = boLoc.hocPhi === '' || item.hocphitong <= Number(boLoc.hocPhi);
    return khớpHệLớp && khớpMôn && khớpKhuVực && khớpHọcPhí;
  });

  return (
    <div className="tmh-wrapper">
      <section className="tmh-hero">
        <h1 className="tmh-hero-title">Tra Cứu Môn Giảng Dạy</h1>
        <p className="tmh-hero-desc">Khám phá danh sách các môn học, hệ lớp và mức học phí rõ ràng từ đội ngũ Gia sư uy tín.</p>
      </section>

      <section className="tmh-filter-section">
        <div className="tmh-filter-card">
          <div className="tmh-filter-grid">
            <div className="tmh-form-group">
              <label className="tmh-label">Hệ lớp</label>
              <select name="heLop" value={boLoc.heLop} onChange={handleInputChange} className="tmh-select">
                <option value="">-- Tất cả hệ lớp --</option>
                {danhSachHeLop.map((hl) => (
                  <option key={hl.mahelop || hl.maHeLop} value={hl.mahelop || hl.maHeLop}>{hl.tenhelop || hl.tenHeLop}</option>
                ))}
              </select>
            </div>
            <div className="tmh-form-group">
              <label className="tmh-label">Môn học</label>
              <select name="monHoc" value={boLoc.monHoc} onChange={handleInputChange} className="tmh-select">
                <option value="">-- Tất cả môn học --</option>
                {danhSachMonHoc.map((mh) => (
                  <option key={mh.mamonhoc || mh.maMonHoc} value={mh.mamonhoc || mh.maMonHoc}>{mh.tenmonhoc || mh.tenMonHoc}</option>
                ))}
              </select>
            </div>
            <div className="tmh-form-group">
              <label className="tmh-label">Khu vực</label>
              <select name="khuVuc" value={boLoc.khuVuc} onChange={handleInputChange} className="tmh-select">
                <option value="">-- Toàn thành phố --</option>
                {danhSachKhuVuc.map((kv) => (
                  <option key={kv.makhuvuc || kv.maKhuVuc} value={kv.makhuvuc || kv.maKhuVuc}>{kv.tenkhuvuc || kv.tenKhuVuc}</option>
                ))}
              </select>
            </div>
            <div className="tmh-form-group">
              <label className="tmh-label">Học phí tối đa (VNĐ)</label>
              <input type="number" name="hocPhi" value={boLoc.hocPhi} onChange={handleInputChange} className="tmh-input" placeholder="VD: 2000000" />
            </div>
          </div>
        </div>
      </section>

      <section className="tmh-list-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 24px 0' }}>
          <h2 className="tmh-section-title" style={{ margin: 0 }}>Danh sách môn học hiện có</h2>
          <span style={{ color: '#64748b', fontWeight: '500' }}>Tìm thấy {danhSachHienThi.length} môn học</span>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#005088' }}>
            <p style={{ fontWeight: 'bold' }}>Đang tiến hành đồng bộ và tính toán dữ liệu từ máy chủ...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
            <p>{error}</p>
          </div>
        ) : danhSachHienThi.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8', fontStyle: 'italic' }}>
            Không tìm thấy môn học nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="tmh-grid">
            {danhSachHienThi.map((item, index) => (
              <div key={item.magiasu_monhoc ?? index} className="tmh-card">
                <div className="tmh-card-badge">{item.tenhelop}</div>
                <h3 className="tmh-card-title">Môn: {item.tenmonhoc}</h3>

                <div className="tmh-card-info">
                  <p><span className="material-symbols-outlined tmh-icon">person</span><strong>Gia sư:</strong> {item.tengiasu}</p>
                  <p><span className="material-symbols-outlined tmh-icon">location_on</span><strong>Khu vực:</strong> {item.tenkhuvuc}</p>
                  <p><span className="material-symbols-outlined tmh-icon">schedule</span><strong>Tổng buổi:</strong> {item.sobuoihoc} buổi</p>
                  <p><span className="material-symbols-outlined tmh-icon">timer</span><strong>Thời lượng:</strong> {item.thoiluonghienthi}</p>
                </div>

                <div className="tmh-card-footer">
                  <p className="tmh-card-fee">
                    {item.hocphitong > 0 ? `${item.hocphitong.toLocaleString('vi-VN')} đ` : 'Chưa cập nhật phí'}
                  </p>
                  <button type="button" className="tmh-btn-detail" onClick={() => setMonHocDuocChon(item)}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {monHocDuocChon && (
        <ChiTietMonHoc item={monHocDuocChon} onClose={() => setMonHocDuocChon(null)} />
      )}
    </div>
  );
};

export default TimMonHoc;
