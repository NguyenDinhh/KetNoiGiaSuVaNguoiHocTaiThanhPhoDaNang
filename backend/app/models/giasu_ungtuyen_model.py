from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, text
from sqlalchemy.sql import func
from app.models.base_model import Base

class GiaSuUngTuyen(Base):
    __tablename__ = "GIASU_UNGTUYEN"

    magiasu_ungtuyen = Column(String(10), primary_key=True, server_default=text("''"))
    mayeucau = Column(String(10), ForeignKey("YEUCAUTIMGIASU.mayeucau"), nullable=False)
    magiasu = Column(String(10), ForeignKey("GIASU.magiasu"), nullable=False)
    thoigian_ungtuyen = Column(DateTime, default=func.now())
    trangthai = Column(Integer, default=0) # 0: Đang chờ, 1: Chấp nhận, 2: Từ chối
    lydotuchoi = Column(String(100))
