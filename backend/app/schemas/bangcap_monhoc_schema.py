from pydantic import BaseModel

class BangCapMonHoc_Schema(BaseModel):
    mabangcap_monhoc: str
    mabangcap: str
    mamonhoc: str

    class Config:
        from_attributes = True

class Create_BangCapMonHoc_Schema(BaseModel):
    mabangcap: str
    mamonhoc: str
