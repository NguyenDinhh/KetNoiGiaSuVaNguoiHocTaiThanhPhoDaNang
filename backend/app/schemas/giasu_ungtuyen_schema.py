from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GiaSuUngTuyen_Schema(BaseModel):
    magiasu_ungtuyen: str
    mayeucau: str
    magiasu: str
    thoigian_ungtuyen: datetime
    trangthai: int 
    lydotuchoi: Optional[str] = None

    class Config:
        from_attributes = True

class Create_GiaSuUngTuyen_Schema(BaseModel):
    mayeucau: str
    magiasu: str

class Update_GiaSuUngTuyen_Schema(BaseModel):
    mayeucau: Optional[str] = None
    magiasu: Optional[str] = None
    thoigian_ungtuyen: Optional[datetime] = None
    trangthai: Optional[int] = None
    lydotuchoi: Optional[str] = None
