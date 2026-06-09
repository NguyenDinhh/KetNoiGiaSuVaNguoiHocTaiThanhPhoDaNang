from sqlalchemy import Column, Integer, String
from app.models.base_model import Base

class BangCap(Base):
    __tablename__ = "BANGCAP"

    mabangcap = Column(Integer, primary_key=True, autoincrement=True)
    tenbangcap = Column(String(255), nullable=False, unique=True)
