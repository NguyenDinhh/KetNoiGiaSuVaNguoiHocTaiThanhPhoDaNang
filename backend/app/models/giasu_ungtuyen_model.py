from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.models.base_model import Base

class GiaSuUngTuyen(Base):
    __tablename__ = "GIASU_UNGTUYEN"

    magiasu_ungtuyen = Column(Integer, primary_key=True, autoincrement=True)
    mayeucau = Column(Integer, ForeignKey("YEUCAUTIMGIASU.mayeucau"), nullable=False)
    magiasu = Column(Integer, ForeignKey("GIASU.magiasu"), nullable=False)
    thoigian_ungtuyen = Column(DateTime, default=func.now())
    trangthai = Column(Integer, default=0) # 0: Đang chờ, 1: Chấp nhận, 2: Từ chối
