from sqlalchemy import Column, Integer, String, Time, ForeignKey
from app.models.base_model import Base

class ChiTietDangKyLich(Base):
    __tablename__ = "CHITIETDANGKYLICH"

    machitietdangky = Column(Integer, primary_key=True, autoincrement=True)
    makhunggio = Column(Integer, ForeignKey("KHUNGGIO_GIASU_MONHOC.makhunggio"), nullable=False)
    madangky = Column(Integer, ForeignKey("DANGKYLICH.madangky", ondelete="CASCADE"), nullable=False)
    ngayhoc = Column(String(10))
    thoigianbatdau = Column(Time)
    thoigianketthuc = Column(Time)
    ghichu = Column(String(1000))
