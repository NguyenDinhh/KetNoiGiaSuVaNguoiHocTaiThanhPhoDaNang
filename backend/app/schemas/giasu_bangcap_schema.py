from pydantic import BaseModel
from datetime import datetime

class GiaSuBangCap_Schema(BaseModel):
    mabangcapgiasu: str
    magiasu: str
    mabangcap: str
    chuyennganh: str
    namtotnghiep: int
    cosodaotao: str
    anhbangcap: str
    trangthaiduyet: int  # 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối

    class Config:
        from_attributes = True

class Create_GiaSuBangCap_Schema(BaseModel):
    magiasu: str
    mabangcap: str
    chuyennganh: str
    namtotnghiep: int
    cosodaotao: str
    anhbangcap: str
    trangthaiduyet: int  # 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối

class Update_GiaSuBangCap_Schema(BaseModel):
    magiasu: str
    mabangcap: str
    chuyennganh: str
    namtotnghiep: int
    cosodaotao: str
    anhbangcap: str
    trangthaiduyet: int  # 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
