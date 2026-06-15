from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Float, ForeignKey, CheckConstraint, text
from app.models.base_model import Base

class NguoiDung(Base):
    __tablename__ = "NGUOIDUNG"

    manguoidung = Column(String(10), primary_key=True, server_default=text("''"))
    email = Column(String(100), unique=True, nullable=False)
    matkhau = Column(String(255), nullable=False)
    hoten = Column(String(100), nullable=False)
    sodienthoai = Column(String(10), CheckConstraint("sodienthoai LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'"))
    anhdaidien = Column(String(255))
    vaitro = Column(Integer, nullable=False) # 0: Admin, 1: Gia sư, 2: Người học
    trangthai = Column(Integer, default=1)   # 1: Hoạt động, 0: Khóa
    matruycap = Column(String(255))
