import { API_URL } from '../config/api.js';

const GiaSu_BangCap_Service = {
    layDanhSachGiaSuBangCap: async () => {
        try {
            const phanHoi = await fetch(`${API_URL}/danhsachgiasubangcap`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API bằng cấp gia sư!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại GiaSu_BangCap_Service.layDanhSachGiaSuBangCap:", loi);
            throw loi;
        }
    },

    layChiTietGiaSuBangCap: async (maBangCapGiaSu) => {
        try {
            const phanHoi = await fetch(`${API_URL}/giasubangcap/${maBangCapGiaSu}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy bằng cấp gia sư!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại GiaSu_BangCap_Service.layChiTietGiaSuBangCap:", loi);
            throw loi;
        }
    },

    themGiaSuBangCapMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${API_URL}/themgiasubangcap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm bằng cấp gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_BangCap_Service.themGiaSuBangCapMoi:", loi);
            throw loi;
        }
    },

    capNhatGiaSuBangCap: async (maBangCapGiaSu, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${API_URL}/suagiasubangcap/${maBangCapGiaSu}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật bằng cấp gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_BangCap_Service.capNhatGiaSuBangCap:", loi);
            throw loi;
        }
    },

    xoaGiaSuBangCap: async (maBangCapGiaSu) => {
        try {
            const phanHoi = await fetch(`${API_URL}/xoagiasubangcap/${maBangCapGiaSu}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa bằng cấp gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_BangCap_Service.xoaGiaSuBangCap:", loi);
            throw loi;
        }
    }
};

export default GiaSu_BangCap_Service;
