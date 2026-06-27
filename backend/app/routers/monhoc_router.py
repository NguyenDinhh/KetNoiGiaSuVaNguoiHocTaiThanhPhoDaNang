from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.monhoc_model import MonHoc
from app.schemas.monhoc_schema import MonHoc_Schema, Create_MonHoc_Schema

monhoc_router = APIRouter()

@monhoc_router.get("/danhsachmonhoc", tags=["monhoc"], description="Danh sách môn học", response_model=DataResponse[List[MonHoc_Schema]])
async def get_danhsachmonhoc(db: Session = Depends(get_db)):
    monhocs = db.query(MonHoc).all()
    return DataResponse.success_response(monhocs)

@monhoc_router.get("/monhoc/{id}", tags=["monhoc"], description="Lấy 1 môn học", response_model=DataResponse[MonHoc_Schema])
async def get_monhoc(id: str, db: Session = Depends(get_db)):
    monhoc = db.query(MonHoc).filter(MonHoc.mamonhoc == id).first()
    if not monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy môn học", data=None)
    return DataResponse.success_response(monhoc)

@monhoc_router.get("/monhoc/theolop/{mahelop}", tags=["monhoc"], description="Lấy danh sách môn học theo mã hệ lớp", response_model=DataResponse[List[MonHoc_Schema]])
async def lay_mon_hoc_theo_lop(mahelop: str, db: Session = Depends(get_db)):
    try:
        danh_sach = db.query(MonHoc).filter(MonHoc.mahelop == mahelop).all()
        return DataResponse.success_response(danh_sach)
    except Exception as e:
        return DataResponse.custom_response(code="500", message=f"Lỗi hệ thống: {str(e)}", data=None)

@monhoc_router.post("/themmonhoc", tags=["monhoc"], description="Thêm môn học mới", response_model=DataResponse[MonHoc_Schema])
async def create_monhoc(data: Create_MonHoc_Schema, db: Session = Depends(get_db)):
    try:
        monhoc = MonHoc(mamonhoc="", **data.model_dump())
        db.add(monhoc)
        db.commit()
        
        monhoc_moi = db.query(MonHoc).order_by(MonHoc.mamonhoc.desc()).first()
        return DataResponse.success_response(monhoc_moi)
    except Exception as e:
        db.rollback()
        print(f"Lỗi thêm môn học: {str(e)}")
        return DataResponse.custom_response(code="500", message="Thêm môn học thất bại", data=None)

@monhoc_router.put("/suamonhoc/{id}", tags=["monhoc"], description="Sửa thông tin môn học", response_model=DataResponse[MonHoc_Schema])
async def update_monhoc(id: str, data: Create_MonHoc_Schema, db: Session = Depends(get_db)):
    monhoc = db.query(MonHoc).filter(MonHoc.mamonhoc == id).first()
    if not monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy môn học", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(monhoc, key, value)
    db.commit()
    return DataResponse.success_response(monhoc)

@monhoc_router.delete("/xoamonhoc/{id}", tags=["monhoc"], description="Xóa môn học", response_model=DataResponse[MonHoc_Schema])
async def delete_monhoc(id: str, db: Session = Depends(get_db)):
    monhoc = db.query(MonHoc).filter(MonHoc.mamonhoc == id).first()
    if not monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy môn học", data=None)
    db.delete(monhoc)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=monhoc)
