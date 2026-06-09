from sqlalchemy import Column,Integer,String
from app.models.base_model import Base


class KhuVuc(Base):
    __tablename__ = "KHUVUC"
    makhuvuc = Column(Integer, primary_key = True)
    tenkhuvuc = Column(String(255))
