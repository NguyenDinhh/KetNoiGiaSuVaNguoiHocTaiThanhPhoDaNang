import { API_URL } from '../config/api.js';

const KhuVuc_Service = {
  layDanhSachKhuVuc: async () => {
    try {
      const phanHoi = await fetch(`${API_URL}/danhsachkhuvuc`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API khu vực!");
      const ketQua = await phanHoi.json();
      return ketQua.data;
    } catch (loi) {
      console.error("Lỗi tại KhuVuc_Service.layDanhSachKhuVuc:", loi);
      throw loi;
    }
  },

  layThongKeKhuVuc: async () => {
    try {
      const phanHoi = await fetch(`${API_URL}/danhsachkhuvuc`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API!");
      const ketQua = await phanHoi.json();
      return { tongSo: ketQua.data.length }; 
    } catch (loi) {
      throw loi;
    }
  },

  themKhuVucMoi: async (duLieuForm) => {
    try {
      const phanHoi = await fetch(`${API_URL}/themkhuvuc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuForm)
      });
      if (!phanHoi.ok) throw new Error("Không thể thêm khu vực mới!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại KhuVuc_Service.themKhuVucMoi:", loi);
      throw loi;
    }
  },

  capNhatKhuVuc: async (maKhuVuc, duLieuSua) => {
    try {
      const phanHoi = await fetch(`${API_URL}/suakhuvuc/${maKhuVuc}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuSua)
      });
      if (!phanHoi.ok) throw new Error("Không thể cập nhật thông tin khu vực!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại KhuVuc_Service.capNhatKhuVuc:", loi);
      throw loi;
    }
  },

  xoaKhuVuc: async (maKhuVuc) => {
    try {
      const phanHoi = await fetch(`${API_URL}/xoakhuvuc/${maKhuVuc}`, {
        method: 'DELETE'
      });
      if (!phanHoi.ok) throw new Error("Không thể xóa khu vực!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại KhuVuc_Service.xoaKhuVuc:", loi);
      throw loi;
    }
  },

  khoaKhuVuc: async (maKhuVuc) => {
    try {
      const phanHoi = await fetch(`${API_URL}/khoakhuvuc/${maKhuVuc}`, {
        method: 'PUT'
      });
      if (!phanHoi.ok) throw new Error("Không thể khóa khu vực!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại KhuVuc_Service.khoaKhuVuc:", loi);
      throw loi;
    }
  },

  moKhoaKhuVuc: async (maKhuVuc) => {
    try {
      const phanHoi = await fetch(`${API_URL}/mokhoakhuvuc/${maKhuVuc}`, {
        method: 'PUT'
      });
      if (!phanHoi.ok) throw new Error("Không thể mở khóa khu vực!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại KhuVuc_Service.moKhoaKhuVuc:", loi);
      throw loi;
    }
  }
};

export default KhuVuc_Service;
