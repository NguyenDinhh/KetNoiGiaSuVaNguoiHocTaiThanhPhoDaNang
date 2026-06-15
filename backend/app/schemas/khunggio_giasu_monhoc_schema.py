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
    trangthai: int  # 1: Hoạt động, 0: Không hoạt động, 2: Đang dạy

    class Config:
        from_attributes = True

class Create_KhungGioGiaSuMonHoc_Schema(BaseModel):
    magiasu_monhoc: str
    ngayday: str
    thoigianbatdau: time
    thoigianketthuc: time

# 🟢 THÊM SCHEMA NÀY DÀNH RIÊNG CHO LÚC CẬP NHẬT (PUT)
class Update_KhungGioGiaSuMonHoc_Schema(BaseModel):
    magiasu_monhoc: Optional[str] = None
    ngayday: Optional[str] = None
    thoigianbatdau: Optional[time] = None
    thoigianketthuc: Optional[time] = None
    trangthai: Optional[int] = None # Đã mở khóa cho phép nhận trạng thái
