from pydantic import BaseModel

class GiaSuMonHoc_Schema(BaseModel):
    magiasu_monhoc: int
    magiasu: int
    mamonhoc: int
    makhuvuc: int
    hocphimoibuoi: int
    thoiluonghoc: int
    sobuoihoc: int
    trangthai: int  # 1: Hoạt động, 0: Không hoạt động

    class Config:
        from_attributes = True

class Create_GiaSuMonHoc_Schema(BaseModel):
    magiasu: int
    mamonhoc: int
    makhuvuc: int
    hocphimoibuoi: int
    thoiluonghoc: int
    sobuoihoc: int
