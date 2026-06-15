from fastapi import APIRouter,Depends
from app.db.base import get_db
from sqlalchemy.orm import Session
from app.models.bangcap_model import BangCap
from app.schemas.bangcap_schema import BangCap_Schema, Create_BangCap_Schema, Update_BangCap_Schema
from app.schemas.base_schema import DataResponse
from typing import List

bangcap_router = APIRouter()

@bangcap_router.get("/danhsachbangcap", tags=["bangcap"], description= "Danh sách bằng cấp", response_model=DataResponse[List[BangCap_Schema]])
async def get_danhsachbangcap(db: Session = Depends(get_db)):
    bangcaps = db.query(BangCap).order_by(BangCap.mabangcap).all()
    return DataResponse.success_response(bangcaps)

@bangcap_router.get("/bangcap/{id}", tags=["bangcap"], description= "Lấy 1 bằng cấp", response_model=DataResponse[BangCap_Schema])
async def get_danhsachbangcap(id: str,db: Session = Depends(get_db)):
    bangcap = db.query(BangCap).filter(BangCap.mabangcap == id).first()
    if not bangcap:
        return DataResponse.custom_response(code="404", message="Lỗi", data=None)
    return DataResponse.success_response(bangcap)

@bangcap_router.post("/thembangcap", tags=["bangcap"], description= "Thêm mới bằng cấp", response_model=DataResponse[BangCap_Schema])
async def create_bancap(data: Create_BangCap_Schema, db: Session = Depends(get_db)):
    try:
        bangcap = BangCap(mabangcap="", **data.model_dump())
        db.add(bangcap)
        db.commit()
        
        bangcap_moi = db.query(BangCap).order_by(BangCap.mabangcap.desc()).first()
        return DataResponse.success_response(bangcap_moi)
    except Exception as e:
        db.rollback()
        print(f"Lỗi thêm bằng cấp: {str(e)}")
        return DataResponse.custom_response(code="500", message="Thêm bằng cấp thất bại", data=None)

@bangcap_router.put("/suabangcap/{id}", tags=["bangcap"], description= "Sửa bằng cấp", response_model=DataResponse[BangCap_Schema])
async def update_bangcap(id: str,  data: Update_BangCap_Schema,db: Session = Depends(get_db)):
    bangcap = db.query(BangCap).filter(BangCap.mabangcap == id).first()
    if not bangcap:
        return DataResponse.custom_response(code="404", message="Lỗi", data= None)
    update = data.model_dump(exclude_unset=True)
    for key, value in update.items():
        setattr(bangcap, key,value)
    db.commit()
    db.refresh(bangcap)
    return DataResponse.success_response(bangcap)

@bangcap_router.put("/khoabangcap/{id}", tags=["bangcap"], description="Khóa bằng cấp (trangthai = 0)", response_model=DataResponse[BangCap_Schema])
async def lock_bangcap(id: str, db: Session = Depends(get_db)):
    bangcap = db.query(BangCap).filter(BangCap.mabangcap == id).first()
    if not bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy bằng cấp", data=None)
    bangcap.trangthai = 0
    db.commit()
    db.refresh(bangcap)
    return DataResponse.success_response(bangcap)

@bangcap_router.put("/mokhoabangcap/{id}", tags=["bangcap"], description="Mở khóa bằng cấp (trangthai = 1)", response_model=DataResponse[BangCap_Schema])
async def unlock_bangcap(id: str, db: Session = Depends(get_db)):
    bangcap = db.query(BangCap).filter(BangCap.mabangcap == id).first()
    if not bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy bằng cấp", data=None)
    bangcap.trangthai = 1
    db.commit()
    db.refresh(bangcap)
    return DataResponse.success_response(bangcap)

@bangcap_router.delete("/xoabangcap/{id}", tags=["bangcap"], description= "Xóa bằng cấp", response_model=DataResponse[BangCap_Schema])
async def delete_bangcap(id: str,db: Session = Depends(get_db)):
    bangcap = db.query(BangCap).filter(BangCap.mabangcap == id).first()
    if not bangcap:
        return DataResponse.custom_response(code="404", message="Lỗi", data= None)
    db.delete(bangcap)
    db.commit()
    return DataResponse.success_response(bangcap)
