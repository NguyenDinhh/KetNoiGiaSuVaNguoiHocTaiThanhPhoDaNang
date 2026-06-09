from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.hocvien_model import HocVien
from app.schemas.hocvien_schema import HocVien_Schema, Create_HocVien_Schema

hocvien_router = APIRouter()

@hocvien_router.get("/danhsachhocvien", tags=["hocvien"], description="Danh sách học viên", response_model=DataResponse[List[HocVien_Schema]])
async def get_danhsachhocvien(db: Session = Depends(get_db)):
    hocviens = db.query(HocVien).all()
    return DataResponse.success_response(hocviens)

@hocvien_router.get("/hocvien/{id}", tags=["hocvien"], description="Lấy 1 học viên", response_model=DataResponse[HocVien_Schema])
async def get_hocvien(id: int, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    return DataResponse.success_response(hocvien)

@hocvien_router.post("/themhocvien", tags=["hocvien"], description="Thêm học viên mới", response_model=DataResponse[HocVien_Schema])
async def create_hocvien(data: Create_HocVien_Schema, db: Session = Depends(get_db)):
    hocvien = HocVien(**data.model_dump())
    try:
        db.add(hocvien)
        db.commit()
        db.refresh(hocvien)
        return DataResponse.success_response(hocvien)
    except:
        return DataResponse.custom_response(code="400", message="Lỗi", data=None)

@hocvien_router.put("/suahocvien/{id}", tags=["hocvien"], description="Sửa thông tin học viên", response_model=DataResponse[HocVien_Schema])
async def update_hocvien(id: int, data: Create_HocVien_Schema, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(hocvien, key, value)
    db.commit()
    db.refresh(hocvien)
    return DataResponse.success_response(hocvien)

@hocvien_router.delete("/xoahocvien/{id}", tags=["hocvien"], description="Xóa học viên", response_model=DataResponse[HocVien_Schema])
async def delete_hocvien(id: int, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    db.delete(hocvien)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=hocvien)
