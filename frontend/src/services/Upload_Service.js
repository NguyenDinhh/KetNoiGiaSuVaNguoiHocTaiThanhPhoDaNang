const DIA_CHI_API = 'http://localhost:8000';

const Upload_Service = {
  // Nhận vào 2 tham số: file ảnh và tên loại ảnh
  uploadAnh: async (fileObject, loaiAnh) => {
    try {
      const gioDuLieu = new FormData();
      gioDuLieu.append("file", fileObject);
      gioDuLieu.append("loai_anh", loaiAnh); // Nhét thêm dòng này để gửi loại ảnh qua Backend

      const phanHoi = await fetch(`${DIA_CHI_API}/api/upload`, {
        method: 'POST',
        body: gioDuLieu
      });

      if (!phanHoi.ok) throw new Error("Lỗi đường truyền upload!");
      return await phanHoi.json();
    } catch (loi) {
      console.error("Lỗi tại Upload_Service.uploadAnh:", loi);
      throw loi;
    }
  }
};

export default Upload_Service;
