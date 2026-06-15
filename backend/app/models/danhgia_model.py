from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint, text
from sqlalchemy.sql import func
from app.models.base_model import Base

class DanhGia(Base):
    __tablename__ = "DANHGIA"

    madanhgia = Column(String(10), primary_key=True, server_default=text("''"))
    mayeucau = Column(String(10), ForeignKey("YEUCAUTIMGIASU.mayeucau"))
    madangky = Column(String(10), ForeignKey("DANGKYLICH.madangky"))
    sodiem = Column(Float, CheckConstraint('sodiem BETWEEN 1 AND 5'))
    noidung = Column(String(1000))
    ngaydanhgia = Column(DateTime, default=func.now())

    __table_args__ = (
        CheckConstraint('mayeucau IS NOT NULL OR madangky IS NOT NULL', name='CHK_DanhGia_Target'),
    )
