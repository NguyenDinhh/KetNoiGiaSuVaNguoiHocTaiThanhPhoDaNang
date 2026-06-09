from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.bangcap_monhoc_model import BangCapMonHoc
from app.schemas.bangcap_monhoc_schema import BangCapMonHoc_Schema, Create_BangCapMonHoc_Schema

bangcap_monhoc_router = APIRouter()

@bangcap_monhoc_router.get("/danhsachbangcapmonhoc", tags=["bangcap_monhoc"], description="Danh sách bằng cấp môn học", response_model=DataResponse[List[BangCapMonHoc_Schema]])
async def get_danhsachbangcapmonhoc(db: Session = Depends(get_db)):
    bangcap_monhocs = db.query(BangCapMonHoc).all()
    return DataResponse.success_response(bangcap_monhocs)

@bangcap_monhoc_router.get("/bangcapmonhoc/{id}", tags=["bangcap_monhoc"], description="Lấy 1 bằng cấp môn học", response_model=DataResponse[BangCapMonHoc_Schema])
async def get_bangcapmonhoc(id: int, db: Session = Depends(get_db)):
    bangcap_monhoc = db.query(BangCapMonHoc).filter(BangCapMonHoc.mabangcap_monhoc == id).first()
    if not bangcap_monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(bangcap_monhoc)

@bangcap_monhoc_router.post("/thembangcapmonhoc", tags=["bangcap_monhoc"], description="Thêm bằng cấp môn học", response_model=DataResponse[BangCapMonHoc_Schema])
async def create_bangcapmonhoc(data: Create_BangCapMonHoc_Schema, db: Session = Depends(get_db)):
    bangcap_monhoc = BangCapMonHoc(**data.model_dump())
    try:
        db.add(bangcap_monhoc)
        db.commit()
        db.refresh(bangcap_monhoc)
        return DataResponse.success_response(bangcap_monhoc)
    except:
        return DataResponse.custom_response(code="400", message="Lỗi", data=None)

@bangcap_monhoc_router.delete("/xoabangcapmonhoc/{id}", tags=["bangcap_monhoc"], description="Xóa bằng cấp môn học", response_model=DataResponse[BangCapMonHoc_Schema])
async def delete_bangcapmonhoc(id: int, db: Session = Depends(get_db)):
    bangcap_monhoc = db.query(BangCapMonHoc).filter(BangCapMonHoc.mabangcap_monhoc == id).first()
    if not bangcap_monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(bangcap_monhoc)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=bangcap_monhoc)
