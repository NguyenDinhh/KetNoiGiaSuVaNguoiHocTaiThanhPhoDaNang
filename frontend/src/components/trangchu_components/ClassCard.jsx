import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import YeuCauTimGiaSu_Service from '../../services/YeuCauTimGiaSu_Service';
import MonHoc_Service from '../../services/MonHoc_Service';
import KhuVuc_Service from '../../services/KhuVuc_Service';
import GiaSu_UngTuyen_Service from '../../services/GiaSu_UngTuyen_Service';
import HeLop_Service from '../../services/HeLop_Service';

const ClassCard = () => {
  const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDanhSachLop = async () => {
      try {
        setLoading(true);
        const [yeucauRes, monhocRes, khuvucRes, ungtuyenRes, helopRes] = await Promise.all([
          YeuCauTimGiaSu_Service.layDanhSachYeuCau().catch(() => []),
          MonHoc_Service.layDanhSachMonHoc().catch(() => []),
          KhuVuc_Service.layDanhSachKhuVuc().catch(() => []),
          GiaSu_UngTuyen_Service.layDanhSachUngTuyen().catch(() => []),
          HeLop_Service.layDanhSachHeLop().catch(() => [])
        ]);

        const tatCaYeuCau = Array.isArray(yeucauRes) ? yeucauRes : (yeucauRes?.data || []);
        const tatCaMonHoc = Array.isArray(monhocRes) ? monhocRes : (monhocRes?.data || []);
        const tatCaKhuVuc = Array.isArray(khuvucRes) ? khuvucRes : (khuvucRes?.data || []);
        const tatCaUngTuyen = Array.isArray(ungtuyenRes) ? ungtuyenRes : (ungtuyenRes?.data || []);
        const tatCaHeLop = Array.isArray(helopRes) ? helopRes : (helopRes?.data || []);

        // ==========================================
        // QUY TRÌNH LỌC CHUẨN XÁC LẤY 3 LỚP
        // ==========================================

        // Bước 1: Chỉ lấy các lớp đang chờ tìm gia sư (trangthai === 0)
        let danhSachDaLoc = tatCaYeuCau.filter(yc => Number(yc.trangthai) === 0);

        // Bước 2: Lật ngược mảng (Để mấy lớp mới nhất ở cuối mảng trồi lên đầu)
        danhSachDaLoc = danhSachDaLoc.reverse();

        // Bước 3: Cắt cái "rụp" lấy đúng 3 lớp đầu tiên (Lúc này là 3 lớp mới nhất)
        let top3LopMoiNhat = danhSachDaLoc.slice(0, 3);

        // Bước 4: Mới bắt đầu nhét tên môn học, khu vực... vào cho 3 lớp này
        const lopHienThi = top3LopMoiNhat.map(yc => {
          const mon = tatCaMonHoc.find(m => Number(m.mamonhoc) === Number(yc.mamonhoc)) || {};
          const kv = tatCaKhuVuc.find(k => Number(k.makhuvuc) === Number(yc.makhuvuc)) || {};
          const hl = tatCaHeLop.find(h => Number(h.mahelop) === Number(yc.mahelop || mon.mahelop)) || {};

          const soLuongUngTuyen = tatCaUngTuyen.filter(ut => Number(ut.mayeucau) === Number(yc.mayeucau)).length;

          return {
            ...yc,
            tenmonhoc: mon.tenmonhoc || 'Đang cập nhật',
            tenkhuvuc: kv.tenkhuvuc || 'Toàn thành phố',
            tenhelop: hl.tenhelop || 'Đa dạng hệ lớp',
            soBuoi: yc.sobuoihoc || yc.sobuoi || 0,
            hocphi: yc.tonghocphi || yc.hocphi || 0,
            soLuongUngTuyen
          };
        });

        setDanhSachYeuCau(lopHienThi);

      } catch (error) {
        console.error("Lỗi khi tải danh sách lớp học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDanhSachLop();
  }, []);

  // --- HÀM XỬ LÝ BẤM NÚT ỨNG TUYỂN ---
  const handleUngTuyen = (maYeuCau) => {
    const userString = localStorage.getItem("thongTinUser");

    if (!userString) {
      const xacNhan = window.confirm("Bạn cần đăng nhập với tài khoản Gia sư để xem và ứng tuyển lớp này. Bạn có muốn chuyển đến trang Đăng nhập không?");
      if (xacNhan) {
        navigate('/dang-nhap');
      }
      return;
    }

    const userLocal = JSON.parse(userString);

    if (userLocal.role !== 'Gia sư' && Number(userLocal.vaitro) !== 3) {
      alert("⚠️ Tính năng ứng tuyển nhận lớp chỉ dành cho tài khoản Gia sư. Vui lòng đăng xuất và đăng nhập bằng tài khoản Gia sư hợp lệ!");
      return;
    }

    // Sửa đường dẫn này cho khớp với trang chi tiết của ông
    navigate(`/chi-tiet-lop/${maYeuCau}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#005088' }}>Đang tìm kiếm các lớp học mới nhất...</div>;
  }

  if (danhSachYeuCau.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Hiện chưa có lớp học nào đang tìm gia sư.</div>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
      {danhSachYeuCau.map((yc, index) => (
        <div className="class-card" key={yc.mayeucau || index}>
          <h3 className="class-title">{yc.tenmonhoc}</h3>

          <div className="class-details-text">
            <p><span>Hệ lớp:</span> {yc.tenhelop}</p>
            <p><span>Khu vực:</span> {yc.tenkhuvuc}</p>
            <p>
              <span>Số buổi học:</span>
              {yc.soBuoi > 0 ? ` ${yc.soBuoi} buổi` : ' Thỏa thuận'}
            </p>
            <p>
              <span>Học phí:</span>
              <span className="class-fee-highlight">
                {yc.hocphi > 0 ? ` ${Number(yc.hocphi).toLocaleString()} đ` : ' Thỏa thuận'}
              </span>
            </p>
          </div>

          <p className="class-applicants-count">
            {yc.soLuongUngTuyen > 0
              ? `${yc.soLuongUngTuyen} gia sư đã ứng tuyển`
              : 'Chưa có người ứng tuyển'
            }
          </p>

          <button
            className="btn-class-apply"
            onClick={() => handleUngTuyen(yc.mayeucau)}
          >
            Xem và ứng tuyển
          </button>
        </div>
      ))}
    </div>
  );
};

export default ClassCard;
