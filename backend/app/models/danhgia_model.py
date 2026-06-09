from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from app.models.base_model import Base

class DanhGia(Base):
    __tablename__ = "DANHGIA"

    madanhgia = Column(Integer, primary_key=True, autoincrement=True)
    mayeucau = Column(Integer, ForeignKey("YEUCAUTIMGIASU.mayeucau"))
    madangky = Column(Integer, ForeignKey("DANGKYLICH.madangky"))
    sodiem = Column(Float, CheckConstraint('sodiem BETWEEN 1 AND 5'))
    noidung = Column(String(1000))
    ngaydanhgia = Column(DateTime, default=func.now())

    __table_args__ = (
        CheckConstraint('mayeucau IS NOT NULL OR madangky IS NOT NULL', name='CHK_DanhGia_Target'),
    )
