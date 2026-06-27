from pydantic import BaseModel
from datetime import datetime

class YeuCauTimGiaSu_Schema(BaseModel):
    mayeucau: str
    manguoidung: str
    makhuvuc: str
    mamonhoc: str
    ngaytao: datetime
    ngaybatdauhoc: datetime
    sobuoihoc: int
    tonghocphi: int
    trangthai: int

    class Config:
        from_attributes = True

class Create_YeuCauTimGiaSu_Schema(BaseModel):
    manguoidung: str
    makhuvuc: str
    mamonhoc: str
    ngaybatdauhoc: datetime
    sobuoihoc: int
    tonghocphi: int

class Update_TrangThai_YeuCau_Schema(BaseModel):
    trangthai: int
