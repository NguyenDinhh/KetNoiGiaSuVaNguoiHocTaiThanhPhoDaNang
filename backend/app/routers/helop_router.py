from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.helop_model import HeLop
from app.schemas.helop_schema import HeLop_Schema, Create_HeLop_Schema

helop_router = APIRouter()

@helop_router.get("/danhsachhelop", tags=["helop"], description="Danh sách hệ lớp", response_model=DataResponse[List[HeLop_Schema]])
async def get_danhsachhelop(db: Session = Depends(get_db)):
    helops = db.query(HeLop).all()
    return DataResponse.success_response(helops)

@helop_router.get("/helop/{id}", tags=["helop"], description="Lấy 1 hệ lớp", response_model=DataResponse[HeLop_Schema])
async def get_helop(id: str, db: Session = Depends(get_db)):
    helop = db.query(HeLop).filter(HeLop.mahelop == id).first()
    if not helop:
        return DataResponse.custom_response(code="404", message="Không tìm thấy hệ lớp", data=None)
    return DataResponse.success_response(helop)

@helop_router.post("/themhelop", tags=["helop"], description="Thêm hệ lớp mới", response_model=DataResponse[HeLop_Schema])
async def create_helop(data: Create_HeLop_Schema, db: Session = Depends(get_db)):
    try:
        helop = HeLop(mahelop="", **data.model_dump())
        db.add(helop)
        db.commit()
        
        helop_da_tao = db.query(HeLop).filter(
            HeLop.tenhelop == data.tenhelop
        ).order_by(HeLop.mahelop.desc()).first()
        
        if not helop_da_tao:
            return DataResponse.custom_response(code="500", message="Không tìm thấy hệ lớp vừa tạo", data=None)
        
        return DataResponse.success_response(helop_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return DataResponse.custom_response(code="400", message=str(e), data=None)

@helop_router.put("/suahelop/{id}", tags=["helop"], description="Sửa tên hệ lớp", response_model=DataResponse[HeLop_Schema])
async def update_helop(id: str, data: Create_HeLop_Schema, db: Session = Depends(get_db)):
    helop = db.query(HeLop).filter(HeLop.mahelop == id).first()
    if not helop:
        return DataResponse.custom_response(code="404", message="Không tìm thấy hệ lớp", data=None)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(helop, key, value)
    db.commit()
    return DataResponse.success_response(helop)

@helop_router.delete("/xoahelop/{id}", tags=["helop"], description="Xóa hệ lớp", response_model=DataResponse[HeLop_Schema])
async def delete_helop(id: str, db: Session = Depends(get_db)):
    helop = db.query(HeLop).filter(HeLop.mahelop == id).first()
    if not helop:
        return DataResponse.custom_response(code="404", message="Không tìm thấy hệ lớp", data=None)
    db.delete(helop)
    db.commit()
    return DataResponse.custom_response(code="200", message="Xóa thành công", data=helop)
