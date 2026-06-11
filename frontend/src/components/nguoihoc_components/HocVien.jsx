import { useState, useEffect } from 'react';
import '../../assets/css/NguoiHoc.css';
import HocVien_Service from '../../services/HocVien_Service';

const HocVien = () => {
  const [danhSachHocVien, setDanhSachHocVien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHocVien, setEditingHocVien] = useState(null);

  // Khởi tạo biểu mẫu theo đúng cấu trúc dữ liệu Pydantic Schema
  const [formInput, setFormInput] = useState({
    tenhocvien: '',
    namsinh: '',
    hocluc: '',
    diachi: '',
    ghichu: ''
  });

  // Lấy mã người dùng đang đăng nhập từ hệ thống lưu trữ local
  const userLocal = localStorage.getItem("thongTinUser");
  const currentUserId = userLocal ? JSON.parse(userLocal).manguoidung : null;

  useEffect(() => {
    taiDanhSachHocVienActive();
  }, []);

  // Hàm tải dữ liệu và lọc điều kiện hiển thị học viên chưa bị khóa
  const taiDanhSachHocVienActive = async () => {
    try {
      setLoading(true);
      const data = await HocVien_Service.layDanhSachHocVien();
      const tatCaHocVien = Array.isArray(data) ? data : [];

      // LỌC CHỈ LẤY:
      // 1. Học viên thuộc về tài khoản này (manguoidung)
      // 2. Học viên KHÔNG BỊ KHÓA (trangthai !== 0)
      const activeStudents = tatCaHocVien.filter(hv =>
        Number(hv.manguoidung) === Number(currentUserId) &&
        hv.trangthai !== 0
      );

      setDanhSachHocVien(activeStudents);
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu danh sách học viên:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput(prev => ({
      ...prev,
      [name]: name === 'namsinh' ? Number(value) : value
    }));
  };

  const handleOpenModalThemMoi = () => {
    if (danhSachHocVien.length >= 3) {
      alert("Mỗi tài khoản chỉ được phép quản lý tối đa 3 học viên hoạt động cùng lúc!");
      return;
    }
    setEditingHocVien(null);
    setFormInput({ tenhocvien: '', namsinh: '', hocluc: '', diachi: '', ghichu: '' });
    setIsModalOpen(true);
  };

  const handleOpenModalSua = (hv) => {
    setEditingHocVien(hv);
    setFormInput({
      tenhocvien: hv.tenhocvien || '',
      namsinh: hv.namsinh || '',
      hocluc: hv.hocluc || '',
      diachi: hv.diachi || '',
      ghichu: hv.ghichu || ''
    });
    setIsModalOpen(true);
  };

  // Luồng xử lý lưu thông tin biểu mẫu (Thêm / Sửa)
  const handleSaveHocVien = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;

    setSubmitting(true);
    try {
      if (editingHocVien) {
        // LUỒNG CẬP NHẬT (SỬA)
        const payloadSua = {
          manguoidung: Number(currentUserId),
          tenhocvien: formInput.tenhocvien,
          namsinh: Number(formInput.namsinh),
          hocluc: formInput.hocluc,
          diachi: formInput.diachi,
          ghichu: formInput.ghichu
        };
        await HocVien_Service.capNhatHocVien(editingHocVien.mahocvien, payloadSua);
        alert("Cập nhật thông tin học viên thành công!");
      } else {
        // LUỒNG THÊM MỚI (Kiểm tra chốt chặn số lượng hoạt động một lần nữa trước khi gửi)
        if (danhSachHocVien.length >= 3) {
          throw new Error("Không thể thêm! Giới hạn tối đa 3 học viên đang hoạt động.");
        }

        const payloadThem = {
          manguoidung: Number(currentUserId),
          tenhocvien: formInput.tenhocvien,
          namsinh: Number(formInput.namsinh),
          hocluc: formInput.hocluc,
          diachi: formInput.diachi,
          ghichu: formInput.ghichu
        };
        await HocVien_Service.themHocVienMoi(payloadThem);
        alert("Thêm học viên mới thành công!");
      }
      setIsModalOpen(false);
      taiDanhSachHocVienActive();
    } catch (error) {
      alert(error.message || "Xảy ra lỗi trong quá trình lưu dữ liệu!");
    } finally {
      setSubmitting(false);
    }
  };

  // Luồng xử lý Khóa học viên (Xóa mềm - thay đổi trạng thái hoạt động)
  const handleLockHocVien = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn khóa học viên [ ${name} ] không?\nHọc viên bị khóa sẽ không thể sử dụng để đăng ký tìm gia sư.`)) {
      try {
        await HocVien_Service.xoaHocVien(id);
        alert("Đã khóa trạng thái hồ sơ học viên thành công!");
        taiDanhSachHocVienActive();
      } catch (error) {
        alert("Khóa hồ sơ học viên thất bại!");
      }
    }
  };

  if (loading) {
    return <div className="dkl-loading-message">Đang tải danh sách học viên...</div>;
  }

  const datGioiHanBaNguoi = danhSachHocVien.length >= 3;

  return (
    <div className="nh-hv-card">
      <div className="nh-hv-header">
        <div className="nh-hv-title-group">
          <h2>Quản lý Học viên</h2>
          <p>Danh sách các học viên liên kết quản lý bởi tài khoản của bạn (Tối đa 3 học viên hoạt động).</p>
        </div>

        {/* Nút thêm mới tự động ẩn/khóa thuộc tính khi đạt giới hạn 3 người */}
        <button
          type="button"
          className="btn-nh-submit hv-btn-add"
          onClick={handleOpenModalThemMoi}
          disabled={datGioiHanBaNguoi}
        >
          <span className="material-symbols-outlined">add</span> Thêm học viên mới
        </button>
      </div>

      {/* Hiển thị cảnh báo trực quan khi chạm ngưỡng giới hạn 3 người */}
      {datGioiHanBaNguoi && (
        <div className="nh-hv-limit-warning">
          ⚠️ <strong>Thông báo:</strong> Bạn đã cấu hình đủ số lượng tối đa 3 học viên đang hoạt động. Để thêm học viên mới, vui lòng tiến hành "Khóa" bớt hồ sơ không còn nhu cầu học tập phía bên dưới hệ thống.
        </div>
      )}

      {/* BẢNG DỮ LIỆU */}
      <div className="nh-hv-table-responsive">
        {danhSachHocVien.length === 0 ? (
          <div className="dkl-empty-state">
            Hệ thống chưa ghi nhận hồ sơ học viên nào đang hoạt động dưới tài khoản này.
          </div>
        ) : (
          <table className="nh-hv-table">
            <thead>
              <tr>
                <th>Tên học viên</th>
                <th>Năm sinh</th>
                <th>Học lực</th>
                <th>Địa chỉ cư trú</th>
                <th>Ghi chú đặc điểm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachHocVien.map((hv) => (
                <tr key={hv.mahocvien}>
                  <td className="hv-name-cell">{hv.tenhocvien}</td>
                  <td>{hv.namsinh}</td>
                  <td><span className="nh-badge-hocluc">{hv.hocluc}</span></td>
                  <td className="hv-address-cell">{hv.diachi}</td>
                  <td className="hv-note-cell">{hv.ghichu || '---'}</td>
                  <td>
                    <div className="nh-hv-actions">
                      <button
                        type="button"
                        className="btn-hv-action-edit"
                        onClick={() => handleOpenModalSua(hv)}
                        title="Sửa thông tin học viên"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-hv-action-lock"
                        onClick={() => handleLockHocVien(hv.mahocvien, hv.tenhocvien)}
                        title="Khóa học viên"
                      >
                        <span className="material-symbols-outlined">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* HỘP THOẠI MODAL THÊM / SỬA HỌC VIÊN */}
      {isModalOpen && (
        <div className="nh-hv-modal-overlay">
          <div className="nh-hv-modal-content">
            <div className="nh-hv-modal-header">
              <h3>{editingHocVien ? 'Cập nhật hồ sơ học viên' : 'Đăng ký học viên mới'}</h3>
              <button type="button" className="nh-hv-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveHocVien}>
              <div className="nh-hv-modal-body">
                <div className="nh-form-group">
                  <label className="nh-form-label">Tên học viên</label>
                  <input
                    type="text"
                    name="tenhocvien"
                    value={formInput.tenhocvien}
                    onChange={handleInputChange}
                    required
                    className="nh-input"
                    placeholder="Nhập họ tên học viên"
                  />
                </div>

                <div className="nh-form-group">
                  <label className="nh-form-label">Năm sinh</label>
                  <input
                    type="number"
                    name="namsinh"
                    value={formInput.namsinh}
                    onChange={handleInputChange}
                    required
                    className="nh-input"
                    placeholder="VD: 2012"
                  />
                </div>

                <div className="nh-form-group">
                  <label className="nh-form-label">Học lực hiện tại</label>
                  <input
                    type="text"
                    name="hocluc"
                    value={formInput.hocluc}
                    onChange={handleInputChange}
                    required
                    className="nh-input"
                    placeholder="VD: Giỏi, Khá, Trung bình..."
                  />
                </div>

                <div className="nh-form-group">
                  <label className="nh-form-label">Địa chỉ cư trú (Quận/Huyện)</label>
                  <input
                    type="text"
                    name="diachi"
                    value={formInput.diachi}
                    onChange={handleInputChange}
                    required
                    className="nh-input"
                    placeholder="VD: Liên Chiểu, Đà Nẵng"
                  />
                </div>

                <div className="nh-form-group hv-last-form-group">
                  <label className="nh-form-label">Ghi chú yêu cầu học tập (Nếu có)</label>
                  <textarea
                    name="ghichu"
                    value={formInput.ghichu}
                    onChange={handleInputChange}
                    className="nh-input"
                    rows="3"
                    placeholder="Mô tả tình hình học tập hoặc tính cách học viên..."
                  />
                </div>
              </div>

              <div className="nh-hv-modal-footer">
                <button type="button" className="btn-nh-outline hv-modal-btn" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-nh-submit hv-modal-btn" disabled={submitting}>
                  {submitting ? 'Đang lưu kết nối...' : 'Lưu hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HocVien;
