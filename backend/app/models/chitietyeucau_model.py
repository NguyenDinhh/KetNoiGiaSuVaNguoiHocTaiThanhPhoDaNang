from sqlalchemy import Column, Integer, String, Time, ForeignKey, CheckConstraint
from app.models.base_model import Base

class ChiTietYeuCau(Base):
    __tablename__ = "CHITIETYEUCAU"

    machitietyeucau = Column(Integer, primary_key=True, autoincrement=True)
    mayeucau = Column(Integer, ForeignKey("YEUCAUTIMGIASU.mayeucau", ondelete="CASCADE"), nullable=False)
    ngayhoc = Column(String(10))
    thoigianbatdau = Column(Time)
    thoigianketthuc = Column(Time)
    ghichu = Column(String(1000))

    __table_args__ = (
        CheckConstraint('thoigianketthuc > thoigianbatdau', name='CHK_GioHoc'),
    )
