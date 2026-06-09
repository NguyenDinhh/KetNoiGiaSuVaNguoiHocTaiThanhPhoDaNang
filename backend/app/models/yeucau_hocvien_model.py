from sqlalchemy import Column, Integer, ForeignKey
from app.models.base_model import Base

class YeuCauHocVien(Base):
    __tablename__ = "YEUCAU_HOCVIEN"

    mayeucau_hocvien = Column(Integer, primary_key=True, autoincrement=True)
    mahocvien = Column(Integer, ForeignKey("HOCVIEN.mahocvien"), nullable=False)
    mayeucau = Column(Integer, ForeignKey("YEUCAUTIMGIASU.mayeucau"), nullable=False)
    madangky = Column(Integer, ForeignKey("DANGKYLICH.madangky"))
