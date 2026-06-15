from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db

from app.models.yeucautimgiasu_model import YeuCauTimGiaSu
from app.models.yeucau_hocvien_model import YeuCauHocVien
from app.models.chitietyeucau_model import ChiTietYeuCau
from app.models.giasu_ungtuyen_model import GiaSuUngTuyen
from app.models.danhgia_model import DanhGia

from app.schemas.yeucautimgiasu_schema import YeuCauTimGiaSu_Schema, Create_YeuCauTimGiaSu_Schema, Update_TrangThai_YeuCau_Schema

yeucautimgiasu_router = APIRouter()

@yeucautimgiasu_router.get("/danhsachyeucautimgiasu", tags=["yeucautimgiasu"], description="Danh sách yêu cầu tìm gia sư", response_model=DataResponse[List[YeuCauTimGiaSu_Schema]])
async def get_danhsachyeucautimgiasu(db: Session = Depends(get_db)):
    yeucaus = db.query(YeuCauTimGiaSu).all()
    return DataResponse.success_response(yeucaus)

@yeucautimgiasu_router.get("/yeucautimgiasu/{id}", tags=["yeucautimgiasu"], description="Lấy 1 yêu cầu tìm gia sư", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def get_yeucautimgiasu(id: str, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()
    if not yeucau:
        return DataResponse.custom_response(code="404", message="Không tìm thấy yêu cầu", data=None)
    return DataResponse.success_response(yeucau)

@yeucautimgiasu_router.post("/themyeucautimgiasu", tags=["yeucautimgiasu"], description="Tạo yêu cầu tìm gia sư", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def create_yeucautimgiasu(data: Create_YeuCauTimGiaSu_Schema, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Nhận request thêm yêu cầu - manguoidung: {data.manguoidung}")
        
        yeucau = YeuCauTimGiaSu(mayeucau="", **data.model_dump())
        print(f"DEBUG: Tạo object YeuCauTimGiaSu thành công")
        
        db.add(yeucau)
        print(f"DEBUG: Đã add vào session")
        
        db.commit()
        print(f"DEBUG: Commit thành công")
        
        yeucau_da_tao = db.query(YeuCauTimGiaSu).filter(
            YeuCauTimGiaSu.manguoidung == data.manguoidung
        ).order_by(YeuCauTimGiaSu.mayeucau.desc()).first()
        print(f"DEBUG: Query lại - tìm thấy: {yeucau_da_tao.mayeucau if yeucau_da_tao else 'None'}")
        
        if not yeucau_da_tao:
            return DataResponse.custom_response(code="500", message="Thêm thành công nhưng lỗi truy xuất dữ liệu!", data=None)
        
        print(f"DEBUG: Trả về response thành công")
        return DataResponse.success_response(yeucau_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI thêm yêu cầu: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return DataResponse.custom_response(code="500", message=f"Lỗi: {str(e)}", data=None)

@yeucautimgiasu_router.put("/suayeucautimgiasu/{id}", tags=["yeucautimgiasu"], description="Sửa yêu cầu tìm gia sư", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def update_yeucautimgiasu(id: str, data: Create_YeuCauTimGiaSu_Schema, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()
    if not yeucau:
        return DataResponse.custom_response(code="404", message="Không tìm thấy yêu cầu", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(yeucau, key, value)
    db.commit()
    return DataResponse.success_response(yeucau)

@yeucautimgiasu_router.patch("/capnhattrangthaiyeucau/{id}", tags=["yeucautimgiasu"], description="Cập nhật nhanh trạng thái yêu cầu", response_model=DataResponse[YeuCauTimGiaSu_Schema])
async def update_trangthai_yeucautimgiasu(id: str, data: Update_TrangThai_YeuCau_Schema, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()

    if not yeucau:
        return DataResponse.custom_response(code="404", message="Không tìm thấy yêu cầu", data=None)

    yeucau.trangthai = data.trangthai
    db.commit()
    return DataResponse.success_response(yeucau)

@yeucautimgiasu_router.delete("/xoayeucautimgiasu/{id}", tags=["yeucautimgiasu"], description="Xóa yêu cầu tìm gia sư (và các ứng tuyển bị từ chối)")
async def delete_yeucautimgiasu(id: str, db: Session = Depends(get_db)):
    yeucau = db.query(YeuCauTimGiaSu).filter(YeuCauTimGiaSu.mayeucau == id).first()
    if not yeucau:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy yêu cầu",
            data=None
        )

    try:
        # Xóa các ứng tuyển liên quan (bao gồm cả đang chờ và bị từ chối)
        db.query(GiaSuUngTuyen).filter(GiaSuUngTuyen.mayeucau == id).delete()

        # Xóa danh sách học viên liên quan
        db.query(YeuCauHocVien).filter(YeuCauHocVien.mayeucau == id).delete()

        # Xóa chi tiết yêu cầu (khung giờ)
        db.query(ChiTietYeuCau).filter(ChiTietYeuCau.mayeucau == id).delete()

        # Xóa đánh giá nếu có
        db.query(DanhGia).filter(DanhGia.mayeucau == id).delete()

        # Cuối cùng xóa yêu cầu chính
        db.delete(yeucau)
        db.commit()

        return DataResponse.custom_response(
            code="200",
            message="Đã xóa yêu cầu và tất cả dữ liệu liên quan",
            data=None
        )

    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi khi xóa Yêu cầu {id}: {str(e)}")
        return DataResponse.custom_response(
            code="500",
            message="Lỗi hệ thống khi xóa dữ liệu",
            data=None
        )