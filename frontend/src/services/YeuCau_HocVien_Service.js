const DIA_CHI_API = 'http://localhost:8000';

const YeuCau_HocVien_Service = {
    layDanhSachYeuCauHocVien: async () => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/danhsachyeucauhocvien`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API yêu cầu học viên!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại YeuCau_HocVien_Service.layDanhSachYeuCauHocVien:", loi);
            throw loi;
        }
    },

    layChiTietYeuCauHocVien: async (maYeuCauHocVien) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/yeucauhocvien/${maYeuCauHocVien}`);
            if (!phanHoi.ok) throw new Error("Không tìm thấy yêu cầu học viên!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại YeuCau_HocVien_Service.layChiTietYeuCauHocVien:", loi);
            throw loi;
        }
    },

    
    themYeuCauHocVienMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/themyeucauhocvien`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm yêu cầu học viên!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại YeuCau_HocVien_Service.themYeuCauHocVienMoi:", loi);
            throw loi;
        }
    },

    
    themYeuCauHocVienTheoMaDangKy: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/themyeucauhocvien_theomadangky`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm yêu cầu học viên theo mã đăng ký!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại YeuCau_HocVien_Service.themYeuCauHocVienTheoMaDangKy:", loi);
            throw loi;
        }
    },

    xoaYeuCauHocVien: async (maYeuCauHocVien) => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/xoayeucauhocvien/${maYeuCauHocVien}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa yêu cầu học viên!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại YeuCau_HocVien_Service.xoaYeuCauHocVien:", loi);
            throw loi;
        }
    }
};

export default YeuCau_HocVien_Service;
