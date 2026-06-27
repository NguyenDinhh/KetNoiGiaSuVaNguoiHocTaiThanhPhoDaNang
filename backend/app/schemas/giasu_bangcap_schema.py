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
    trangthaiduyet: int

    class Config:
        from_attributes = True

class Create_GiaSuBangCap_Schema(BaseModel):
    magiasu: str
    mabangcap: str
    chuyennganh: str
    namtotnghiep: int
    cosodaotao: str
    anhbangcap: str
    trangthaiduyet: int

class Update_GiaSuBangCap_Schema(BaseModel):
    magiasu: str
    mabangcap: str
    chuyennganh: str
    namtotnghiep: int
    cosodaotao: str
    anhbangcap: str
    trangthaiduyet: int
