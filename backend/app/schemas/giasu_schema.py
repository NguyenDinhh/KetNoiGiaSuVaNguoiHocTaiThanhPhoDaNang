from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GiaSu_Schema(BaseModel):
    magiasu: str
    manguoidung: str
    cccdmattruoc: Optional[str] = None
    cccdmatsau: Optional[str] = None
    namsinh: Optional[int] = None
    gioitinh: Optional[int] = None
    gioithieubanthan: Optional[str] = None
    ngaydangki: Optional[datetime] = None
    trangthaiduyet: int
    lydotuchoi: Optional[str] = None

    class Config:
        from_attributes = True

class Create_GiaSu_Schema(BaseModel):
    manguoidung: str
    cccdmattruoc: str
    cccdmatsau: str
    namsinh: int
    gioitinh: int
    gioithieubanthan: str
    trangthaiduyet: int

class Update_GiaSu_Schema(BaseModel):
    manguoidung: Optional[str] = None
    cccdmattruoc: Optional[str] = None
    cccdmatsau: Optional[str] = None
    namsinh: Optional[int] = None
    gioitinh: Optional[int] = None
    gioithieubanthan: Optional[str] = None
    trangthaiduyet: Optional[int] = None
    lydotuchoi: Optional[str] = None
