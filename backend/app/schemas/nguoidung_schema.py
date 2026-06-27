from pydantic import BaseModel
from pydantic import field_validator

class NguoiDung_Schema(BaseModel):
    manguoidung: str
    email: str
    hoten:str
    sodienthoai: str
    anhdaidien: str
    vaitro: int
    trangthai: int

    class Config:
        from_attributes = True

class Register_NguoiDung_Schema(BaseModel):
    email: str
    matkhau: str
    hoten:str
    sodienthoai: str
    anhdaidien: str
    vaitro: int

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

