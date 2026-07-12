import { API_URL } from '../config/api.js';

const GiaSu_MonHoc_Service = {
    layDanhSachGiaSuMonHoc: async () => {
        try {
            const phanHoi = await fetch(`${API_URL}/danhsachgiasumonhoc`);
            if (!phanHoi.ok) throw new Error("Lỗi kết nối API môn học gia sư!");
            const ketQua = await phanHoi.json();
            return ketQua.data;
        } catch (loi) {
            console.error("Lỗi tại GiaSu_MonHoc_Service.layDanhSachGiaSuMonHoc:", loi);
            throw loi;
        }
    },

    themGiaSuMonHocMoi: async (duLieuForm) => {
        try {
            const phanHoi = await fetch(`${API_URL}/themgiasumonhoc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuForm)
            });
            if (!phanHoi.ok) throw new Error("Không thể thêm môn học gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_MonHoc_Service.themGiaSuMonHocMoi:", loi);
            throw loi;
        }
    },

    capNhatGiaSuMonHoc: async (maGiaSuMonHoc, duLieuSua) => {
        try {
            const phanHoi = await fetch(`${API_URL}/suagiasumonhoc/${maGiaSuMonHoc}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duLieuSua)
            });
            if (!phanHoi.ok) throw new Error("Không thể cập nhật môn học gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_MonHoc_Service.capNhatGiaSuMonHoc:", loi);
            throw loi;
        }
    },

    khoaGiaSuMonHoc: async (maGiaSuMonHoc) => {
        try {
            const phanHoi = await fetch(`${API_URL}/khoagiasumonhoc/${maGiaSuMonHoc}`, {
                method: 'PUT'
            });
            if (!phanHoi.ok) throw new Error("Không thể khóa môn học gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_MonHoc_Service.khoaGiaSuMonHoc:", loi);
            throw loi;
        }
    },

    moKhoaGiaSuMonHoc: async (maGiaSuMonHoc) => {
        try {
            const phanHoi = await fetch(`${API_URL}/mokhoagiasumonhoc/${maGiaSuMonHoc}`, {
                method: 'PUT'
            });
            if (!phanHoi.ok) throw new Error("Không thể mở khóa môn học gia sư!");
            return await phanHoi.json();
        } catch (loi) {
            console.error("Lỗi tại GiaSu_MonHoc_Service.moKhoaGiaSuMonHoc:", loi);
            throw loi;
        }
    },

    
    tinhHocPhi: async (hocphimotbuoi, sobuoi) => {
        try {
            const phanHoi = await fetch(`${API_URL}/tinhhocphi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hocphimotbuoi: Number(hocphimotbuoi) || 0,
                    sobuoi: Number(sobuoi) || 1
                })
            });
            if (!phanHoi.ok) throw new Error("Lỗi gọi API tính học phí!");
            const ketQua = await phanHoi.json();
            return ketQua.data; 
        } catch (loi) {
            console.error("Lỗi tại GiaSu_MonHoc_Service.tinhHocPhi:", loi);
            return 0; 
        }
    }
};

export default GiaSu_MonHoc_Service;
