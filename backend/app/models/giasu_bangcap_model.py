from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.models.base_model import Base

class GiaSuBangCap(Base):
    __tablename__ = "GIASU_BANGCAP"

    mabangcapgiasu = Column(Integer, primary_key=True, autoincrement=True)
    magiasu = Column(Integer, ForeignKey("GIASU.magiasu", ondelete="CASCADE"), nullable=False)
    mabangcap = Column(Integer, ForeignKey("BANGCAP.mabangcap"), nullable=False)
    chuyennganh = Column(String(100))
    namtotnghiep = Column(Integer)
    cosodaotao = Column(String(100))
    anhbangcap = Column(String(255), nullable=False)
    trangthaiduyet = Column(Integer, default=0)
    ngayduyet = Column(DateTime)
