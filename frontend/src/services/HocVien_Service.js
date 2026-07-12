import { API_URL } from '../config/api.js';

const HocVien_Service = {
    layDanhSachHocVien: async () => {
        try {
            const phanHoi = await fetch(`${API_URL}/danhsachhocvien`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API học viên!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.layDanhSachHocVien:", loi);
            throw loi;
        }
    },

    layChiTietHocVien: async (maHocVien) => {
        try {
            const phanHoi = await fetch(`${API_URL}/hocvien/${maHocVien}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy học viên!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.layChiTietHocVien:", loi);
            throw loi;
        }
    },

    themHocVienMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${API_URL}/themhocvien`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm học viên mới!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.themHocVienMoi:", loi);
            throw loi;
        }
    },

    capNhatHocVien: async (maHocVien, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${API_URL}/suahocvien/${maHocVien}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật thông tin học viên!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.capNhatHocVien:", loi);
            throw loi;
        }
    },

    xoaHocVien: async (maHocVien) => {
        try {
            const phanHoi = await fetch(`${API_URL}/xoahocvien/${maHocVien}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa học viên!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.xoaHocVien:", loi);
            throw loi;
        }
    },

    khoaHocVien: async (maHocVien) => {
        try {
            const phanHoi = await fetch(`${API_URL}/khoahocvien/${maHocVien}`, {
                method: 'PUT'
            });
            if (!phanHoi.ok) {
                const error = await phanHoi.json();
                throw new Error(error.message || "Không thể khóa học viên!");
            }
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.khoaHocVien:", loi);
            throw loi;
        }
    },

    moKhoaHocVien: async (maHocVien) => {
        try {
            const phanHoi = await fetch(`${API_URL}/mokhoahocvien/${maHocVien}`, {
                method: 'PUT'
            });
            if (!phanHoi.ok) {
                const error = await phanHoi.json();
                throw new Error(error.message || "Không thể mở khóa học viên!");
            }
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.moKhoaHocVien:", loi);
            throw loi;
        }
    }
};

export default HocVien_Service;
