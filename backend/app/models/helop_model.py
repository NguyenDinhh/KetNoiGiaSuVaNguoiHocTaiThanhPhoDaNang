from sqlalchemy import Column, Integer, String, text
from app.models.base_model import Base

class HeLop(Base):
    __tablename__ = "HELOP"

    mahelop = Column(String(10), primary_key=True, server_default=text("''"))
    tenhelop = Column(String(255), nullable=False, unique=True)
    mota = Column(String(1000))
    trangthai = Column(Integer, default=1)  # 1: Hoạt động, 0: Ngưng áp dụng
