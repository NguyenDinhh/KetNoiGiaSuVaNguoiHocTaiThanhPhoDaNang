from sqlalchemy import Column, String, Integer, ForeignKey, text
from app.models.base_model import Base

class YeuCauHocVien(Base):
    __tablename__ = "YEUCAU_HOCVIEN"

    mayeucau_hocvien = Column(String(10), primary_key=True, server_default=text("''"))
    mahocvien = Column(String(10), ForeignKey("HOCVIEN.mahocvien"), nullable=False)
    mayeucau = Column(String(10), ForeignKey("YEUCAUTIMGIASU.mayeucau"), nullable=False)
    madangky = Column(String(10), ForeignKey("DANGKYLICH.madangky"))
