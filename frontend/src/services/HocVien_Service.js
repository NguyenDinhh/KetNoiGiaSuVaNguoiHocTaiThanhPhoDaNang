const DIA_CHI_API = 'http://localhost:8000';

const HocVien_Service = {
    layDanhSachHocVien: async () => {
        try {
            const phanHoi = await fetch(`${DIA_CHI_API}/danhsachhocvien`);
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
            const phanHoi = await fetch(`${DIA_CHI_API}/hocvien/${maHocVien}`);
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
            const phanHoi = await fetch(`${DIA_CHI_API}/themhocvien`, {
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
            const phanHoi = await fetch(`${DIA_CHI_API}/suahocvien/${maHocVien}`, {
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
            const phanHoi = await fetch(`${DIA_CHI_API}/xoahocvien/${maHocVien}`, {
                method: 'DELETE'
            });
            if (!phanHoi.ok) throw new Error("Không thể xóa học viên!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại HocVien_Service.xoaHocVien:", loi);
            throw loi;
        }
    }
};

export default HocVien_Service;
