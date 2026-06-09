from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.khuvuc_model import KhuVuc
from app.schemas.khuvuc_schema import KhuVuc_Schema, Create_KhuVuc_Schema
from typing import List
khuvuc_router = APIRouter()

@khuvuc_router.get("/danhsachkhuvuc",tags=["khuvuc"],description="Danh sách khu vực", response_model= DataResponse[List[KhuVuc_Schema]])
async def get_danhsachkhuvuc(db: Session =  Depends(get_db)):
    khuvucs = db.query(KhuVuc).order_by(KhuVuc.makhuvuc).all()
    return DataResponse.success_response(khuvucs)

@khuvuc_router.get("/khuvuc/{id}",tags=["khuvuc"],description="Lấy 1 khu vực", response_model= DataResponse[KhuVuc_Schema])
async def get_khuvuc(id: int, db: Session =  Depends(get_db)):
    khuvuc = db.query(KhuVuc).filter(KhuVuc.makhuvuc == id).first()
    return DataResponse.success_response(khuvuc)

@khuvuc_router.post("/themkhuvuc", tags=["khuvuc"], description= "Thêm khu vực mới", response_model = DataResponse[KhuVuc_Schema])
async def create_khuvuc(data: Create_KhuVuc_Schema, db: Session = Depends(get_db)):
    khuvuc= KhuVuc(
    tenkhuvuc = data.tenkhuvuc
    )
    try:
        db.add(khuvuc)
        db.commit()
        db.refresh(khuvuc)
        return DataResponse.success_response(khuvuc)
    except:
        return DataResponse.custom_response(code="400",message="Lỗi", data=None)

@khuvuc_router.put("/suakhuvuc/{id}", tags=["khuvuc"], description="Sửa tên khu vực", response_model= DataResponse[KhuVuc_Schema])
async def update_khuvuc(id: int, data: Create_KhuVuc_Schema, db: Session = Depends(get_db)):
    khuvuc = db.query(KhuVuc).filter(KhuVuc.makhuvuc == id).first()
    if not khuvuc:
        return DataResponse.custom_response(code="404",message="Không tìm thấy khu vực", data= None)
    update_data = data.model_dump(exclude_unset= True)
    for key, value in update_data.items():
        setattr(khuvuc,key,value)
    db.commit()
    db.refresh(khuvuc)
    return DataResponse.success_response(khuvuc)

@khuvuc_router.delete("/xoakhuvuc/{id}", tags=["khuvuc"], description= "Xóa khu vực", response_model=DataResponse[KhuVuc_Schema])
async def delete_khuvuc(id: int, db: Session = Depends(get_db)):
    khuvuc = db.query(KhuVuc).filter(KhuVuc.makhuvuc == id).first()
    if not khuvuc:
        return DataResponse.custom_response(code="404", message="Không tìm tháy khu vực", data= None)
    db.delete(khuvuc)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=khuvuc)
