const DIA_CHI_API = 'http://localhost:8000';

const BangCap_MonHoc_Service = {
  layDanhSach: async () => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/danhsachbangcapmonhoc`);
      if (!phanHoi.ok) throw new Error("Lỗi lấy danh sách tiêu chuẩn!");
      const ketQua = await phanHoi.json();
      return ketQua.data;
    } catch (loi) {
      console.error(loi);
      throw loi;
    }
  },

  ganMonHoc: async (duLieuGan) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/thembangcapmonhoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuGan)
      });
      if (!phanHoi.ok) throw new Error("Lỗi gán môn học!");
      return await phanHoi.json();
    } catch (loi) {
      console.error(loi);
      throw loi;
    }
  },

  huyMonHoc: async (maBangCap_MonHoc) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/xoabangcapmonhoc/${maBangCap_MonHoc}`, {
        method: 'DELETE'
      });
      if (!phanHoi.ok) throw new Error("Lỗi hủy môn học!");
      return await phanHoi.json();
    } catch (loi) {
      console.error(loi);
      throw loi;
    }
  }
};

export default BangCap_MonHoc_Service;
