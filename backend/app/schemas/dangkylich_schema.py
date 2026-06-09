from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class DangKyLich_Schema(BaseModel):
    madangky: int
    manguoidung: int
    magiasu_monhoc: int
    ngayyeucau: datetime  # 🟢 ĐÃ SỬA: Đổi từ ngaybatdau thành ngayyeucau cho khớp DB
    ngaybatdauhoc: date
    tonghocphi: int
    ghichu: Optional[str] = None # Cho phép null đề phòng ghi chú trống
    trangthai: int

    class Config:
        from_attributes = True

class Create_DangKyLich_Schema(BaseModel):
    manguoidung: int
    magiasu_monhoc: int
    ngaybatdauhoc: date
    tonghocphi: int
    ghichu: Optional[str] = None

# 🟢 THÊM SCHEMA NÀY ĐỂ DÙNG CHO HÀM DUYỆT ĐƠN (CẬP NHẬT TRẠNG THÁI)
class Update_DangKyLich_Schema(BaseModel):
    manguoidung: Optional[int] = None
    magiasu_monhoc: Optional[int] = None
    ngaybatdauhoc: Optional[date] = None
    tonghocphi: Optional[int] = None
    ghichu: Optional[str] = None
    trangthai: Optional[int] = None
