from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.base_schema import DataResponse
from app.models.giasu_model import GiaSu
from app.schemas.giasu_schema import GiaSu_Schema, Create_GiaSu_Schema, Update_GiaSu_Schema
giasu_router = APIRouter()

@giasu_router.get("/danhsachgiasu", tags=["giasu"], description="Danh sách gia sư", response_model= DataResponse[List[GiaSu_Schema]])
async def get_danhsachgiasu(db: Session = Depends(get_db)):
    giasus = db.query(GiaSu).all()
    return DataResponse.success_response(giasus)
@giasu_router.get("/giasu/{id}" , tags= ["giasu"], description="Tìm 1 gia sư", response_model=DataResponse[GiaSu_Schema])
async def get_giasu(id: int, db: Session = Depends(get_db)):
    giasu = db.query(GiaSu).filter(GiaSu.magiasu == id).first()
    if not giasu:
        return DataResponse.custom_response(code="404", message="Không tìm thấy gia sư", data=None)
    return DataResponse.success_response(giasu)
@giasu_router.get("/giasuvoimanguoidung/{id}" , tags= ["giasu"], description="Tìm 1 gia sư", response_model=DataResponse[GiaSu_Schema])
async def get_giasuvoimanguoidung(id: int, db: Session = Depends(get_db)):
    giasu = db.query(GiaSu).filter(GiaSu.manguoidung == id).first()
    if not giasu:
        return DataResponse.custom_response(code="404", message="Không tìm thấy gia sư", data=None)
    return DataResponse.success_response(giasu)

@giasu_router.post("/themgiasu",tags=["giasu"], description="Thêm mới gia sư", response_model=DataResponse[GiaSu_Schema])
async def create_giasu(data: Create_GiaSu_Schema, db: Session = Depends(get_db)):
    giasu = GiaSu(**data.model_dump())
    try:
        db.add(giasu)
        db.commit()
        db.refresh(giasu)
        return DataResponse.success_response(data=giasu)
    except:
        return DataResponse.custom_response(code="400", message="Lỗi", data=None)

@giasu_router.put("/suagiasu/{id}",tags=["giasu"],description="Sửa thông tin gia sư", response_model=DataResponse[GiaSu_Schema])
async def update_giasu(id: int, data: Update_GiaSu_Schema, db:Session = Depends(get_db)):
    giasu = db.query(GiaSu).filter(GiaSu.magiasu == id).first()
    if not giasu:
        return DataResponse.custom_response(code="404",message="Không tìm thấy", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(giasu, key, value)
    db.commit()
    db.refresh(giasu)
    return DataResponse.success_response(giasu)

@giasu_router.delete("/xoagiasu/{id}", tags=["giasu"],description="Xóa giasu", response_model=DataResponse[GiaSu_Schema])
async def delete_giasu(id: int, db: Session = Depends(get_db)):
    giasu = db.query(GiaSu).filter(GiaSu.magiasu == id).first()
    if not giasu:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(giasu)
    db.commit()
    return DataResponse.success_response(giasu)
