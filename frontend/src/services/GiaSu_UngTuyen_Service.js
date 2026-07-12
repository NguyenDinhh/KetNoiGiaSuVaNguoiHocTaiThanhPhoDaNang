import { API_URL } from '../config/api.js';

const GiaSu_UngTuyen_Service = {
    layDanhSachUngTuyen: async () => {
        try {
            const phanHoi = await fetch(`${API_URL}/danhsachgiasuungtuyen`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API ứng tuyển gia sư!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại GiaSu_UngTuyen_Service.layDanhSachUngTuyen:", loi);
            throw loi;
        }
    },

    layChiTietUngTuyen: async (maUngTuyen) => {
        try {
            const phanHoi = await fetch(`${API_URL}/giasuungtuyen/${maUngTuyen}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy ứng tuyển!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại GiaSu_UngTuyen_Service.layChiTietUngTuyen:", loi);
            throw loi;
        }
    },

    themUngTuyenMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${API_URL}/themgiasuungtuyen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể tạo ứng tuyển mới!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_UngTuyen_Service.themUngTuyenMoi:", loi);
            throw loi;
        }
    },

    capNhatTrangThaiUngTuyen: async (maUngTuyen, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${API_URL}/suagiasuungtuyen/${maUngTuyen}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật trạng thái ứng tuyển!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_UngTuyen_Service.capNhatTrangThaiUngTuyen:", loi);
            throw loi;
        }
    },

    xoaUngTuyen: async (maUngTuyen) => {
        try {
            const phanHoi = await fetch(`${API_URL}/xoagiasuungtuyen/${maUngTuyen}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa ứng tuyển!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_UngTuyen_Service.xoaUngTuyen:", loi);
            throw loi;
        }
    }
};

export default GiaSu_UngTuyen_Service;
