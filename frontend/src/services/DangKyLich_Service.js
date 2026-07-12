import { API_URL } from '../config/api.js';

const DangKyLich_Service = {
    layDanhSachDangKyLich: async () => {
        try {
            const phanHoi = await fetch(`${API_URL}/danhsachdangkylich`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API đăng ký lịch!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại DangKyLich_Service.layDanhSachDangKyLich:", loi);
            throw loi;
        }
    },

    layChiTietDangKyLich: async (maDangKy) => {
        try {
            const phanHoi = await fetch(`${API_URL}/dangkylich/${maDangKy}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy đăng ký lịch!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại DangKyLich_Service.layChiTietDangKyLich:", loi);
            throw loi;
        }
    },

    themDangKyLichMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${API_URL}/themdangkylich`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể tạo đăng ký lịch mới!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại DangKyLich_Service.themDangKyLichMoi:", loi);
            throw loi;
        }
    },

    capNhatDangKyLich: async (maDangKy, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${API_URL}/suadangkylich/${maDangKy}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật đăng ký lịch!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại DangKyLich_Service.capNhatDangKyLich:", loi);
            throw loi;
        }
    },

    xoaDangKyLich: async (maDangKy) => {
        try {
            const phanHoi = await fetch(`${API_URL}/xoadangkylich/${maDangKy}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa đăng ký lịch!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại DangKyLich_Service.xoaDangKyLich:", loi);
            throw loi;
        }
    }
};

export default DangKyLich_Service;
