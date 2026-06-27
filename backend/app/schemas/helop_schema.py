from pydantic import BaseModel

class HeLop_Schema(BaseModel):
    mahelop: str
    tenhelop: str
    mota: str
    trangthai: int  

    class Config:
        from_attributes = True
class Create_HeLop_Schema(BaseModel):
    tenhelop: str
    mota: str
    trangthai: int
