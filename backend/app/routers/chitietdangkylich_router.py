from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.chitietdangkylich_model import ChiTietDangKyLich
from app.schemas.chitietdangkylich_schema import ChiTietDangKyLich_Schema, Create_ChiTietDangKyLich_Schema

chitietdangkylich_router = APIRouter()

@chitietdangkylich_router.get("/danhsachchitietdangkylich", tags=["chitietdangkylich"], description="Danh sách chi tiết đăng ký lịch", response_model=DataResponse[List[ChiTietDangKyLich_Schema]])
async def get_danhsachchitietdangkylich(db: Session = Depends(get_db)):
    chitietdangkylichs = db.query(ChiTietDangKyLich).all()
    return DataResponse.success_response(chitietdangkylichs)

@chitietdangkylich_router.get("/chitietdangkylich/{id}", tags=["chitietdangkylich"], description="Lấy 1 chi tiết đăng ký lịch", response_model=DataResponse[ChiTietDangKyLich_Schema])
async def get_chitietdangkylich(id: str, db: Session = Depends(get_db)):
    chitiet = db.query(ChiTietDangKyLich).filter(ChiTietDangKyLich.machitietdangky == id).first()
    if not chitiet:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(chitiet)

@chitietdangkylich_router.post("/themchitietdangkylich", tags=["chitietdangkylich"], description="Thêm chi tiết đăng ký lịch", response_model=DataResponse[ChiTietDangKyLich_Schema])
async def create_chitietdangkylich(data: Create_ChiTietDangKyLich_Schema, db: Session = Depends(get_db)):
    try:
        chitiet = ChiTietDangKyLich(machitietdangky="", **data.model_dump())
        db.add(chitiet)
        db.commit()
        
        chitiet_da_tao = db.query(ChiTietDangKyLich).filter(
            ChiTietDangKyLich.madangky == data.madangky,
            ChiTietDangKyLich.mamonhoc == data.mamonhoc
        ).order_by(ChiTietDangKyLich.machitietdangky.desc()).first()
        
        if not chitiet_da_tao:
            return DataResponse.custom_response(code="500", message="Không tìm thấy chi tiết vừa tạo", data=None)
        
        return DataResponse.success_response(chitiet_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return DataResponse.custom_response(code="400", message=str(e), data=None)

@chitietdangkylich_router.put("/suachitietdangkylich/{id}", tags=["chitietdangkylich"], description="Sửa chi tiết đăng ký lịch", response_model=DataResponse[ChiTietDangKyLich_Schema])
async def update_chitietdangkylich(id: str, data: Create_ChiTietDangKyLich_Schema, db: Session = Depends(get_db)):
    try:
        chitiet = db.query(ChiTietDangKyLich).filter(ChiTietDangKyLich.machitietdangky == id).first()
        if not chitiet:
            return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(chitiet, key, value)

        db.commit()
        return DataResponse.success_response(chitiet)
    except Exception as e:
        db.rollback()
        print("❌ LỖI DATABASE KHI SỬA CHI TIẾT:", e)
        return DataResponse.custom_response(code="400", message=str(e), data=None)

@chitietdangkylich_router.delete("/xoachitietdangkylich/{id}", tags=["chitietdangkylich"], description="Xóa chi tiết đăng ký lịch", response_model=DataResponse[ChiTietDangKyLich_Schema])
async def delete_chitietdangkylich(id: str, db: Session = Depends(get_db)):
    chitiet = db.query(ChiTietDangKyLich).filter(ChiTietDangKyLich.machitietdangky == id).first()
    if not chitiet:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(chitiet)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=chitiet)
