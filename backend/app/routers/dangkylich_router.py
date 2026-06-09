from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.dangkylich_model import DangKyLich
# 🟢 Import thêm Update_DangKyLich_Schema
from app.schemas.dangkylich_schema import DangKyLich_Schema, Create_DangKyLich_Schema, Update_DangKyLich_Schema

dangkylich_router = APIRouter()

@dangkylich_router.get("/danhsachdangkylich", tags=["dangkylich"], description="Danh sách đăng ký lịch", response_model=DataResponse[List[DangKyLich_Schema]])
async def get_danhsachdangkylich(db: Session = Depends(get_db)):
    dangkylichs = db.query(DangKyLich).all()
    return DataResponse.success_response(dangkylichs)

@dangkylich_router.get("/dangkylich/{id}", tags=["dangkylich"], description="Lấy 1 đăng ký lịch", response_model=DataResponse[DangKyLich_Schema])
async def get_dangkylich(id: int, db: Session = Depends(get_db)):
    dangkylich = db.query(DangKyLich).filter(DangKyLich.madangky == id).first()
    if not dangkylich:
        return DataResponse.custom_response(code="404", message="Không tìm thấy đăng ký lịch", data=None)
    return DataResponse.success_response(dangkylich)

@dangkylich_router.post("/themdangkylich", tags=["dangkylich"], description="Thêm đăng ký lịch", response_model=DataResponse[DangKyLich_Schema])
async def create_dangkylich(data: Create_DangKyLich_Schema, db: Session = Depends(get_db)):
    try:
        dangkylich = DangKyLich(**data.model_dump())
        db.add(dangkylich)
        db.commit()
        db.refresh(dangkylich)
        return DataResponse.success_response(dangkylich)
    except Exception as e:
        db.rollback() # Bắt buộc phải rollback để Database không bị kẹt
        print("❌ LỖI DATABASE KHI THÊM:", e) # In ra Terminal đen để ông biết bị sao
        return DataResponse.custom_response(code="400", message=str(e), data=None)

# 🟢 ĐÃ SỬA data: Update_DangKyLich_Schema Ở DÒNG DƯỚI NÀY
@dangkylich_router.put("/suadangkylich/{id}", tags=["dangkylich"], description="Sửa đăng ký lịch", response_model=DataResponse[DangKyLich_Schema])
async def update_dangkylich(id: int, data: Update_DangKyLich_Schema, db: Session = Depends(get_db)):
    try:
        dangkylich = db.query(DangKyLich).filter(DangKyLich.madangky == id).first()
        if not dangkylich:
            return DataResponse.custom_response(code="404", message="Không tìm thấy đăng ký lịch", data=None)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(dangkylich, key, value)

        db.commit()
        db.refresh(dangkylich)
        return DataResponse.success_response(dangkylich)
    except Exception as e:
        db.rollback()
        print("❌ LỖI DATABASE KHI SỬA:", e)
        return DataResponse.custom_response(code="400", message=str(e), data=None)

@dangkylich_router.delete("/xoadangkylich/{id}", tags=["dangkylich"], description="Xóa đăng ký lịch", response_model=DataResponse[DangKyLich_Schema])
async def delete_dangkylich(id: int, db: Session = Depends(get_db)):
    dangkylich = db.query(DangKyLich).filter(DangKyLich.madangky == id).first()
    if not dangkylich:
        return DataResponse.custom_response(code="404", message="Không tìm thấy đăng ký lịch", data=None)
    db.delete(dangkylich)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=dangkylich)
