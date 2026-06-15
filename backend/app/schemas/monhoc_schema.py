from pydantic import BaseModel

class MonHoc_Schema(BaseModel):
    mamonhoc: str
    mahelop: str
    tenmonhoc: str
    mota: str
    trangthai: int  # 1: Hoạt động, 0: Ngưng áp dụng

    class Config:
        from_attributes = True

class Create_MonHoc_Schema(BaseModel):
    mahelop: str
    tenmonhoc: str
    mota: str
    trangthai: int
