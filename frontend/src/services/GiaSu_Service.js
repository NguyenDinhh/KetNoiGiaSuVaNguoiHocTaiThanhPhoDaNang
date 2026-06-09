const API_URL = 'http://localhost:8000'; // Port chạy FastAPI

const GiaSu_Service = {
  // 1. LẤY DANH SÁCH GIA SƯ (GET /danhsachgiasu)
  layDanhSachGiaSu: async () => {
    try {
      const response = await fetch(`${API_URL}/danhsachgiasu`);
      if (!response.ok) throw new Error("Lỗi kết nối API lấy danh sách gia sư!");

      const ketqua = await response.json();
      return ketqua.data; // Bóc lớp DataResponse lấy mảng dữ liệu
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.layDanhSachGiaSu:", error);
      throw error;
    }
  },

  // 2. TÌM 1 GIA SƯ THEO ID (GET /giasu/{id})
  layChiTietGiaSu: async (id) => {
    try {
      const response = await fetch(`${API_URL}/giasu/${id}`);
      const ketqua = await response.json();

      // Backend của ông trả về code="404" nếu không tìm thấy
      if (ketqua.code === "404") {
        throw new Error(ketqua.message || "Không tìm thấy gia sư này!");
      }

      return ketqua.data;
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.layChiTietGiaSu:", error);
      throw error;
    }
  },
  // 2. TÌM 1 GIA SƯ THEO ID (GET /giasu/{id})
  layChiTietGiaSuvoimanguoidung: async (id) => {
    try {
      const response = await fetch(`${API_URL}/giasuvoimanguoidung/${id}`);
      const ketqua = await response.json();

      // Backend của ông trả về code="404" nếu không tìm thấy
      if (ketqua.code === "404") {
        throw new Error(ketqua.message || "Không tìm thấy gia sư này!");
      }

      return ketqua.data;
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.layChiTietGiaSu:", error);
      throw error;
    }
  },
  // 3. THÊM MỚI GIA SƯ - Dùng cho form Đăng Ký (POST /themgiasu)
  themGiaSu: async (duLieuGiaSu) => {
    try {
      const response = await fetch(`${API_URL}/themgiasu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuGiaSu)
      });

      const ketqua = await response.json();
      if (ketqua.code === "400" || !response.ok) {
        throw new Error(ketqua.message || "Lỗi tạo hồ sơ gia sư!");
      }
      return ketqua;
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.themGiaSu:", error);
      throw error;
    }
  },

  // 4. SỬA THÔNG TIN GIA SƯ (PUT /suagiasu/{id})
  suaGiaSu: async (id, dataCapNhat) => {
    try {
      const response = await fetch(`${API_URL}/suagiasu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataCapNhat)
      });

      const ketqua = await response.json();
      if (ketqua.code === "404" || !response.ok) {
        throw new Error(ketqua.message || "Cập nhật hồ sơ gia sư thất bại!");
      }

      return ketqua;
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.suaGiaSu:", error);
      throw error;
    }
  },

  // 5. XÓA GIA SƯ (DELETE /xoagiasu/{id})
  xoaGiaSu: async (id) => {
    try {
      const response = await fetch(`${API_URL}/xoagiasu/${id}`, {
        method: 'DELETE'
      });

      const ketqua = await response.json();
      if (ketqua.code === "404" || !response.ok) {
        throw new Error(ketqua.message || "Xóa gia sư thất bại!");
      }

      return ketqua;
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.xoaGiaSu:", error);
      throw error;
    }
  }
};

export default GiaSu_Service;
