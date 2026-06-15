from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint, text
from app.models.base_model import Base

class BangCapMonHoc(Base):
    __tablename__ = "BANGCAP_MONHOC"

    mabangcap_monhoc = Column(String(10), primary_key=True, server_default=text("''"))
    mabangcap = Column(String(10), ForeignKey("BANGCAP.mabangcap", ondelete="CASCADE"), nullable=False)
    mamonhoc = Column(String(10), ForeignKey("MONHOC.mamonhoc", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint('mabangcap', 'mamonhoc', name='UC_BangCap_Mon'),
    )
