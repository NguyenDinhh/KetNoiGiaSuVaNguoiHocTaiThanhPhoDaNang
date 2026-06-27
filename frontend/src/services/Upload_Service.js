const DIA_CHI_API = 'http://localhost:8000';

const Upload_Service = {
  
  uploadAnh: async (fileObject, loaiAnh) => {
    try {
      const gioDuLieu = new FormData();
      gioDuLieu.append("file", fileObject);
      gioDuLieu.append("loai_anh", loaiAnh); 

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
