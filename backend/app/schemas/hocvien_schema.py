from pydantic import BaseModel
from typing import Optional

class HocVien_Schema(BaseModel):
    mahocvien: int
    manguoidung: int
    tenhocvien: str
    namsinh: int
    hocluc: str
    diachi: str
    ghichu: str
    trangthai: Optional[int] = None
 
    class Config:
        from_attributes = True

class Create_HocVien_Schema(BaseModel):
    manguoidung: int
    tenhocvien: str
    namsinh: int
    hocluc: str
    diachi: str
    ghichu: str

class Update_HocVien_Schema(BaseModel):
    manguoidung: Optional[int] = None
    tenhocvien: Optional[str] = None
    namsinh: Optional[int] = None
    hocluc: Optional[str] = None
    diachi: Optional[str] = None
    ghichu: Optional[str] = None
    trangthai: Optional[int] = None
