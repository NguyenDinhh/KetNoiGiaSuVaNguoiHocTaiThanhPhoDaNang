from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.giasu_bangcap_model import GiaSuBangCap
from app.schemas.giasu_bangcap_schema import GiaSuBangCap_Schema, Create_GiaSuBangCap_Schema

giasu_bangcap_router = APIRouter()

@giasu_bangcap_router.get("/danhsachgiasubangcap", tags=["giasu_bangcap"], description="Danh sách bằng cấp gia sư", response_model=DataResponse[List[GiaSuBangCap_Schema]])
async def get_danhsachgiasubangcap(db: Session = Depends(get_db)):
    giasu_bangcaps = db.query(GiaSuBangCap).all()
    return DataResponse.success_response(giasu_bangcaps)

@giasu_bangcap_router.get("/giasubangcap/{id}", tags=["giasu_bangcap"], description="Lấy 1 bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def get_giasubangcap(id: int, db: Session = Depends(get_db)):
    giasu_bangcap = db.query(GiaSuBangCap).filter(GiaSuBangCap.mabangcapgiasu == id).first()
    if not giasu_bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(giasu_bangcap)

@giasu_bangcap_router.post("/themgiasubangcap", tags=["giasu_bangcap"], description="Thêm bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def create_giasubangcap(data: Create_GiaSuBangCap_Schema, db: Session = Depends(get_db)):
    giasu_bangcap = GiaSuBangCap(**data.model_dump())
    try:
        db.add(giasu_bangcap)
        db.commit()
        db.refresh(giasu_bangcap)
        return DataResponse.success_response(giasu_bangcap)
    except:
        return DataResponse.custom_response(code="400", message="Lỗi", data=None)

@giasu_bangcap_router.put("/suagiasubangcap/{id}", tags=["giasu_bangcap"], description="Sửa bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def update_giasubangcap(id: int, data: Create_GiaSuBangCap_Schema, db: Session = Depends(get_db)):
    giasu_bangcap = db.query(GiaSuBangCap).filter(GiaSuBangCap.mabangcapgiasu == id).first()
    if not giasu_bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(giasu_bangcap, key, value)
    db.commit()
    db.refresh(giasu_bangcap)
    return DataResponse.success_response(giasu_bangcap)

@giasu_bangcap_router.delete("/xoagiasubangcap/{id}", tags=["giasu_bangcap"], description="Xóa bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def delete_giasubangcap(id: int, db: Session = Depends(get_db)):
    giasu_bangcap = db.query(GiaSuBangCap).filter(GiaSuBangCap.mabangcapgiasu == id).first()
    if not giasu_bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(giasu_bangcap)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=giasu_bangcap)
