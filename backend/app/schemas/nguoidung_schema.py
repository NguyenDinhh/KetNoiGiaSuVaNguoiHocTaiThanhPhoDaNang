from pydantic import BaseModel
from pydantic import field_validator

class NguoiDung_Schema(BaseModel):
    manguoidung: int
    email: str
    # matkhau: str
    hoten:str
    sodienthoai: str
    anhdaidien: str
    vaitro: int # 0: Admin, 1: Gia sư, 2: Học viên
    trangthai: int  # 1: Hoạt động, 0: Khóa
    # matruycap: str

    class Config:
        from_attributes = True

class Register_NguoiDung_Schema(BaseModel):
    email: str
    matkhau: str
    hoten:str
    sodienthoai: str
    anhdaidien: str
    vaitro: int # 0: Admin, 1: Gia sư, 2: Người học

class Login_Schema(BaseModel):
    email: str
    matkhau: str
    class Config:
        from_attributes = True

class Update_NguoiDung_Schema(BaseModel):
    hoten: str | None = None
    sodienthoai: str | None = None
    anhdaidien: str | None = None
    matkhau: str | None = None
    vaitro: int | None = None

