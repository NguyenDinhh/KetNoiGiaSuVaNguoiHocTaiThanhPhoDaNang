from pydantic import BaseModel
from typing import Optional

class KhuVuc_Schema(BaseModel):
    makhuvuc: int
    tenkhuvuc: str
    trangthai: Optional[int] = None

    class Config:
        from_attributes = True

class Create_KhuVuc_Schema(BaseModel):
    tenkhuvuc: str

class Update_KhuVuc_Schema(BaseModel):
    tenkhuvuc: Optional[str] = None
    trangthai: Optional[int] = None
