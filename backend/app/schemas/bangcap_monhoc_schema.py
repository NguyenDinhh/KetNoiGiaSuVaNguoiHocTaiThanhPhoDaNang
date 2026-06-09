from pydantic import BaseModel

class BangCapMonHoc_Schema(BaseModel):
    mabangcap_monhoc: int
    mabangcap: int
    mamonhoc: int

    class Config:
        from_attributes = True

class Create_BangCapMonHoc_Schema(BaseModel):
    mabangcap: int
    mamonhoc: int
