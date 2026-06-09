const DIA_CHI_API = 'http://localhost:8000';

const HeLop_Service = {
  layDanhSachHeLop: async () => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/danhsachhelop`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API hệ lớp!");
      const ketQua = await phanHoi.json();
      return ketQua.data;
    } catch (loi) {
      console.error("Lỗi tại HeLop_Service.layDanhSachHeLop:", loi);
      throw loi;
    }
  },

  layThongKeHeLop: async () => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/danhsachhelop`);
      if (!phanHoi.ok) throw new Error("Lỗi kết nối API!");
      const ketQua = await phanHoi.json();
      const danhSachGoc = ketQua.data;

      const thongKe = {
        tongSo: danhSachGoc.length,
        dangHoatDong: 0,
        dangTamNgung: 0
      };

      danhSachGoc.forEach(heLop => {
        if (heLop.trangthai === 1) thongKe.dangHoatDong += 1;
        else thongKe.dangTamNgung += 1;
      });

      return thongKe;
    } catch (loi) {
      throw loi;
    }
  },

  themHeLopMoi: async (duLieuForm) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/themhelop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duLieuForm)
      });

      if (!phanHoi.ok) throw new Error("Không thể thêm hệ lớp mới lên máy chủ!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại HeLop_Service.themHeLopMoi:", loi);
      throw loi;
    }
  },

  capNhatHeLop: async (maHeLop, duLieuSua) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/suahelop/${maHeLop}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuSua)
      });
      if (!phanHoi.ok) throw new Error("Không thể cập nhật thông tin hệ lớp!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại HeLop_Service.capNhatHeLop:", loi);
      throw loi;
    }
  }
};

export default HeLop_Service;
