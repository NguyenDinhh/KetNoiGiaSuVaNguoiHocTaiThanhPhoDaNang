const DIA_CHI_API = 'http://localhost:8000';

const ChiTietYeuCau_Service = {
    layDanhSachChiTietYeuCau: async () => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/danhsachchitietyeucau`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API chi tiết yêu cầu!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại ChiTietYeuCau_Service.layDanhSachChiTietYeuCau:", loi);
            throw loi;
        }
    },

    layChiTietYeuCau: async (maChiTietYeuCau) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/chitietyeucau/${maChiTietYeuCau}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy chi tiết yêu cầu!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại ChiTietYeuCau_Service.layChiTietYeuCau:", loi);
            throw loi;
        }
    },

    themChiTietYeuCauMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/themchitietyeucau`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm chi tiết yêu cầu!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại ChiTietYeuCau_Service.themChiTietYeuCauMoi:", loi);
            throw loi;
        }
    },

    capNhatChiTietYeuCau: async (maChiTietYeuCau, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/suachitietyeucau/${maChiTietYeuCau}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật chi tiết yêu cầu!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại ChiTietYeuCau_Service.capNhatChiTietYeuCau:", loi);
            throw loi;
        }
    },

    xoaChiTietYeuCau: async (maChiTietYeuCau) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/xoachitietyeucau/${maChiTietYeuCau}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa chi tiết yêu cầu!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại ChiTietYeuCau_Service.xoaChiTietYeuCau:", loi);
            throw loi;
        }
    }
};

export default ChiTietYeuCau_Service;
