from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional

class DanhGia_Schema(BaseModel):
    madanhgia: int
    mayeucau: Optional[int] = None  # 🟢 Chuyển thành tùy chọn
    madangky: Optional[int] = None  # 🟢 Chuyển thành tùy chọn
    sodiem: float  # 1.0 - 5.0
    noidung: str
    ngaydanhgia: datetime

    class Config:
        from_attributes = True

class Create_DanhGia_Schema(BaseModel):
    mayeucau: Optional[int] = None  # 🟢 Cho phép bằng Null
    madangky: Optional[int] = None  # 🟢 Cho phép bằng Null
    sodiem: float  # 1.0 - 5.0
    noidung: str

    # 🟢 Thêm bộ kiểm tra điều kiện (Validator) chặn lỗi từ vòng gửi xe trước khi đụng Database
    @model_validator(mode='after')
    def check_either_exists(self):
        if self.mayeucau is None and self.madangky is None:
            raise ValueError('Phải cung cấp ít nhất mayeucau hoặc madangky để đánh giá!')
        return self
