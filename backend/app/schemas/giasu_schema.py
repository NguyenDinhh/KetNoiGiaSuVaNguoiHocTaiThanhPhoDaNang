from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GiaSu_Schema(BaseModel):
    magiasu: int
    manguoidung: int
    cccdmattruoc: Optional[str] = None
    cccdmatsau: Optional[str] = None
    namsinh: Optional[int] = None
    gioitinh: Optional[int] = None  # 0: Nam, 1: Nữ
    gioithieubanthan: Optional[str] = None
    ngaydangki: Optional[datetime] = None
    trangthaiduyet: int  # 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối

    class Config:
        from_attributes = True

class Create_GiaSu_Schema(BaseModel):
    manguoidung: int
    cccdmattruoc: str
    cccdmatsau: str
    namsinh: int
    gioitinh: int  # 0: Nam, 1: Nữ
    gioithieubanthan: str
    trangthaiduyet: int  # 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
