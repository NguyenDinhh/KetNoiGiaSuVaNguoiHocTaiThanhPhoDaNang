const DIA_CHI_API = 'http://localhost:8000';

const YeuCauTimGiaSu_Service = {
    layDanhSachYeuCau: async () => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/danhsachyeucautimgiasu`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API yêu cầu tìm gia sư!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại YeuCauTimGiaSu_Service.layDanhSachYeuCau:", loi);
            throw loi;
        }
    },

    layChiTietYeuCau: async (maYeuCau) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/yeucautimgiasu/${maYeuCau}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy yêu cầu!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại YeuCauTimGiaSu_Service.layChiTietYeuCau:", loi);
            throw loi;
        }
    },

    taoYeuCauMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/themyeucautimgiasu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể tạo yêu cầu tìm gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại YeuCauTimGiaSu_Service.themYeuCauMoi:", loi);
            throw loi;
        }
    },

    capNhatYeuCau: async (maYeuCau, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/suayeucautimgiasu/${maYeuCau}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật yêu cầu!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại YeuCauTimGiaSu_Service.capNhatYeuCau:", loi);
            throw loi;
        }
    },
    capNhatTrangThaiYeuCau: async (maYeuCau, trangThaiMoi) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/capnhattrangthaiyeucau/${maYeuCau}`, {
                method: 'PATCH', // Lưu ý dùng PATCH cho khớp với Router
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangthai: trangThaiMoi }) // Chỉ gửi đúng 1 biến
            });

            if (!phanHoi.ok) {
                const loiChiTiet = await phanHoi.json();
                console.error("Lỗi từ Backend:", loiChiTiet);
                throw new Error("Không thể cập nhật trạng thái yêu cầu!");
            }

            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại YeuCauTimGiaSu_Service.capNhatTrangThaiYeuCau:", loi);
            throw loi;
        }
    },
    xoaYeuCau: async (maYeuCau) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/xoayeucautimgiasu/${maYeuCau}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa yêu cầu!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại YeuCauTimGiaSu_Service.xoaYeuCau:", loi);
            throw loi;
        }
    }
};

export default YeuCauTimGiaSu_Service;
