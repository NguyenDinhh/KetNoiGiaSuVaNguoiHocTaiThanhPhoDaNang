from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel  # <-- Bổ sung import để tạo Schema tính học phí
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.giasu_monhoc_model import GiaSuMonHoc
from app.schemas.giasu_monhoc_schema import GiaSuMonHoc_Schema, Create_GiaSuMonHoc_Schema

giasu_monhoc_router = APIRouter()

# ================= SCHEMA VÀ API TÍNH HỌC PHÍ =================
class TinhHocPhi_Schema(BaseModel):
    hocphimotbuoi: float
    sobuoi: int

@giasu_monhoc_router.post("/tinhhocphi", tags=["giasu_monhoc"])
async def api_tinh_hoc_phi(du_lieu: TinhHocPhi_Schema):
    # Ràng buộc số buổi tối thiểu là 1 để tránh nhân với 0
    so_buoi_chuan = du_lieu.sobuoi if du_lieu.sobuoi > 0 else 1
    hoc_phi_chuan = du_lieu.hocphimotbuoi if du_lieu.hocphimotbuoi > 0 else 0

    tong_hoc_phi = hoc_phi_chuan * so_buoi_chuan

    # Trả về kết quả bọc trong DataResponse để đồng bộ form chuẩn của hệ thống
    return DataResponse.success_response(tong_hoc_phi)
# ===============================================================

@giasu_monhoc_router.get("/danhsachgiasumonhoc", tags=["giasu_monhoc"], response_model=DataResponse[List[GiaSuMonHoc_Schema]])
async def get_danhsachgiasumonhoc(db: Session = Depends(get_db)):
    giasu_monhocs = db.query(GiaSuMonHoc).all()
    return DataResponse.success_response(giasu_monhocs)

@giasu_monhoc_router.post("/themgiasumonhoc", tags=["giasu_monhoc"], response_model=DataResponse[GiaSuMonHoc_Schema])
async def create_giasumonhoc(data: Create_GiaSuMonHoc_Schema, db: Session = Depends(get_db)):
    giasu_monhoc = GiaSuMonHoc(**data.model_dump())
    giasu_monhoc.trangthai = 1  # Mặc định thêm mới là Hoạt động
    try:
        db.add(giasu_monhoc)
        db.commit()
        db.refresh(giasu_monhoc)
        return DataResponse.success_response(giasu_monhoc)
    except:
        return DataResponse.custom_response(code="400", message="Lỗi thêm môn học gia sư", data=None)

@giasu_monhoc_router.put("/suagiasumonhoc/{id}", tags=["giasu_monhoc"], response_model=DataResponse[GiaSuMonHoc_Schema])
async def update_giasumonhoc(id: int, data: Create_GiaSuMonHoc_Schema, db: Session = Depends(get_db)):
    giasu_monhoc = db.query(GiaSuMonHoc).filter(GiaSuMonHoc.magiasu_monhoc == id).first()
    if not giasu_monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(giasu_monhoc, key, value)
    db.commit()
    db.refresh(giasu_monhoc)
    return DataResponse.success_response(giasu_monhoc)

# ĐỔI THÀNH API KHÓA LỚP HỌC (PUT)
@giasu_monhoc_router.put("/khoagiasumonhoc/{id}", tags=["giasu_monhoc"], response_model=DataResponse[GiaSuMonHoc_Schema])
async def lock_giasumonhoc(id: int, db: Session = Depends(get_db)):
    giasu_monhoc = db.query(GiaSuMonHoc).filter(GiaSuMonHoc.magiasu_monhoc == id).first()
    if not giasu_monhoc:
        return DataResponse.custom_response(code="404", message="Không tìm thấy lớp học", data=None)

    giasu_monhoc.trangthai = 0  # Chuyển trạng thái thành không hoạt động (Khóa)
    db.commit()
    db.refresh(giasu_monhoc)
    return DataResponse.custom_response(code="200", message="Khóa lớp học thành công", data=giasu_monhoc)
