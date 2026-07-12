import { API_URL } from '../config/api.js';

const XacThucEmail_Service = {
  
  guiMaOTP: async (emailCuaNguoiDung) => {
    try {
      const phanHoi = await fetch(`${API_URL}/api/gui-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailCuaNguoiDung })
      });

      if (!phanHoi.ok) throw new Error("Không thể kết nối đến server gửi mail");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại XacThucEmail_Service.guiMaOTP:", loi);
      throw loi;
    }
  },

  
  xacThucOTP: async (emailCuaNguoiDung, maOTP) => {
    try {
      const phanHoi = await fetch(`${API_URL}/api/xac-thuc-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailCuaNguoiDung, otp: maOTP })
      });

      
      if (!phanHoi.ok) {
        const loiChiTiet = await phanHoi.json();
        throw new Error(loiChiTiet.detail || "Xác thực thất bại");
      }
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại XacThucEmail_Service.xacThucOTP:", loi);
      throw loi;
    }
  }
};

export default XacThucEmail_Service;
