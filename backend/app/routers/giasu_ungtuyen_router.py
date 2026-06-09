from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.giasu_ungtuyen_model import GiaSuUngTuyen
from app.schemas.giasu_ungtuyen_schema import (
    GiaSuUngTuyen_Schema,
    Create_GiaSuUngTuyen_Schema,
    Update_GiaSuUngTuyen_Schema
)

giasu_ungtuyen_router = APIRouter()

@giasu_ungtuyen_router.get(
    "/danhsachgiasuungtuyen",
    tags=["giasu_ungtuyen"],
    description="Danh sách ứng tuyển gia sư",
    response_model=DataResponse[List[GiaSuUngTuyen_Schema]]
)
async def get_danhsachgiasuungtuyen(db: Session = Depends(get_db)):
    giasu_ungtuyens = db.query(GiaSuUngTuyen).all()
    return DataResponse.success_response(giasu_ungtuyens)


@giasu_ungtuyen_router.get(
    "/giasuungtuyen/{id}",
    tags=["giasu_ungtuyen"],
    description="Lấy 1 ứng tuyển gia sư",
    response_model=DataResponse[GiaSuUngTuyen_Schema]
)
async def get_giasuungtuyen(id: int, db: Session = Depends(get_db)):
    giasu_ungtuyen = db.query(GiaSuUngTuyen).filter(
        GiaSuUngTuyen.magiasu_ungtuyen == id
    ).first()
    if not giasu_ungtuyen:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy",
            data=None
        )
    return DataResponse.success_response(giasu_ungtuyen)

@giasu_ungtuyen_router.post(
    "/themgiasuungtuyen",
    tags=["giasu_ungtuyen"],
    description="Thêm ứng tuyển gia sư",
    response_model=DataResponse[GiaSuUngTuyen_Schema]
)
async def create_giasuungtuyen(data: Create_GiaSuUngTuyen_Schema, db: Session = Depends(get_db)):
    giasu_ungtuyen = GiaSuUngTuyen(**data.model_dump())
    try:
        db.add(giasu_ungtuyen)
        db.commit()
        db.refresh(giasu_ungtuyen)
        return DataResponse.success_response(giasu_ungtuyen)
    except:
        return DataResponse.custom_response(
            code="400",
            message="Lỗi",
            data=None
        )

@giasu_ungtuyen_router.put(
    "/suagiasuungtuyen/{id}",
    tags=["giasu_ungtuyen"],
    description="Sửa trạng thái ứng tuyển",
    response_model=DataResponse[GiaSuUngTuyen_Schema]
)
async def update_giasuungtuyen(id: int, data: Update_GiaSuUngTuyen_Schema, db: Session = Depends(get_db)):
    giasu_ungtuyen = db.query(GiaSuUngTuyen).filter(
        GiaSuUngTuyen.magiasu_ungtuyen == id
    ).first()
    if not giasu_ungtuyen:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy",
            data=None
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(giasu_ungtuyen, key, value)

    db.commit()
    db.refresh(giasu_ungtuyen)
    return DataResponse.success_response(giasu_ungtuyen)

@giasu_ungtuyen_router.delete(
    "/xoagiasuungtuyen/{id}",
    tags=["giasu_ungtuyen"],
    description="Xóa ứng tuyển gia sư",
    response_model=DataResponse[GiaSuUngTuyen_Schema]
)
async def delete_giasuungtuyen(id: int, db: Session = Depends(get_db)):
    giasu_ungtuyen = db.query(GiaSuUngTuyen).filter(
        GiaSuUngTuyen.magiasu_ungtuyen == id
    ).first()
    if not giasu_ungtuyen:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy",
            data=None
        )
    db.delete(giasu_ungtuyen)
    db.commit()
    return DataResponse.custom_response(
        code="200",
        message="Xóa thành công",
        data=giasu_ungtuyen
    )
