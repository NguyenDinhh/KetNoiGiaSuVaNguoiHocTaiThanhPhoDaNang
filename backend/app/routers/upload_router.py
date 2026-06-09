from fastapi import APIRouter, UploadFile, File, Form
from app.utils.cloudinary_config import upload_image_to_cloud

upload_router = APIRouter()

@upload_router.post("/api/upload", tags=["Upload"])
async def upload_file_giasu(
    file: UploadFile = File(...),
    loai_anh: str = Form(...) # Bắt buộc Frontend phải gửi kèm biến này
):
    try:
        # Đọc nội dung file
        file_content = await file.read()

        # Phân luồng thư mục dựa vào 'loai_anh'
        if loai_anh == "anhdaidien":
            folder_dich = "GiaSuDaNang/Avatars"
        elif loai_anh == "cccdmattruoc":
            folder_dich = "GiaSuDaNang/CCCD/MatTruoc"
        elif loai_anh == "cccdmatsau":
            folder_dich = "GiaSuDaNang/CCCD/MatSau"
        else:
            folder_dich = "GiaSuDaNang/Khac" # Đề phòng gửi sai loại

        # Đẩy lên mây vào đúng thư mục
        link_url = upload_image_to_cloud(file_content, folder_name=folder_dich)

        return {"code": "200", "message": "Upload thành công", "url": link_url}

    except Exception as e:
        return {"code": "500", "message": str(e), "url": None}
