const DIA_CHI_API = 'http://localhost:8000';

const BangCap_Service = {
  layDanhSachBangCap: async () => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/danhsachbangcap`);
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
      const phanHoi = await fetch(`${DIA_CHI_API}/danhsachbangcap`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API!");
      const ketQua = await phanHoi.json();
      return { tongSo: ketQua.data.length };
    } catch (loi) {
      throw loi;
    }
  },

  themBangCapMoi: async (duLieuForm) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/thembangcap`, {
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
      const phanHoi = await fetch(`${DIA_CHI_API}/suabangcap/${maBangCap}`, {
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
      const phanHoi = await fetch(`${DIA_CHI_API}/xoabangcap/${maBangCap}`, {
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
      const phanHoi = await fetch(`${DIA_CHI_API}/khoabangcap/${maBangCap}`, {
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
      const phanHoi = await fetch(`${DIA_CHI_API}/mokhoabangcap/${maBangCap}`, {
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
