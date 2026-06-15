from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.base_schema import DataResponse
from app.db.base import get_db
from app.models.danhgia_model import DanhGia
from app.schemas.danhgia_schema import DanhGia_Schema, Create_DanhGia_Schema

danhgia_router = APIRouter()

@danhgia_router.get(
    "/danhsachdanhgia",
    tags=["danhgia"],
    description="Danh sách đánh giá",
    response_model=DataResponse[List[DanhGia_Schema]]
)
async def get_danhsachdanhgia(db: Session = Depends(get_db)):
    danhgias = db.query(DanhGia).all()
    return DataResponse.success_response(danhgias)


@danhgia_router.get(
    "/danhgia/{id}",
    tags=["danhgia"],
    description="Lấy 1 đánh giá",
    response_model=DataResponse[DanhGia_Schema]
)
async def get_danhgia(id: str, db: Session = Depends(get_db)):
    danhgia = db.query(DanhGia).filter(DanhGia.madanhgia == id).first()
    if not danhgia:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy đánh giá",
            data=None
        )
    return DataResponse.success_response(danhgia)

@danhgia_router.post(
    "/themdanhgia",
    tags=["danhgia"],
    description="Thêm đánh giá",
    response_model=DataResponse[DanhGia_Schema]
)
async def create_danhgia(data: Create_DanhGia_Schema, db: Session = Depends(get_db)):
    if data.mayeucau is None and data.madangky is None:
        return DataResponse.custom_response(
            code="400",
            message="Phải đánh giá cho mayeucau hoặc madangky",
            data=None
        )

    try:
        print(f"DEBUG: Thêm đánh giá - mayeucau: {data.mayeucau}, madangky: {data.madangky}")
        
        danhgia = DanhGia(madanhgia="", **data.model_dump())
        db.add(danhgia)
        db.commit()
        
        # Query lại dựa vào mayeucau hoặc madangky
        if data.mayeucau:
            danhgia_da_tao = db.query(DanhGia).filter(
                DanhGia.mayeucau == data.mayeucau
            ).order_by(DanhGia.madanhgia.desc()).first()
        else:
            danhgia_da_tao = db.query(DanhGia).filter(
                DanhGia.madangky == data.madangky
            ).order_by(DanhGia.madanhgia.desc()).first()
        
        if not danhgia_da_tao:
            return DataResponse.custom_response(code="500", message="Thêm thành công nhưng lỗi truy xuất!", data=None)
        
        print(f"DEBUG: Đánh giá thành công: {danhgia_da_tao.madanhgia}")
        return DataResponse.success_response(danhgia_da_tao)
    except Exception as e:
        db.rollback()
        print(f"LỖI thêm đánh giá: {str(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        return DataResponse.custom_response(code="500", message=f"Lỗi: {str(e)}", data=None)

@danhgia_router.put(
    "/suadanhgia/{id}",
    tags=["danhgia"],
    description="Sửa đánh giá",
    response_model=DataResponse[DanhGia_Schema]
)
async def update_danhgia(id: str, data: Create_DanhGia_Schema, db: Session = Depends(get_db)):
    danhgia = db.query(DanhGia).filter(DanhGia.madanhgia == id).first()
    if not danhgia:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy đánh giá",
            data=None
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(danhgia, key, value)

    try:
        db.commit()
        return DataResponse.success_response(danhgia)
    except Exception as e:
        db.rollback()
        return DataResponse.custom_response(
            code="400",
            message=f"Lỗi cập nhật: {str(e)}",
            data=None
        )

@danhgia_router.delete(
    "/xoadanhgia/{id}",
    tags=["danhgia"],
    description="Xóa đánh giá",
    response_model=DataResponse[DanhGia_Schema]
)
async def delete_danhgia(id: str, db: Session = Depends(get_db)):
    danhgia = db.query(DanhGia).filter(DanhGia.madanhgia == id).first()
    if not danhgia:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy đánh giá",
            data=None
        )

    try:
        db.delete(danhgia)
        db.commit()
        return DataResponse.custom_response(
            code="200",
            message="Xóa thành công",
            data=danhgia
        )
    except Exception as e:
        db.rollback()
        return DataResponse.custom_response(
            code="400",
            message=f"Lỗi khi xóa: {str(e)}",
            data=None
        )
