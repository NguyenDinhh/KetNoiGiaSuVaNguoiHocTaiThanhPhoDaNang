const API_URL = 'http://localhost:8000'; // Port chạy FastAPI

const NguoiDung_Service = {
  // 1. LẤY DANH SÁCH NGƯỜI DÙNG
  layDanhSachNguoiDung: async () => {
    try {
      const response = await fetch(`${API_URL}/danhsachnguoidung`);
      if (!response.ok) throw new Error("Lỗi kết nối API hệ thống!");

      const ketqua = await response.json();
      const danhsachRaw = ketqua.data;

      // Chuyển đổi dữ liệu cho dễ nhìn trên UI
      const danhsachDaSua = danhsachRaw.map(nguoidung => {
        let tenVaitro = "Chưa xác định";
        if (nguoidung.vaitro === 0) tenVaitro = "Quản trị viên";
        else if (nguoidung.vaitro === 1) tenVaitro = "Gia sư";
        else if (nguoidung.vaitro === 2) tenVaitro = "Người học";

        const kyTuAvatar = nguoidung.hoten ? nguoidung.hoten.charAt(0).toUpperCase() : 'U';

        return {
          id: nguoidung.manguoidung,
          name: nguoidung.hoten,
          avatar: nguoidung.anhdaidien || kyTuAvatar,
          role: tenVaitro,
          phone: nguoidung.sodienthoai,
          email: nguoidung.email,
          date: "N/A",
          status: nguoidung.trangthai !== undefined ? nguoidung.trangthai : 1
        };
      });

      return danhsachDaSua;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.layDanhSachNguoiDung:", error);
      throw error;
    }
  },

  // 2. THỐNG KÊ NGƯỜI DÙNG
  layThongKeNguoiDung: async () => {
    try {
      const response = await fetch(`${API_URL}/danhsachnguoidung`);
      if (!response.ok) throw new Error("Lỗi kết nối API thống kê!");

      const ketqua = await response.json();
      const danhsachRaw = ketqua.data;

      const thongke = {
        tongSo: danhsachRaw.length,
        quanTriVien: 0,
        giaSu: 0,
        nguoiHoc: 0
      };

      danhsachRaw.forEach(nguoidung => {
        if (nguoidung.vaitro === 0) thongke.quanTriVien += 1;
        else if (nguoidung.vaitro === 1) thongke.giaSu += 1;
        else if (nguoidung.vaitro === 2) thongke.nguoiHoc += 1;
      });

      return thongke;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.layThongKeNguoiDung:", error);
      throw error;
    }
  },

  // 3. ĐĂNG KÝ NGƯỜI DÙNG MỚI (BỔ SUNG)
  dangKyNguoiDung: async (duLieuDangKy) => {
    try {
      const response = await fetch(`${API_URL}/dangky`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuDangKy)
      });

      const ketqua = await response.json();

      // Check code 200 từ hàm DataResponse.custom_response của Backend
      if (ketqua.code !== "200") {
        throw new Error(ketqua.message || "Đăng ký thất bại!");
      }
      return ketqua;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.dangKyNguoiDung:", error);
      throw error;
    }
  },

  // 4. KHÓA / MỞ KHÓA NGƯỜI DÙNG (PATCH)
  khoaMoKhoaNguoiDung: async (id) => {
    try {
      const response = await fetch(`${API_URL}/khoanguoidung/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error("Không thể khóa/mở khóa người dùng này!");

      const ketqua = await response.json();
      return ketqua;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.khoaMoKhoaNguoiDung:", error);
      throw error;
    }
  },

  // 5. LẤY CHI TIẾT 1 NGƯỜI DÙNG
  layChiTietNguoiDung: async (id) => {
    try {
      const response = await fetch(`${API_URL}/nguoidung/${id}`);
      if (!response.ok) throw new Error("Không tìm thấy người dùng!");

      const ketqua = await response.json();
      return ketqua.data;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.layChiTietNguoiDung:", error);
      throw error;
    }
  },

  // 6. CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (PUT)
  capNhatNguoiDung: async (id, dataCapNhat) => {
    try {
      const response = await fetch(`${API_URL}/suanguoidung/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataCapNhat)
      });
      if (!response.ok) throw new Error("Cập nhật thất bại!");

      const ketqua = await response.json();
      return ketqua;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.capNhatNguoiDung:", error);
      throw error;
    }
  },
// ... (các hàm cũ như dangKyNguoiDung vẫn giữ nguyên)

  // THÊM HÀM NÀY VÀO
  dangNhap: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/dangnhap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, matkhau: password })
      });

      const ketqua = await response.json();

      // Nếu Backend trả về lỗi (401 - Sai pass, 404 - Không thấy tài khoản...)
      if (ketqua.code !== "200" && ketqua.code !== 200) {
        throw new Error(ketqua.message || "Đăng nhập thất bại!");
      }

      return ketqua.data;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.dangNhap:", error);
      throw error;
    }
  },
xoaNguoiDung: async (id) => {
    try {
      const response = await fetch(`${API_URL}/xoanguoidung/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Không thể xóa người dùng!");

      const ketqua = await response.json();
      return ketqua;
    } catch (error) {
      console.error("Lỗi tại NguoiDung_Service.xoaNguoiDung:", error);
      throw error;
    }
  },
};
export default NguoiDung_Service;
