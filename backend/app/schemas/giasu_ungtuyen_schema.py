from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GiaSuUngTuyen_Schema(BaseModel):
    magiasu_ungtuyen: int
    mayeucau: int
    magiasu: int
    thoigian_ungtuyen: datetime
    trangthai: int  # 0: Đang chờ, 1: Chấp nhận, 2: Từ chối

    class Config:
        from_attributes = True

class Create_GiaSuUngTuyen_Schema(BaseModel):
    mayeucau: int
    magiasu: int

class Update_GiaSuUngTuyen_Schema(BaseModel):
    mayeucau: Optional[int] = None
    magiasu: Optional[int] = None
    thoigian_ungtuyen: Optional[datetime] = None
    trangthai: Optional[int] = None
