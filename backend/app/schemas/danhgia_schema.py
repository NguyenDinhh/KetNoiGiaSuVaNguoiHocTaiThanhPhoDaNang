from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional

class DanhGia_Schema(BaseModel):
    madanhgia: str
    mayeucau: Optional[str] = None
    madangky: Optional[str] = None
    sodiem: float
    noidung: str
    ngaydanhgia: datetime

    class Config:
        from_attributes = True

class Create_DanhGia_Schema(BaseModel):
    mayeucau: Optional[str] = None
    madangky: Optional[str] = None
    sodiem: float
    noidung: str

    @model_validator(mode='after')
    def check_either_exists(self):
        if self.mayeucau is None and self.madangky is None:
            raise ValueError('Phải cung cấp ít nhất mayeucau hoặc madangky để đánh giá!')
        return self
