from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, text
from app.models.base_model import Base

class GiaSuBangCap(Base):
    __tablename__ = "GIASU_BANGCAP"

    mabangcapgiasu = Column(String(10), primary_key=True, server_default=text("''"))
    magiasu = Column(String(10), ForeignKey("GIASU.magiasu", ondelete="CASCADE"), nullable=False)
    mabangcap = Column(String(10), ForeignKey("BANGCAP.mabangcap"), nullable=False)
    chuyennganh = Column(String(100))
    namtotnghiep = Column(Integer)
    cosodaotao = Column(String(100))
    anhbangcap = Column(String(255), nullable=False)
    trangthaiduyet = Column(Integer, default=0)
    ngayduyet = Column(DateTime)
