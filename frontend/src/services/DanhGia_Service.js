import { API_URL } from '../config/api.js';

const DanhGia_Service = {
    layDanhSachDanhGia: async () => {
        try {
            const phanHoi = await fetch(`${API_URL}/danhsachdanhgia`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API đánh giá!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại DanhGia_Service.layDanhSachDanhGia:", loi);
            throw loi;
        }
    },

    layChiTietDanhGia: async (maDanhGia) => {
        try {
            const phanHoi = await fetch(`${API_URL}/danhgia/${maDanhGia}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy đánh giá!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại DanhGia_Service.layChiTietDanhGia:", loi);
            throw loi;
        }
    },
    themDanhGiaMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${API_URL}/themdanhgia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm) 
            });
            if (!phanHoi.ok) {
                const loiData = await phanHoi.json();
                throw new Error(loiData.message || "Không thể thực hiện đánh giá!");
            }
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại DanhGia_Service.themDanhGiaMoi:", loi);
            throw loi;
        }
    },

    capNhatDanhGia: async (maDanhGia, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${API_URL}/suadanhgia/${maDanhGia}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi cập nhật đánh giá:", loi);
            throw loi;
        }
    },
    xoaDanhGia: async (maDanhGia) => {
        try {
            const phanHoi = await fetch(`${API_URL}/xoadanhgia/${maDanhGia}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa đánh giá!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại DanhGia_Service.xoaDanhGia:", loi);
            throw loi;
        }
    }
};

export default DanhGia_Service;
