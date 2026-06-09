const DIA_CHI_API = 'http://localhost:8000';

const KhungGio_GiaSu_MonHoc_Service = {
    layDanhSachKhungGio: async () => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/danhsachkhunggiogiasumonhoc`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API khung giờ!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại KhungGio_GiaSu_MonHoc_Service.layDanhSachKhungGio:", loi);
            throw loi;
        }
    },

    themKhungGioMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/themkhunggiogiasumonhoc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm khung giờ mới!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại KhungGio_GiaSu_MonHoc_Service.themKhungGioMoi:", loi);
            throw loi;
        }
    },

    // 🟢 HÀM MỚI: SỬA KHUNG GIỜ
    suaKhungGio: async (maKhungGio, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/suakhunggiogiasumonhoc/${maKhungGio}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật khung giờ!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại KhungGio_GiaSu_MonHoc_Service.suaKhungGio:", loi);
            throw loi;
        }
    },

    khoaKhungGio: async (maKhungGio) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/khoakhunggiogiasumonhoc/${maKhungGio}`, {
                method: 'PUT'
            });
            if (!phanHoi.ok) throw new Error("Không thể khóa khung giờ!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại KhungGio_GiaSu_MonHoc_Service.khoaKhungGio:", loi);
            throw loi;
        }
    }
};

export default KhungGio_GiaSu_MonHoc_Service;
