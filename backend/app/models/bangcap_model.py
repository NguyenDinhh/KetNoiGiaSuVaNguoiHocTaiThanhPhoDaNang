from sqlalchemy import Column, Integer, String, text
from app.models.base_model import Base

class BangCap(Base):
    __tablename__ = "BANGCAP"

    mabangcap = Column(String(10), primary_key=True, server_default=text("''"))
    tenbangcap = Column(String(255), nullable=False, unique=True)
    trangthai = Column(Integer)
