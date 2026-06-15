from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.giasu_bangcap_model import GiaSuBangCap
from app.schemas.giasu_bangcap_schema import GiaSuBangCap_Schema, Create_GiaSuBangCap_Schema

giasu_bangcap_router = APIRouter()

@giasu_bangcap_router.get("/danhsachgiasubangcap", tags=["giasu_bangcap"], description="Danh sách bằng cấp gia sư", response_model=DataResponse[List[GiaSuBangCap_Schema]])
async def get_danhsachgiasubangcap(db: Session = Depends(get_db)):
    giasu_bangcaps = db.query(GiaSuBangCap).all()
    return DataResponse.success_response(giasu_bangcaps)

@giasu_bangcap_router.get("/giasubangcap/{id}", tags=["giasu_bangcap"], description="Lấy 1 bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def get_giasubangcap(id: str, db: Session = Depends(get_db)):
    giasu_bangcap = db.query(GiaSuBangCap).filter(GiaSuBangCap.mabangcapgiasu == id).first()
    if not giasu_bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    return DataResponse.success_response(giasu_bangcap)

@giasu_bangcap_router.post("/themgiasubangcap", tags=["giasu_bangcap"], description="Thêm bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def create_giasubangcap(data: Create_GiaSuBangCap_Schema, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Nhận request thêm bằng cấp - magiasu: {data.magiasu}, mabangcap: {data.mabangcap}")
        
        giasu_bangcap = GiaSuBangCap(mabangcapgiasu="", **data.model_dump())
        print(f"DEBUG: Tạo object GiaSuBangCap thành công")
        
        db.add(giasu_bangcap)
        print(f"DEBUG: Đã add vào session")
        
        db.commit()
        print(f"DEBUG: Commit thành công")
        
        bangcap_da_tao = db.query(GiaSuBangCap).filter(
            GiaSuBangCap.magiasu == data.magiasu
        ).order_by(GiaSuBangCap.mabangcapgiasu.desc()).first()
        print(f"DEBUG: Query lại - tìm thấy: {bangcap_da_tao.mabangcapgiasu if bangcap_da_tao else 'None'}")
        
        if not bangcap_da_tao:
            return DataResponse.custom_response(code="500", message="Thêm thành công nhưng lỗi truy xuất dữ liệu!", data=None)
        
        print(f"DEBUG: Trả về response thành công")
        return DataResponse.success_response(bangcap_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI thêm bằng cấp: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return DataResponse.custom_response(code="500", message=f"Lỗi: {str(e)}", data=None)

@giasu_bangcap_router.put("/suagiasubangcap/{id}", tags=["giasu_bangcap"], description="Sửa bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def update_giasubangcap(id: str, data: Create_GiaSuBangCap_Schema, db: Session = Depends(get_db)):
    giasu_bangcap = db.query(GiaSuBangCap).filter(GiaSuBangCap.mabangcapgiasu == id).first()
    if not giasu_bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(giasu_bangcap, key, value)
    db.commit()
    return DataResponse.success_response(giasu_bangcap)

@giasu_bangcap_router.delete("/xoagiasubangcap/{id}", tags=["giasu_bangcap"], description="Xóa bằng cấp gia sư", response_model=DataResponse[GiaSuBangCap_Schema])
async def delete_giasubangcap(id: str, db: Session = Depends(get_db)):
    giasu_bangcap = db.query(GiaSuBangCap).filter(GiaSuBangCap.mabangcapgiasu == id).first()
    if not giasu_bangcap:
        return DataResponse.custom_response(code="404", message="Không tìm thấy", data=None)
    db.delete(giasu_bangcap)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=giasu_bangcap)
