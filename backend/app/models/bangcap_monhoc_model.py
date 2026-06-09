from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.models.base_model import Base

class BangCapMonHoc(Base):
    __tablename__ = "BANGCAP_MONHOC"

    mabangcap_monhoc = Column(Integer, primary_key=True, autoincrement=True)
    mabangcap = Column(Integer, ForeignKey("BANGCAP.mabangcap", ondelete="CASCADE"), nullable=False)
    mamonhoc = Column(Integer, ForeignKey("MONHOC.mamonhoc", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint('mabangcap', 'mamonhoc', name='UC_BangCap_Mon'),
    )
