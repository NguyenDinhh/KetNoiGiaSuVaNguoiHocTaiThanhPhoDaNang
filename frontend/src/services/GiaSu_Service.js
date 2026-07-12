import { API_URL } from '../config/api.js';

const GiaSu_Service = {
  
  layDanhSachGiaSu: async () => {
    try {
      const response = await fetch(`${API_URL}/danhsachgiasu`);
      if (!response.ok) throw new Error("Lỗi kết nối API lấy danh sách gia sư!");

      const ketqua = await response.json();
      return ketqua.data; 
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.layDanhSachGiaSu:", error);
      throw error;
    }
  },

  
  layChiTietGiaSu: async (id) => {
    try {
      const response = await fetch(`${API_URL}/giasu/${id}`);
      const ketqua = await response.json();

      
      if (ketqua.code === "404") {
        throw new Error(ketqua.message || "Không tìm thấy gia sư này!");
      }

      return ketqua.data;
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.layChiTietGiaSu:", error);
      throw error;
    }
  },
  
  layChiTietGiaSuvoimanguoidung: async (id) => {
    try {
      const response = await fetch(`${API_URL}/giasuvoimanguoidung/${id}`);
      const ketqua = await response.json();

      
      if (ketqua.code === "404") {
        throw new Error(ketqua.message || "Không tìm thấy gia sư này!");
      }

      return ketqua.data;
    } catch (error) {
      console.error("Lỗi tại GiaSu_Service.layChiTietGiaSu:", error);
      throw error;
    }
  },
  
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
