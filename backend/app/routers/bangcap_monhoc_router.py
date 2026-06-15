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
async def get_bangcapmonhoc(id: str, db: Session = Depends(get_db)):
    bangcap_monhoc = db.query(BangCapMonHoc).filter(BangCapMonHoc.mabangcap_monhoc == id).first()
    if not bangcap_monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(bangcap_monhoc)

@bangcap_monhoc_router.post("/thembangcapmonhoc", tags=["bangcap_monhoc"], description="Thêm bằng cấp môn học", response_model=DataResponse[BangCapMonHoc_Schema])
async def create_bangcapmonhoc(data: Create_BangCapMonHoc_Schema, db: Session = Depends(get_db)):
    try:
        bangcap_monhoc = BangCapMonHoc(mabangcap_monhoc="", **data.model_dump())
        db.add(bangcap_monhoc)
        db.commit()
        
        bangcap_monhoc_da_tao = db.query(BangCapMonHoc).filter(
            BangCapMonHoc.mabangcap == data.mabangcap,
            BangCapMonHoc.mamonhoc == data.mamonhoc
        ).order_by(BangCapMonHoc.mabangcap_monhoc.desc()).first()
        
        if not bangcap_monhoc_da_tao:
            return DataResponse.custom_response(code="500", message="Không tìm thấy bằng cấp môn học vừa tạo", data=None)
        
        return DataResponse.success_response(bangcap_monhoc_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return DataResponse.custom_response(code="400", message=str(e), data=None)

@bangcap_monhoc_router.delete("/xoabangcapmonhoc/{id}", tags=["bangcap_monhoc"], description="Xóa bằng cấp môn học", response_model=DataResponse[BangCapMonHoc_Schema])
async def delete_bangcapmonhoc(id: str, db: Session = Depends(get_db)):
    bangcap_monhoc = db.query(BangCapMonHoc).filter(BangCapMonHoc.mabangcap_monhoc == id).first()
    if not bangcap_monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(bangcap_monhoc)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=bangcap_monhoc)
