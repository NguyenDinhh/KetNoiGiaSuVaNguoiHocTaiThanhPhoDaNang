from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.sql import func
from app.models.base_model import Base

class GiaSu(Base):
    __tablename__ = "GIASU"

    magiasu = Column(Integer, primary_key=True, autoincrement=True)
    manguoidung = Column(Integer, ForeignKey("NGUOIDUNG.manguoidung", ondelete="CASCADE"), nullable=False, unique=True)
    cccdmattruoc = Column(String(255), nullable=False)
    cccdmatsau = Column(String(255), nullable=False)
    namsinh = Column(Integer)
    gioitinh = Column(Integer, CheckConstraint('gioitinh IN (0, 1)')) # 0: Nam, 1: Nữ
    gioithieubanthan = Column(String(1000))
    ngaydangki = Column(DateTime, server_default=func.now())
    trangthaiduyet = Column(Integer, default=0) # 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
