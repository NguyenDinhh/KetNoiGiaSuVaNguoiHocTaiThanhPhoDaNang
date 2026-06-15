from sqlalchemy import Column, Integer, String, Time, DateTime, ForeignKey, CheckConstraint, text
from sqlalchemy.sql import func
from app.models.base_model import Base

class KhungGioGiaSuMonHoc(Base):
    __tablename__ = "KHUNGGIO_GIASU_MONHOC"

    makhunggio = Column(String(10), primary_key=True, server_default=text("''"))
    magiasu_monhoc = Column(String(10), ForeignKey("GIASU_MONHOC.magiasu_monhoc", ondelete="CASCADE"), nullable=False)
    ngaytao = Column(DateTime, default=func.now())
    ngayday = Column(String(10))
    thoigianbatdau = Column(Time)
    thoigianketthuc = Column(Time)
    trangthai = Column(Integer, default=1)

    __table_args__ = (
        CheckConstraint('thoigianketthuc > thoigianbatdau', name='CHK_GioDay'),
    )
