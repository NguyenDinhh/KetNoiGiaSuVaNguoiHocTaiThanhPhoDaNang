from sqlalchemy import Column, String, Integer, ForeignKey, CheckConstraint, text
from app.models.base_model import Base

class GiaSuMonHoc(Base):
    __tablename__ = "GIASU_MONHOC"

    magiasu_monhoc = Column(String(10), primary_key=True, server_default=text("''"))
    magiasu = Column(String(10), ForeignKey("GIASU.magiasu"), nullable=False)
    mamonhoc = Column(String(10), ForeignKey("MONHOC.mamonhoc"), nullable=False)
    makhuvuc = Column(String(10), ForeignKey("KHUVUC.makhuvuc"), nullable=False)
    hocphimoibuoi = Column(Integer, CheckConstraint('hocphimoibuoi > 0'))
    thoiluonghoc = Column(Integer, CheckConstraint('thoiluonghoc > 0'))
    sobuoihoc = Column(Integer, CheckConstraint('sobuoihoc > 0'))
    trangthai = Column(Integer, default=1)
