from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.yeucautimgiasu_model import YeuCauTimGiaSu
from app.schemas.yeucautimgiasu_schema import YeuCauTimGiaSu_Schema, Create_YeuCauTimGiaSu_Schema,Update_TrangThai_YeuCau_Schema

yeucautimgiasu_router = APIRouter()

@yeucautimgiasu_router.get("/danhsachyeucautimgiasu", tags=["yeucautimgiasu"], description="Danh sách yêu cầu tìm gia sư", response_model=DataResponse[List[YeuCauTimGiaSu_Schema]])
async def get_danhsachyeucautimgiasu(db: Session = Depends(get_db)):
    yeucaus = db.query(YeuCauTimGiaSu).all()
    return DataResponse.success_response(yeucaus)

@yeucautimgiasu_router.get("/yeucautimgiasu/{id}", tags=["yeucautimgiasu"], description="Lấy 1 yêu cầu tìm gia sư", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def get_yeucautimgiasu(id: int, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()
    if not yeucau:
        return DataResponse.custom_response(code="404", message="Không tìm thấy yêu cầu", data=None)
    return DataResponse.success_response(yeucau)

@yeucautimgiasu_router.post("/themyeucautimgiasu", tags=["yeucautimgiasu"], description="Tạo yêu cầu tìm gia sư", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def create_yeucautimgiasu(data: Create_YeuCauTimGiaSu_Schema, db: Session = Depends(get_db)):
    yeucau = YeuCauTimGiaSu(**data.model_dump())
    try:
        db.add(yeucau)
        db.commit()
        db.refresh(yeucau)
        return DataResponse.success_response(yeucau)
    except:
        return DataResponse.custom_response(code="400", message="Lỗi", data=None)

@yeucautimgiasu_router.put("/suayeucautimgiasu/{id}", tags=["yeucautimgiasu"], description="Sửa yêu cầu tìm gia sư", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def update_yeucautimgiasu(id: int, data: Create_YeuCauTimGiaSu_Schema, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()
    if not yeucau:
        return DataResponse.custom_response(code="404", message="Không tìm thấy yêu cầu", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(yeucau, key, value)
    db.commit()
    db.refresh(yeucau)
    return DataResponse.success_response(yeucau)
@yeucautimgiasu_router.patch("/capnhattrangthaiyeucau/{id}", tags=["yeucautimgiasu"], description="Cập nhật nhanh trạng thái yêu cầu", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def update_trangthai_yeucautimgiasu(id: int, data: Update_TrangThai_YeuCau_Schema, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()

    if not yeucau:
        return DataResponse.custom_response(code="404", message="Không tìm thấy yêu cầu", data=None)

    # Chỉ cập nhật đúng cột trangthai
    yeucau.trangthai = data.trangthai
    db.commit()
    db.refresh(yeucau)

    return DataResponse.success_response(yeucau)

@yeucautimgiasu_router.delete("/xoayeucautimgiasu/{id}", tags=["yeucautimgiasu"], description="Xóa yêu cầu tìm gia sư", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def delete_yeucautimgiasu(id: int, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()
    if not yeucau:
        return DataResponse.custom_response(code="404", message="Không tìm thấy yêu cầu", data=None)
    db.delete(yeucau)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=yeucau)

