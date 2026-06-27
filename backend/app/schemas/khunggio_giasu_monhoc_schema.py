from pydantic import BaseModel
from datetime import datetime, time
from typing import Optional

class KhungGioGiaSuMonHoc_Schema(BaseModel):
    makhunggio: str
    magiasu_monhoc: str
    ngaytao: datetime
    ngayday: str
    thoigianbatdau: time
    thoigianketthuc: time
    trangthai: int

    class Config:
        from_attributes = True

class Create_KhungGioGiaSuMonHoc_Schema(BaseModel):
    magiasu_monhoc: str
    ngayday: str
    thoigianbatdau: time
    thoigianketthuc: time

class Update_KhungGioGiaSuMonHoc_Schema(BaseModel):
    magiasu_monhoc: Optional[str] = None
    ngayday: Optional[str] = None
    thoigianbatdau: Optional[time] = None
    thoigianketthuc: Optional[time] = None
    trangthai: Optional[int] = None
