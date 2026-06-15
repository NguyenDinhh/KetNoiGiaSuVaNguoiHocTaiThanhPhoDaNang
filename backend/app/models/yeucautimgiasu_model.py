from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, CheckConstraint, text
from sqlalchemy.sql import func
from app.models.base_model import Base

class YeuCauTimGiaSu(Base):
    __tablename__ = "YEUCAUTIMGIASU"

    mayeucau = Column(String(10), primary_key=True, server_default=text("''"))
    manguoidung = Column(String(10), ForeignKey("NGUOIDUNG.manguoidung"), nullable=False)
    makhuvuc = Column(String(10), ForeignKey("KHUVUC.makhuvuc"), nullable=False)
    mamonhoc = Column(String(10), ForeignKey("MONHOC.mamonhoc"), nullable=False)
    ngaytao = Column(DateTime, default=func.now())
    ngaybatdauhoc = Column(DateTime)
    sobuoihoc = Column(Integer, CheckConstraint('sobuoihoc > 0'))
    tonghocphi = Column(Integer, CheckConstraint('tonghocphi >= 0'))
    trangthai = Column(Integer, default=0) # 0: Mới tạo, 1: Đã có gia sư, 2: Hoàn thành
