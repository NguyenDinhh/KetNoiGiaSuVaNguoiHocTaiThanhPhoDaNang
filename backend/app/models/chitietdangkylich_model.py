from sqlalchemy import Column, Integer, String, Time, ForeignKey, text
from app.models.base_model import Base

class ChiTietDangKyLich(Base):
    __tablename__ = "CHITIETDANGKYLICH"

    machitietdangky = Column(String(10), primary_key=True, server_default=text("''"))
    makhunggio = Column(String(10), ForeignKey("KHUNGGIO_GIASU_MONHOC.makhunggio"), nullable=False)
    madangky = Column(String(10), ForeignKey("DANGKYLICH.madangky", ondelete="CASCADE"), nullable=False)
    ngayhoc = Column(String(10))
    thoigianbatdau = Column(Time)
    thoigianketthuc = Column(Time)
    ghichu = Column(String(1000))
