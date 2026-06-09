from pydantic import BaseModel

class KhuVuc_Schema(BaseModel):
    makhuvuc: int
    tenkhuvuc: str

    class Config:
        from_attributes = True

class Create_KhuVuc_Schema(BaseModel):
    tenkhuvuc: str
