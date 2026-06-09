from pydantic import BaseModel

class HeLop_Schema(BaseModel):
    mahelop: int
    tenhelop: str
    mota: str
    trangthai: int  # 1: Hoạt động, 0: Ngưng áp dụng

    class Config:
        from_attributes = True

class Create_HeLop_Schema(BaseModel):
    tenhelop: str
    mota: str
    trangthai: int
