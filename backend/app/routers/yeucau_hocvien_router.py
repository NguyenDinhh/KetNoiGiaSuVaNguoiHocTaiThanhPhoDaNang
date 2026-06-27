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
async def get_yeucauhocvien(id: str, db: Session = Depends(get_db)):
    yeucau_hocvien = db.query(YeuCauHocVien).filter(YeuCauHocVien.mayeucau_hocvien == id).first()
    if not yeucau_hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(yeucau_hocvien)

@yeucau_hocvien_router.post("/themyeucauhocvien", tags=["yeucau_hocvien"], description="Thêm yêu cầu học viên (Bằng Mã Yêu Cầu)", response_model=DataResponse[YeuCauHocVien_Schema])
async def create_yeucauhocvien_mayeucau(data: Create_YeuCauHocVienVoiMaYeuCau_Schema, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Thêm yêu cầu học viên - mayeucau: {data.mayeucau}, mahocvien: {data.mahocvien}")
        
        yeucau_hocvien = YeuCauHocVien(
            mayeucau_hocvien="",
            mahocvien=data.mahocvien,
            mayeucau=data.mayeucau,
            madangky=None
        )
        db.add(yeucau_hocvien)
        db.commit()
        
        yc_hv_da_tao = db.query(YeuCauHocVien).filter(
            YeuCauHocVien.mayeucau == data.mayeucau,
            YeuCauHocVien.mahocvien == data.mahocvien
        ).order_by(YeuCauHocVien.mayeucau_hocvien.desc()).first()
        
        if not yc_hv_da_tao:
            return DataResponse.custom_response(code="500", message="Thêm thành công nhưng lỗi truy xuất!", data=None)
        
        print(f"DEBUG: Thêm YC-HV thành công: {yc_hv_da_tao.mayeucau_hocvien}")
        return DataResponse.success_response(yc_hv_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI thêm yêu cầu học viên: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Lỗi: {str(e)}")

@yeucau_hocvien_router.post("/themyeucauhocvien_theomadangky", tags=["yeucau_hocvien"], description="Thêm yêu cầu học viên (Bằng Mã Đăng Ký)", response_model=DataResponse[YeuCauHocVien_Schema])
async def create_yeucauhocvien_madangky(data: Create_YeuCauHocVienVoiMaDangKy_Schema, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Thêm yêu cầu học viên theo đăng ký - madangky: {data.madangky}, mahocvien: {data.mahocvien}")
        
        yeucau_hocvien = YeuCauHocVien(
            mayeucau_hocvien="",
            mahocvien=data.mahocvien,
            mayeucau=None,
            madangky=data.madangky
        )
        db.add(yeucau_hocvien)
        db.commit()
        
        yc_hv_da_tao = db.query(YeuCauHocVien).filter(
            YeuCauHocVien.madangky == data.madangky,
            YeuCauHocVien.mahocvien == data.mahocvien
        ).order_by(YeuCauHocVien.mayeucau_hocvien.desc()).first()
        
        if not yc_hv_da_tao:
            return DataResponse.custom_response(code="500", message="Thêm thành công nhưng lỗi truy xuất!", data=None)
        
        print(f"DEBUG: Thêm YC-HV theo DK thành công: {yc_hv_da_tao.mayeucau_hocvien}")
        return DataResponse.success_response(yc_hv_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI thêm yêu cầu học viên theo đăng ký: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Lỗi: {str(e)}")

@yeucau_hocvien_router.delete("/xoayeucauhocvien/{id}", tags=["yeucau_hocvien"], description="Xóa yêu cầu học viên", response_model=DataResponse[YeuCauHocVien_Schema])
async def delete_yeucauhocvien(id: str, db: Session = Depends(get_db)):
    yeucau_hocvien = db.query(YeuCauHocVien).filter(YeuCauHocVien.mayeucau_hocvien == id).first()
    if not yeucau_hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(yeucau_hocvien)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=yeucau_hocvien)
