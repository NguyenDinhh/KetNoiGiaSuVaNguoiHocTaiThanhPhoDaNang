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
async def get_hocvien(id: str, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    return DataResponse.success_response(hocvien)

@hocvien_router.post("/themhocvien", tags=["hocvien"], description="Thêm học viên mới", response_model=DataResponse[HocVien_Schema])
async def create_hocvien(data: Create_HocVien_Schema, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Nhận request thêm học viên - manguoidung: {data.manguoidung}")
        
        so_hocvien_active = db.query(HocVien).filter(
            HocVien.manguoidung == data.manguoidung,
            HocVien.trangthai == 1
        ).count()
        print(f"DEBUG: Số học viên active hiện tại: {so_hocvien_active}")
        
        if so_hocvien_active >= 10:
            print("DEBUG: Đã đạt giới hạn 10 học viên")
            return DataResponse.custom_response(code="400", message="Đã đạt giới hạn 10 học viên hoạt động!", data=None)
        
        hocvien_moi = HocVien(
            mahocvien="",
            manguoidung=data.manguoidung,
            tenhocvien=data.tenhocvien,
            namsinh=data.namsinh,
            hocluc=data.hocluc,
            diachi=data.diachi,
            ghichu=data.ghichu,
            trangthai=1
        )
        print(f"DEBUG: Tạo object HocVien thành công")
        
        db.add(hocvien_moi)
        print(f"DEBUG: Đã add vào session")
        
        db.commit()
        print(f"DEBUG: Commit thành công")
        
        hocvien_da_tao = db.query(HocVien).filter(
            HocVien.manguoidung == data.manguoidung
        ).order_by(HocVien.mahocvien.desc()).first()
        print(f"DEBUG: Query lại - tìm thấy: {hocvien_da_tao.mahocvien if hocvien_da_tao else 'None'}")
        
        if not hocvien_da_tao:
            return DataResponse.custom_response(code="500", message="Thêm học viên thành công nhưng lỗi truy xuất dữ liệu!", data=None)
        
        print(f"DEBUG: Trả về response thành công")
        return DataResponse.success_response(hocvien_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI thêm học viên: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return DataResponse.custom_response(code="500", message=f"Lỗi: {str(e)}", data=None)

@hocvien_router.put("/suahocvien/{id}", tags=["hocvien"], description="Sửa thông tin học viên", response_model=DataResponse[HocVien_Schema])
async def update_hocvien(id: str, data: Update_HocVien_Schema, db: Session = Depends(get_db)):
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
async def delete_hocvien(id: str, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    db.delete(hocvien)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=hocvien)

@hocvien_router.put("/khoahocvien/{id}", tags=["hocvien"], description="Khóa học viên (trangthai = 0)", response_model=DataResponse[HocVien_Schema])
async def khoa_hocvien(id: str, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    
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
    
    hocvien.trangthai = 0
    db.commit()
    db.refresh(hocvien)
    return DataResponse.success_response(hocvien)

@hocvien_router.put("/mokhoahocvien/{id}", tags=["hocvien"], description="Mở khóa học viên (trangthai = 1)", response_model=DataResponse[HocVien_Schema])
async def mokhoa_hocvien(id: str, db: Session = Depends(get_db)):
    hocvien = db.query(HocVien).filter(HocVien.mahocvien == id).first()
    if not hocvien:
        return DataResponse.custom_response(code="404", message="Không tìm thấy học viên", data=None)
    
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
    
    hocvien.trangthai = 1
    db.commit()
    db.refresh(hocvien)
    return DataResponse.success_response(hocvien)
