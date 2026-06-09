from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Float, ForeignKey, CheckConstraint
from app.models.base_model import Base

class HocVien(Base):
    __tablename__ = "HOCVIEN"

    mahocvien = Column(Integer, primary_key=True)
    manguoidung = Column(Integer, ForeignKey("NGUOIDUNG.manguoidung", ondelete="CASCADE"), nullable=False)
    tenhocvien = Column(String(100), nullable=False)
    namsinh = Column(Integer)
    hocluc = Column(String(50))
    diachi = Column(String(255))
    ghichu = Column(String(1000))
