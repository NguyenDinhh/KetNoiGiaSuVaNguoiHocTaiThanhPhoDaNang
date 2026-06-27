from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class DangKyLich_Schema(BaseModel):
    madangky: str
    manguoidung: str
    magiasu_monhoc: str
    ngayyeucau: datetime
    ngaybatdauhoc: date
    tonghocphi: int
    ghichu: Optional[str] = None
    trangthai: int
    lydotuchoi: Optional[str] = None

    class Config:
        from_attributes = True

class Create_DangKyLich_Schema(BaseModel):
    manguoidung: str
    magiasu_monhoc: str
    ngaybatdauhoc: date
    tonghocphi: int
    ghichu: Optional[str] = None

class Update_DangKyLich_Schema(BaseModel):
    manguoidung: Optional[str] = None
    magiasu_monhoc: Optional[str] = None
    ngaybatdauhoc: Optional[date] = None
    tonghocphi: Optional[int] = None
    ghichu: Optional[str] = None
    trangthai: Optional[int] = None
    lydotuchoi: Optional[str] = None
