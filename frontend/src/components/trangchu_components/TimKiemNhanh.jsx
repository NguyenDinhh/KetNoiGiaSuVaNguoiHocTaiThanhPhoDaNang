import React, { useState, useEffect } from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom'; 
import GiaSu_Service from '../../services/GiaSu_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import KhuVuc_Service from '../../services/KhuVuc_Service';
import HeLop_Service from '../../services/HeLop_Service';

const QuickSearch = ({ onSearch }) => {
  const navigate = useNavigate(); 

  const [heLop, setHeLop] = useState('');
  const [monHoc, setMonHoc] = useState('');
  const [phuongXa, setPhuongXa] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [tatCaMonHoc, setTatCaMonHoc] = useState([]); 
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]); 
  const [danhSachPhuongXa, setDanhSachPhuongXa] = useState([]);

  
  useEffect(() => {
    const fetchToanBoDuLieu = async () => {
      try {
        const [dataHeLop, dataKhuVuc, dataMonHoc] = await Promise.all([
          HeLop_Service.layDanhSachHeLop(),
          KhuVuc_Service.layDanhSachKhuVuc(),
          MonHoc_Service.layDanhSachMonHoc() 
        ]);

        setDanhSachHeLop(dataHeLop.data || dataHeLop || []);
        setDanhSachPhuongXa(dataKhuVuc.data || dataKhuVuc || []);

        
        const dsMon = dataMonHoc.data || dataMonHoc || [];
        setTatCaMonHoc(dsMon);
        setDanhSachMonHoc(dsMon);

      } catch (error) {
        console.error("Lỗi kéo dữ liệu:", error);
      }
    };
    fetchToanBoDuLieu();
  }, []);

  
  useEffect(() => {
    setMonHoc(''); 

    if (heLop) {
      
      const monDaLoc = tatCaMonHoc.filter((mon) => mon.mahelop == heLop);
      setDanhSachMonHoc(monDaLoc);
    } else {
      
      setDanhSachMonHoc(tatCaMonHoc);
    }
  }, [heLop, tatCaMonHoc]);

  
  const handleSearch = () => {
    if (!heLop && !monHoc && !phuongXa) {
      alert("Vui lòng chọn ít nhất một tiêu chí!");
      return;
    }

    setIsSearching(true);

    
    const params = {};
    if (heLop) params.mahelop = heLop;
    if (monHoc) params.mamonhoc = monHoc;
    if (phuongXa) params.makhuvuc = phuongXa;

    console.log("👉 Dữ liệu chuẩn bị mang sang trang Tìm Môn Học:", params);

    
    setTimeout(() => {
      setIsSearching(false);

      
      if (onSearch) {
        onSearch(params);
      } else {
        
        navigate({
          pathname: '/tim-mon-hoc',
          search: createSearchParams(params).toString()
        });
      }
    }, 500);
  };

  return (
    <div className="search-panel">
      <h2>Tìm Gia Sư Nhanh</h2>
      <div className="search-grid">

        {}
        <div className="search-field-group">
          <label>Hệ lớp</label>
          <select value={heLop} onChange={(e) => setHeLop(e.target.value)}>
            <option value="">Tất cả hệ lớp</option>
            {danhSachHeLop.map((lop, index) => (
              <option key={lop.mahelop || lop.id || `hl-${index}`} value={lop.mahelop || lop.id}>
                {lop.tenhelop || lop.ten}
              </option>
            ))}
          </select>
        </div>

        {}
        <div className="search-field-group">
          <label>Môn học</label>
          <select value={monHoc} onChange={(e) => setMonHoc(e.target.value)}>
            <option value="">Tất cả môn học</option>
            {danhSachMonHoc.map((mon, index) => (
              <option key={mon.mamonhoc || mon.id || `mh-${index}`} value={mon.mamonhoc || mon.id}>
                {mon.tenmonhoc || mon.ten}
              </option>
            ))}
          </select>
        </div>

        {}
        <div className="search-field-group">
          <label>Phường/xã</label>
          <select value={phuongXa} onChange={(e) => setPhuongXa(e.target.value)}>
            <option value="">Tất cả khu vực</option>
            {danhSachPhuongXa.map((khuvuc, index) => (
              <option key={khuvuc.makhuvuc || khuvuc.id || `kv-${index}`} value={khuvuc.makhuvuc || khuvuc.id}>
                {khuvuc.tenkhuvuc || khuvuc.ten}
              </option>
            ))}
          </select>
        </div>

        {}
        <div className="search-field-group">
          <label className="hidden md:block">&nbsp;</label>
          <button type="button" className="btn-search-submit-orange" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Đang tải...' : 'Tìm kiếm ngay'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuickSearch;
