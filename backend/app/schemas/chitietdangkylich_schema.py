from pydantic import BaseModel
from datetime import time
from typing import Optional

class ChiTietDangKyLich_Schema(BaseModel):
    machitietdangky: int
    makhunggio: int
    madangky: int
    ngayhoc: str
    thoigianbatdau: time
    thoigianketthuc: time
    ghichu: Optional[str] = None # 🟢 ĐÃ SỬA: Cho phép rỗng (NULL)

    class Config:
        from_attributes = True

class Create_ChiTietDangKyLich_Schema(BaseModel):
    makhunggio: int
    madangky: int
    ngayhoc: str
    thoigianbatdau: time
    thoigianketthuc: time
    ghichu: Optional[str] = None # 🟢 ĐÃ SỬA: Cho phép rỗng (NULL)

# Bổ sung luôn Schema cho lúc UPDATE (PUT) cho an toàn nhé
class Update_ChiTietDangKyLich_Schema(BaseModel):
    makhunggio: Optional[int] = None
    madangky: Optional[int] = None
    ngayhoc: Optional[str] = None
    thoigianbatdau: Optional[time] = None
    thoigianketthuc: Optional[time] = None
    ghichu: Optional[str] = None
