from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, text
from app.models.base_model import Base

class MonHoc(Base):
    __tablename__ = "MONHOC"

    mamonhoc = Column(String(10), primary_key=True, server_default=text("''"))
    mahelop = Column(String(10), ForeignKey("HELOP.mahelop"), nullable=False)
    tenmonhoc = Column(String(255), nullable=False)
    mota = Column(String(1000))
    trangthai = Column(Integer, default=1)

    __table_args__ = (
        UniqueConstraint('tenmonhoc', 'mahelop', name='UC_MonHoc_HeLop'),
    )
