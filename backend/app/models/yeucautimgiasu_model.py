from sqlalchemy import Column, Integer, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from app.models.base_model import Base

class YeuCauTimGiaSu(Base):
    __tablename__ = "YEUCAUTIMGIASU"

    mayeucau = Column(Integer, primary_key=True, autoincrement=True)
    manguoidung = Column(Integer, ForeignKey("NGUOIDUNG.manguoidung"), nullable=False)
    makhuvuc = Column(Integer, ForeignKey("KHUVUC.makhuvuc"), nullable=False)
    mamonhoc = Column(Integer, ForeignKey("MONHOC.mamonhoc"), nullable=False)
    ngaytao = Column(DateTime, default=func.now())
    ngaybatdauhoc = Column(DateTime)
    sobuoihoc = Column(Integer, CheckConstraint('sobuoihoc > 0'))
    tonghocphi = Column(Integer, CheckConstraint('tonghocphi >= 0'))
    trangthai = Column(Integer, default=0) # 0: Mới tạo, 1: Đã có gia sư, 2: Hoàn thành
