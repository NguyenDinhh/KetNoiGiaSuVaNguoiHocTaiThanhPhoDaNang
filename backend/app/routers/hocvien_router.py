from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.hocvien_model import HocVien
from app.models.dangkylich_model import DangKyLich
from app.models.yeucautimgiasu_model import YeuCauTimGiaSu
from app.models.yeucau_hocvien_model import YeuCauHocVien
from app.schemas.hocvien_schema import HocVien_Schema, Create_HocVien_Schema, Update_HocVien_Schema

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
async def update_hocvien(id: int, data: Update_HocVien_Schema, db: Session = Depends(get_db)):
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

@hocvien_router.put("/khoahocvien/{id}", tags=["hocvien"], description="Khóa học viên (trangthai = 0)", response_model=DataResponse[HocVien_Schema])
async def khoa_hocvien(id: int, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    
    # Kiểm tra học viên có DangKyLich đang hoạt động (trangthai = 1)
    dangky_active = db.query(YeuCauHocVien).join(DangKyLich).filter(
        YeuCauHocVien.mahocvien == id,
        DangKyLich.trangthai == 1
    ).first()
    
    if dangky_active:
        return DataResponse.custom_response(
            code="400", 
            message="Không thể khóa! Học viên đang có lịch học đang hoạt động.", 
            data=None
        )
    
    # Kiểm tra học viên có YeuCauTimGiaSu đang hoạt động (trangthai = 1)
    yeucau_active = db.query(YeuCauHocVien).join(YeuCauTimGiaSu).filter(
        YeuCauHocVien.mahocvien == id,
        YeuCauTimGiaSu.trangthai == 1
    ).first()
    
    if yeucau_active:
        return DataResponse.custom_response(
            code="400", 
            message="Không thể khóa! Học viên đang có yêu cầu tìm gia sư đang hoạt động.", 
            data=None
        )
    
    # Khóa học viên
    hocvien.trangthai = 0
    db.commit()
    db.refresh(hocvien)
    return DataResponse.success_response(hocvien)

@hocvien_router.put("/mokhoahocvien/{id}", tags=["hocvien"], description="Mở khóa học viên (trangthai = 1)", response_model=DataResponse[HocVien_Schema])
async def mokhoa_hocvien(id: int, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    
    # Đếm số học viên đang hoạt động của người dùng này
    so_hocvien_active = db.query(HocVien).filter(
        HocVien.manguoidung == hocvien.manguoidung,
        HocVien.trangthai == 1
    ).count()
    
    if so_hocvien_active >= 10:
        return DataResponse.custom_response(
            code="400", 
            message="Không thể mở khóa! Đã đạt giới hạn 10 học viên hoạt động.", 
            data=None
        )
    
    # Mở khóa học viên
    hocvien.trangthai = 1
    db.commit()
    db.refresh(hocvien)
    return DataResponse.success_response(hocvien)
