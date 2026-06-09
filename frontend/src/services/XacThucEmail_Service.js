const DIA_CHI_API = 'http://localhost:8000';

const XacThucEmail_Service = {
  // Hàm gọi API gửi mã
  guiMaOTP: async (emailCuaNguoiDung) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/api/gui-otp`, {
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

  // Hàm gọi API xác thực mã
  xacThucOTP: async (emailCuaNguoiDung, maOTP) => {
    try {
      const phanHoi = await fetch(`${DIA_CHI_API}/api/xac-thuc-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailCuaNguoiDung, otp: maOTP })
      });

      // Khác với gửi mail, xác thực có thể trả về lỗi 400 (sai mã), ta phải bắt được câu lỗi đó
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
