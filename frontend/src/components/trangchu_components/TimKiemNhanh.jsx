import React, { useState, useEffect } from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom'; // 🟢 Bổ sung Hook chuyển trang
import GiaSu_Service from '../../services/GiaSu_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import KhuVuc_Service from '../../services/KhuVuc_Service';
import HeLop_Service from '../../services/HeLop_Service';

// 🟢 Thêm prop onSearch đề phòng trường hợp ông gọi nó ở trang chủ và muốn tự bắt sự kiện
const QuickSearch = ({ onSearch }) => {
  const navigate = useNavigate(); // 🟢 Khởi tạo công cụ chuyển trang

  const [heLop, setHeLop] = useState('');
  const [monHoc, setMonHoc] = useState('');
  const [phuongXa, setPhuongXa] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [danhSachHeLop, setDanhSachHeLop] = useState([]);
  const [tatCaMonHoc, setTatCaMonHoc] = useState([]); // <- TÚI CHỨA GỐC ĐỂ DÀNH LỌC
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]); // <- DANH SÁCH HIỂN THỊ LÊN MÀN HÌNH
  const [danhSachPhuongXa, setDanhSachPhuongXa] = useState([]);

  // ================= BƯỚC 1: LẤY SẠCH SẼ MỌI THỨ KHI MỚI VÔ TRANG =================
  useEffect(() => {
    const fetchToanBoDuLieu = async () => {
      try {
        const [dataHeLop, dataKhuVuc, dataMonHoc] = await Promise.all([
          HeLop_Service.layDanhSachHeLop(),
          KhuVuc_Service.layDanhSachKhuVuc(),
          MonHoc_Service.layDanhSachMonHoc() // Lấy All Môn Học
        ]);

        setDanhSachHeLop(dataHeLop.data || dataHeLop || []);
        setDanhSachPhuongXa(dataKhuVuc.data || dataKhuVuc || []);

        // Bỏ hết môn học vào kho gốc, đồng thời cho nó hiển thị ra màn hình luôn
        const dsMon = dataMonHoc.data || dataMonHoc || [];
        setTatCaMonHoc(dsMon);
        setDanhSachMonHoc(dsMon);

      } catch (error) {
        console.error("Lỗi kéo dữ liệu:", error);
      }
    };
    fetchToanBoDuLieu();
  }, []);

  // ================= BƯỚC 2: "NGỒI RÌNH" HỆ LỚP ĐỂ LỌC LẠI MÔN HỌC =================
  useEffect(() => {
    setMonHoc(''); // Cứ đổi Hệ lớp là reset Môn đang chọn

    if (heLop) {
      // Nếu có chọn Hệ lớp -> Lấy cái túi gốc ra lọc những môn khớp mã hệ lớp
      const monDaLoc = tatCaMonHoc.filter((mon) => mon.mahelop == heLop);
      setDanhSachMonHoc(monDaLoc);
    } else {
      // Nếu không chọn Hệ Lớp (hoặc chọn lại "Tất cả") -> Xổ ra lại toàn bộ môn học
      setDanhSachMonHoc(tatCaMonHoc);
    }
  }, [heLop, tatCaMonHoc]);

  // ================= 🟢 BƯỚC 3: XỬ LÝ NÚT TÌM KIẾM ĐỂ CHUYỂN TRANG =================
  const handleSearch = () => {
    if (!heLop && !monHoc && !phuongXa) {
      alert("Vui lòng chọn ít nhất một tiêu chí!");
      return;
    }

    setIsSearching(true);

    // Gom dữ liệu thành Object (Chỉ lấy những trường có giá trị để URL sạch đẹp)
    const params = {};
    if (heLop) params.mahelop = heLop;
    if (monHoc) params.mamonhoc = monHoc;
    if (phuongXa) params.makhuvuc = phuongXa;

    console.log("👉 Dữ liệu chuẩn bị mang sang trang Tìm Môn Học:", params);

    // Chờ 0.5s cho mượt rồi chuyển trang (Hoặc ông có thể bỏ setTimeout đi cũng được)
    setTimeout(() => {
      setIsSearching(false);

      // Nếu có truyền onSearch từ Component cha thì gọi
      if (onSearch) {
        onSearch(params);
      } else {
        // 🟢 NẾU KHÔNG CÓ, TỰ ĐỘNG NHẢY SANG TRANG /tim-mon-hoc KÈM THEO THAM SỐ
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

        {/* HỆ LỚP */}
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

        {/* MÔN HỌC */}
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

        {/* KHU VỰC */}
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

        {/* NÚT SUBMIT */}
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
