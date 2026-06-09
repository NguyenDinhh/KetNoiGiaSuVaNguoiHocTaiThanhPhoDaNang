const DIA_CHI_API = 'http://localhost:8000';

const ChiTietDangKyLich_Service = {
    layDanhSachChiTietDangKyLich: async () => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/danhsachchitietdangkylich`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API chi tiết đăng ký lịch!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại ChiTietDangKyLich_Service.layDanhSachChiTietDangKyLich:", loi);
            throw loi;
        }
    },

    layChiTietDangKyLich: async (maChiTietDangKy) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/chitietdangkylich/${maChiTietDangKy}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy chi tiết đăng ký lịch!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại ChiTietDangKyLich_Service.layChiTietDangKyLich:", loi);
            throw loi;
        }
    },

    themChiTietDangKyLichMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/themchitietdangkylich`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm chi tiết đăng ký lịch!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại ChiTietDangKyLich_Service.themChiTietDangKyLichMoi:", loi);
            throw loi;
        }
    },

    capNhatChiTietDangKyLich: async (maChiTietDangKy, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/suachitietdangkylich/${maChiTietDangKy}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật chi tiết đăng ký lịch!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại ChiTietDangKyLich_Service.capNhatChiTietDangKyLich:", loi);
            throw loi;
        }
    },

    xoaChiTietDangKyLich: async (maChiTietDangKy) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/xoachitietdangkylich/${maChiTietDangKy}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa chi tiết đăng ký lịch!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại ChiTietDangKyLich_Service.xoaChiTietDangKyLich:", loi);
            throw loi;
        }
    }
};

export default ChiTietDangKyLich_Service;
