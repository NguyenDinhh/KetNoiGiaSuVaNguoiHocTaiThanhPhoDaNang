from pydantic import BaseModel
from typing import Optional

class YeuCauHocVien_Schema(BaseModel):
    mayeucau_hocvien: int
    mahocvien: int
    mayeucau: Optional[int] = None
    madangky: Optional[int] = None

    class Config:
        from_attributes = True

class Create_YeuCauHocVienVoiMaYeuCau_Schema(BaseModel):
    mahocvien: int
    mayeucau: int

class Create_YeuCauHocVienVoiMaDangKy_Schema(BaseModel):
    mahocvien: int
    madangky: int
