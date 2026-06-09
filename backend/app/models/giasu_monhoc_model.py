from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint
from app.models.base_model import Base

class GiaSuMonHoc(Base):
    __tablename__ = "GIASU_MONHOC"

    magiasu_monhoc = Column(Integer, primary_key=True, autoincrement=True)
    magiasu = Column(Integer, ForeignKey("GIASU.magiasu"), nullable=False)
    mamonhoc = Column(Integer, ForeignKey("MONHOC.mamonhoc"), nullable=False)
    makhuvuc = Column(Integer, ForeignKey("KHUVUC.makhuvuc"), nullable=False)
    hocphimoibuoi = Column(Integer, CheckConstraint('hocphimoibuoi > 0'))
    thoiluonghoc = Column(Integer, CheckConstraint('thoiluonghoc > 0'))
    sobuoihoc = Column(Integer, CheckConstraint('sobuoihoc > 0'))
    trangthai = Column(Integer, default=1)
