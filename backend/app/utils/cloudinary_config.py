import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

# Điền 3 thông số ông lấy từ Dashboard Cloudinary vào đây
cloudinary.config(
    cloud_name = "dg9s75xsf",
    api_key = "518449666752956",
    api_secret = "OOraXbaskxUq_0dhJooYMlkBRKs"
)

def upload_image_to_cloud(file_content: bytes, folder_name: str = "GiaSuDaNang") -> str:
    """Hàm bổ trợ đẩy byte dữ liệu lên mây và lấy link secure_url"""
    try:
        ket_qua = cloudinary.uploader.upload(file_content, folder=folder_name)
        return ket_qua.get("secure_url")
    except Exception as e:
        raise Exception(f"Lỗi kết nối Cloudinary: {str(e)}")
