from pydantic import BaseModel

class BangCap_Schema(BaseModel):
    mabangcap: int
    tenbangcap: str

    class Config:
        from_attributes = True

class Create_BangCap_Schema(BaseModel):
    tenbangcap: str
