import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
)

def upload_image_to_cloud(file_content: bytes, folder_name: str = "GiaSuDaNang") -> str:
    try:
        ket_qua = cloudinary.uploader.upload(file_content, folder=folder_name)
        return ket_qua.get("secure_url")
    except Exception as e:
        raise Exception(f"Lỗi kết nối Cloudinary: {str(e)}")
