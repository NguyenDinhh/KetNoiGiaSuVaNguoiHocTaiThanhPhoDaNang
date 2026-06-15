from pydantic import BaseModel
from datetime import time
from typing import Optional

class ChiTietDangKyLich_Schema(BaseModel):
    machitietdangky: str
    makhunggio: str
    madangky: str
    ngayhoc: str
    thoigianbatdau: time
    thoigianketthuc: time
    ghichu: Optional[str] = None # 🟢 ĐÃ SỬA: Cho phép rỗng (NULL)

    class Config:
        from_attributes = True

class Create_ChiTietDangKyLich_Schema(BaseModel):
    makhunggio: str
    madangky: str
    ngayhoc: str
    thoigianbatdau: time
    thoigianketthuc: time
    ghichu: Optional[str] = None # 🟢 ĐÃ SỬA: Cho phép rỗng (NULL)

# Bổ sung luôn Schema cho lúc UPDATE (PUT) cho an toàn nhé
class Update_ChiTietDangKyLich_Schema(BaseModel):
    makhunggio: Optional[str] = None
    madangky: Optional[str] = None
    ngayhoc: Optional[str] = None
    thoigianbatdau: Optional[time] = None
    thoigianketthuc: Optional[time] = None
    ghichu: Optional[str] = None
