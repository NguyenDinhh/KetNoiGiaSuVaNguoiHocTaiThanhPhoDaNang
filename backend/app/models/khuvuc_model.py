from sqlalchemy import Column,Integer,String, text
from app.models.base_model import Base


class KhuVuc(Base):
    __tablename__ = "KHUVUC"
    makhuvuc = Column(String(10), primary_key = True)
    tenkhuvuc = Column(String(255))
    trangthai = Column(Integer)
