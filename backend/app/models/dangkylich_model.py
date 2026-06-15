from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, CheckConstraint, text
from sqlalchemy.sql import func
from app.models.base_model import Base

class DangKyLich(Base):
    __tablename__ = "DANGKYLICH"

    madangky = Column(String(10), primary_key=True, server_default=text("''"))
    manguoidung = Column(String(10), ForeignKey("NGUOIDUNG.manguoidung"), nullable=False)
    magiasu_monhoc = Column(String(10), ForeignKey("GIASU_MONHOC.magiasu_monhoc"), nullable=False)
    ngayyeucau = Column(DateTime, default=func.now())
    ngaybatdauhoc = Column(Date)
    tonghocphi = Column(Integer, CheckConstraint('tonghocphi >= 0'))
    ghichu = Column(String(1000))
    trangthai = Column(Integer, default=0)
    lydotuchoi = Column(String(100))
