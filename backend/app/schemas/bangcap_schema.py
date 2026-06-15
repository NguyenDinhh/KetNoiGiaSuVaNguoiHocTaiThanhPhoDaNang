from pydantic import BaseModel
from typing import Optional

class BangCap_Schema(BaseModel):
    mabangcap: str
    tenbangcap: str
    trangthai: Optional[int] = None

    class Config:
        from_attributes = True

class Create_BangCap_Schema(BaseModel):
    tenbangcap: str

class Update_BangCap_Schema(BaseModel):
    tenbangcap: Optional[str] = None
    trangthai: Optional[int] = None
