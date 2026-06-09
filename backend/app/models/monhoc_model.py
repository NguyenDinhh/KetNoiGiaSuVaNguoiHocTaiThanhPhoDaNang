from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.models.base_model import Base

class MonHoc(Base):
    __tablename__ = "MONHOC"

    mamonhoc = Column(Integer, primary_key=True, autoincrement=True)
    mahelop = Column(Integer, ForeignKey("HELOP.mahelop"), nullable=False)
    tenmonhoc = Column(String(255), nullable=False)
    mota = Column(String(1000))
    trangthai = Column(Integer, default=1)  # 1: Hoạt động, 0: Ngưng áp dụng

    __table_args__ = (
        UniqueConstraint('tenmonhoc', 'mahelop', name='UC_MonHoc_HeLop'),
    )
