const DIA_CHI_API = 'http://localhost:8000';

const MonHoc_Service = {
  
  layDanhSachMonHoc: async () => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/danhsachmonhoc`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API môn học!");
      const ketQua = await phanHoi.json();
      return ketQua.data;
    } catch (loi) {
      console.error("Lỗi tại MonHoc_Service.layDanhSachMonHoc:", loi);
      throw loi;
    }
  },

  
  layThongKeMonHoc: async () => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/danhsachmonhoc`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API!");
      const ketQua = await phanHoi.json();
      const danhSachGoc = ketQua.data;

      const thongKe = {
        tongSo: danhSachGoc.length,
        dangHoatDong: 0,
        dangTamNgung: 0
      };

      danhSachGoc.forEach(monHoc => {
        if (monHoc.trangthai === 1) thongKe.dangHoatDong += 1;
        else thongKe.dangTamNgung += 1;
      });

      return thongKe;
    } catch (loi) {
      throw loi;
    }
  },
  
  layMonHocTheoLop: async (mahelop) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/monhoc/theolop/${mahelop}`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API môn học theo lớp!");

      const ketQua = await phanHoi.json();
      return ketQua.data || []; 
    } catch (loi) {
      console.error("Lỗi tại MonHoc_Service.layMonHocTheoLop:", loi);
      return []; 
    }
  },
  
  themMonHocMoi: async (duLieuForm) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/themmonhoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuForm)
      });
      if (!phanHoi.ok) throw new Error("Không thể thêm môn học mới!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại MonHoc_Service.themMonHocMoi:", loi);
      throw loi;
    }
  },

  
  capNhatMonHoc: async (maMonHoc, duLieuSua) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/suamonhoc/${maMonHoc}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuSua)
      });
      if (!phanHoi.ok) throw new Error("Không thể cập nhật thông tin môn học!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại MonHoc_Service.capNhatMonHoc:", loi);
      throw loi;
    }
  },

  xoaMonHoc: async (maMonHoc) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/xoamonhoc/${maMonHoc}`, {
        method: 'DELETE'
      });
      if (!phanHoi.ok) throw new Error("Không thể xóa môn học!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại MonHoc_Service.xoaMonHoc:", loi);
      throw loi;
    }
  }
};

export default MonHoc_Service;
