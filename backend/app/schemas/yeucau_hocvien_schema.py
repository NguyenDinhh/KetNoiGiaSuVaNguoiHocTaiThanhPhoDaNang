from pydantic import BaseModel
from typing import Optional

class YeuCauHocVien_Schema(BaseModel):
    mayeucau_hocvien: str
    mahocvien: str
    mayeucau: Optional[str] = None
    madangky: Optional[str] = None

    class Config:
        from_attributes = True

class Create_YeuCauHocVienVoiMaYeuCau_Schema(BaseModel):
    mahocvien: str
    mayeucau: str

class Create_YeuCauHocVienVoiMaDangKy_Schema(BaseModel):
    mahocvien: str
    madangky: str
