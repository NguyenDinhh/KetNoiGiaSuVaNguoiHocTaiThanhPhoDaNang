from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.yeucau_hocvien_model import YeuCauHocVien
from app.schemas.yeucau_hocvien_schema import (
    YeuCauHocVien_Schema,
    Create_YeuCauHocVienVoiMaYeuCau_Schema,
    Create_YeuCauHocVienVoiMaDangKy_Schema
)

yeucau_hocvien_router = APIRouter()

@yeucau_hocvien_router.get("/danhsachyeucauhocvien", tags=["yeucau_hocvien"], description="Danh sách yêu cầu học viên", response_model=DataResponse[List[YeuCauHocVien_Schema]])
async def get_danhsachyeucauhocvien(db: Session = Depends(get_db)):
    yeucau_hocviens = db.query(YeuCauHocVien).all()
    return DataResponse.success_response(yeucau_hocviens)

@yeucau_hocvien_router.get("/yeucauhocvien/{id}", tags=["yeucau_hocvien"], description="Lấy 1 yêu cầu học viên", response_model=DataResponse[YeuCauHocVien_Schema])
async def get_yeucauhocvien(id: int, db: Session = Depends(get_db)):
    yeucau_hocvien = db.query(YeuCauHocVien).filter(YeuCauHocVien.mayeucau_hocvien == id).first()
    if not yeucau_hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(yeucau_hocvien)

# ----------------------------------------------------------------------
# 1. API THÊM THEO MÃ YÊU CẦU (Giữ nguyên đường dẫn cũ cho Frontend dễ gọi)
# ----------------------------------------------------------------------
@yeucau_hocvien_router.post("/themyeucauhocvien", tags=["yeucau_hocvien"], description="Thêm yêu cầu học viên (Bằng Mã Yêu Cầu)", response_model=DataResponse[YeuCauHocVien_Schema])
async def create_yeucauhocvien_mayeucau(data: Create_YeuCauHocVienVoiMaYeuCau_Schema, db: Session = Depends(get_db)):
    # Data chỉ có mahocvien và mayeucau, khi dump ra DB sẽ tự để madangky là rỗng
    yeucau_hocvien = YeuCauHocVien(**data.model_dump())
    try:
        db.add(yeucau_hocvien)
        db.commit()
        db.refresh(yeucau_hocvien)
        return DataResponse.success_response(yeucau_hocvien)
    except Exception as e:
        db.rollback()
        print(f"❌ LỖI NỐI HỌC VIÊN (MÃ YÊU CẦU): {str(e)}")
        raise HTTPException(status_code=400, detail=f"Lỗi Database: {str(e)}")

# ----------------------------------------------------------------------
# 2. API THÊM THEO MÃ ĐĂNG KÝ (Đường dẫn mới)
# ----------------------------------------------------------------------
@yeucau_hocvien_router.post("/themyeucauhocvien_theomadangky", tags=["yeucau_hocvien"], description="Thêm yêu cầu học viên (Bằng Mã Đăng Ký)", response_model=DataResponse[YeuCauHocVien_Schema])
async def create_yeucauhocvien_madangky(data: Create_YeuCauHocVienVoiMaDangKy_Schema, db: Session = Depends(get_db)):
    yeucau_hocvien = YeuCauHocVien(**data.model_dump())
    try:
        db.add(yeucau_hocvien)
        db.commit()
        db.refresh(yeucau_hocvien)
        return DataResponse.success_response(yeucau_hocvien)
    except Exception as e:
        db.rollback()
        print(f"❌ LỖI NỐI HỌC VIÊN (MÃ ĐĂNG KÝ): {str(e)}")
        raise HTTPException(status_code=400, detail=f"Lỗi Database: {str(e)}")

@yeucau_hocvien_router.delete("/xoayeucauhocvien/{id}", tags=["yeucau_hocvien"], description="Xóa yêu cầu học viên", response_model=DataResponse[YeuCauHocVien_Schema])
async def delete_yeucauhocvien(id: int, db: Session = Depends(get_db)):
    yeucau_hocvien = db.query(YeuCauHocVien).filter(YeuCauHocVien.mayeucau_hocvien == id).first()
    if not yeucau_hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(yeucau_hocvien)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=yeucau_hocvien)
