from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.khunggio_giasu_monhoc_model import KhungGioGiaSuMonHoc
from app.schemas.khunggio_giasu_monhoc_schema import KhungGioGiaSuMonHoc_Schema, Create_KhungGioGiaSuMonHoc_Schema, Update_KhungGioGiaSuMonHoc_Schema

khunggio_giasu_monhoc_router = APIRouter()

@khunggio_giasu_monhoc_router.get("/danhsachkhunggiogiasumonhoc", tags=["khunggio_giasu_monhoc"], response_model=DataResponse[List[KhungGioGiaSuMonHoc_Schema]])
async def get_danhsachkhunggio(db: Session = Depends(get_db)):
    khunggios = db.query(KhungGioGiaSuMonHoc).all()
    return DataResponse.success_response(khunggios)

@khunggio_giasu_monhoc_router.post("/themkhunggiogiasumonhoc", tags=["khunggio_giasu_monhoc"], response_model=DataResponse[KhungGioGiaSuMonHoc_Schema])
async def create_khunggio(data: Create_KhungGioGiaSuMonHoc_Schema, db: Session = Depends(get_db)):
    try:
        khunggio = KhungGioGiaSuMonHoc(makhunggio="", **data.model_dump())
        khunggio.trangthai = 1
        db.add(khunggio)
        db.commit()
        
        khunggio_da_tao = db.query(KhungGioGiaSuMonHoc).filter(
            KhungGioGiaSuMonHoc.magiasu_monhoc == data.magiasu_monhoc
        ).order_by(KhungGioGiaSuMonHoc.makhunggio.desc()).first()
        
        if not khunggio_da_tao:
            return DataResponse.custom_response(code="500", message="Thêm thành công nhưng lỗi truy xuất!", data=None)
        
        return DataResponse.success_response(khunggio_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI thêm khung giờ: {str(e)}")
        return DataResponse.custom_response(code="500", message=f"Lỗi: {str(e)}", data=None)

@khunggio_giasu_monhoc_router.put("/suakhunggiogiasumonhoc/{id}", tags=["khunggio_giasu_monhoc"], response_model=DataResponse[KhungGioGiaSuMonHoc_Schema])
async def update_khunggio(id: str, data: Update_KhungGioGiaSuMonHoc_Schema, db: Session = Depends(get_db)):
    try:
        khunggio = db.query(KhungGioGiaSuMonHoc).filter(KhungGioGiaSuMonHoc.makhunggio == id).first()

        if not khunggio:
            return DataResponse.custom_response(code="404", message="Không tìm thấy lịch học để sửa", data=None)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(khunggio, key, value)

        db.commit()
        return DataResponse.success_response(khunggio)
    except Exception as e:
        db.rollback()
        print("❌ LỖI SỬA KHUNG GIỜ:", e)
        return DataResponse.custom_response(code="400", message=str(e), data=None)

@khunggio_giasu_monhoc_router.put("/khoakhunggiogiasumonhoc/{id}", tags=["khunggio_giasu_monhoc"], response_model=DataResponse[KhungGioGiaSuMonHoc_Schema])
async def lock_khunggio(id: str, db: Session = Depends(get_db)):
    khunggio = db.query(KhungGioGiaSuMonHoc).filter(KhungGioGiaSuMonHoc.makhunggio == id).first()
    if not khunggio:
        return DataResponse.custom_response(code="404", message="Không tìm thấy lịch học", data=None)

    khunggio.trangthai = 0
    db.commit()
    return DataResponse.custom_response(code="200", message="Khóa lịch học thành công", data=khunggio)
