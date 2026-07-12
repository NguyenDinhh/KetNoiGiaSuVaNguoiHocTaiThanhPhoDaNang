import { API_URL } from '../config/api.js';

const BangCap_Service = {
  layDanhSachBangCap: async () => {
    try {
      const phanHoi = await fetch(`${API_URL}/danhsachbangcap`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API bằng cấp!");
      const ketQua = await phanHoi.json();
      return ketQua.data;
    } catch (loi) {
      console.error("Lỗi tại BangCap_Service.layDanhSachBangCap:", loi);
      throw loi;
    }
  },

  layThongKeBangCap: async () => {
    try {
      const phanHoi = await fetch(`${API_URL}/danhsachbangcap`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API!");
      const ketQua = await phanHoi.json();
      return { tongSo: ketQua.data.length };
    } catch (loi) {
      throw loi;
    }
  },

  themBangCapMoi: async (duLieuForm) => {
    try {
      const phanHoi = await fetch(`${API_URL}/thembangcap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuForm)
      });
      if (!phanHoi.ok) throw new Error("Không thể thêm bằng cấp mới!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại BangCap_Service.themBangCapMoi:", loi);
      throw loi;
    }
  },

  capNhatBangCap: async (maBangCap, duLieuSua) => {
    try {
      const phanHoi = await fetch(`${API_URL}/suabangcap/${maBangCap}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuSua)
      });
      if (!phanHoi.ok) throw new Error("Không thể cập nhật thông tin bằng cấp!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại BangCap_Service.capNhatBangCap:", loi);
      throw loi;
    }
  },

  xoaBangCap: async (maBangCap) => {
    try {
      const phanHoi = await fetch(`${API_URL}/xoabangcap/${maBangCap}`, {
        method: 'DELETE'
      });
      if (!phanHoi.ok) throw new Error("Không thể xóa bằng cấp!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại BangCap_Service.xoaBangCap:", loi);
      throw loi;
    }
  },

  khoaBangCap: async (maBangCap) => {
    try {
      const phanHoi = await fetch(`${API_URL}/khoabangcap/${maBangCap}`, {
        method: 'PUT'
      });
      if (!phanHoi.ok) throw new Error("Không thể khóa bằng cấp!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại BangCap_Service.khoaBangCap:", loi);
      throw loi;
    }
  },

  moKhoaBangCap: async (maBangCap) => {
    try {
      const phanHoi = await fetch(`${API_URL}/mokhoabangcap/${maBangCap}`, {
        method: 'PUT'
      });
      if (!phanHoi.ok) throw new Error("Không thể mở khóa bằng cấp!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại BangCap_Service.moKhoaBangCap:", loi);
      throw loi;
    }
  }
  
};

export default BangCap_Service;
