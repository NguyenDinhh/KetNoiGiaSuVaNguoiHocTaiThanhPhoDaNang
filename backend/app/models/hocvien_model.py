from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Float, ForeignKey, CheckConstraint, text
from app.models.base_model import Base

class HocVien(Base):
    __tablename__ = "HOCVIEN"

    mahocvien = Column(String(10), primary_key=True, server_default=text("''"))
    manguoidung = Column(String(10), ForeignKey("NGUOIDUNG.manguoidung", ondelete="CASCADE"), nullable=False)
    tenhocvien = Column(String(100), nullable=False)
    namsinh = Column(Integer)
    hocluc = Column(String(50))
    diachi = Column(String(255))
    ghichu = Column(String(1000))
    trangthai = Column(Integer)
