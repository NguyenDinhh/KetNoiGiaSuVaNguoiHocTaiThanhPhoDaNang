from pydantic import BaseModel

class HocVien_Schema(BaseModel):
    mahocvien: int
    manguoidung: int
    tenhocvien: str
    namsinh: int
    hocluc: str
    diachi: str
    ghichu: str

    class Config:
        from_attributes = True

class Create_HocVien_Schema(BaseModel):
    manguoidung: int
    tenhocvien: str
    namsinh: int
    hocluc: str
    diachi: str
    ghichu: str
