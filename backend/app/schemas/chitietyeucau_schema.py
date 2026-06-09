from pydantic import BaseModel
from datetime import time

class ChiTietYeuCau_Schema(BaseModel):
    machitietyeucau: int
    mayeucau: int
    ngayhoc: str
    thoigianbatdau: time
    thoigianketthuc: time
    ghichu: str

    class Config:
        from_attributes = True

class Create_ChiTietYeuCau_Schema(BaseModel):
    mayeucau: int
    ngayhoc: str
    thoigianbatdau: time
    thoigianketthuc: time
    ghichu: str
