from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.chitietyeucau_model import ChiTietYeuCau
from app.schemas.chitietyeucau_schema import ChiTietYeuCau_Schema, Create_ChiTietYeuCau_Schema

chitietyeucau_router = APIRouter()

@chitietyeucau_router.get("/danhsachchitietyeucau", tags=["chitietyeucau"], description="Danh sách chi tiết yêu cầu", response_model=DataResponse[List[ChiTietYeuCau_Schema]])
async def get_danhsachchitietyeucau(db: Session = Depends(get_db)):
    chitietyeucaus = db.query(ChiTietYeuCau).all()
    return DataResponse.success_response(chitietyeucaus)

@chitietyeucau_router.get("/chitietyeucau/{id}", tags=["chitietyeucau"], description="Lấy 1 chi tiết yêu cầu", response_model=DataResponse[ChiTietYeuCau_Schema])
async def get_chitietyeucau(id: int, db: Session = Depends(get_db)):
    chitiet = db.query(ChiTietYeuCau).filter(ChiTietYeuCau.machitietyeucau == id).first()
    if not chitiet:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(chitiet)

@chitietyeucau_router.post("/themchitietyeucau", tags=["chitietyeucau"], description="Thêm chi tiết yêu cầu", response_model=DataResponse[ChiTietYeuCau_Schema])
async def create_chitietyeucau(data: Create_ChiTietYeuCau_Schema, db: Session = Depends(get_db)):
    chitiet = ChiTietYeuCau(**data.model_dump())
    try:
        db.add(chitiet)
        db.commit()
        db.refresh(chitiet)
        return DataResponse.success_response(chitiet)
    except:
        return DataResponse.custom_response(code="400", message="Lỗi", data=None)

@chitietyeucau_router.put("/suachitietyeucau/{id}", tags=["chitietyeucau"], description="Sửa chi tiết yêu cầu", response_model=DataResponse[ChiTietYeuCau_Schema])
async def update_chitietyeucau(id: int, data: Create_ChiTietYeuCau_Schema, db: Session = Depends(get_db)):
    chitiet = db.query(ChiTietYeuCau).filter(ChiTietYeuCau.machitietyeucau == id).first()
    if not chitiet:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(chitiet, key, value)
    db.commit()
    db.refresh(chitiet)
    return DataResponse.success_response(chitiet)

@chitietyeucau_router.delete("/xoachitietyeucau/{id}", tags=["chitietyeucau"], description="Xóa chi tiết yêu cầu", response_model=DataResponse[ChiTietYeuCau_Schema])
async def delete_chitietyeucau(id: int, db: Session = Depends(get_db)):
    chitiet = db.query(ChiTietYeuCau).filter(ChiTietYeuCau.machitietyeucau == id).first()
    if not chitiet:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(chitiet)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=chitiet)
