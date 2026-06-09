from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

from app.models.nguoidung_model import NguoiDung
from app.db.base import get_db
from app.schemas.base_schema import DataResponse
from app.schemas.nguoidung_schema import (
    NguoiDung_Schema,
    Register_NguoiDung_Schema,
    Login_Schema,
    Update_NguoiDung_Schema
)
from app.core.security import hash_password, verify_password, create_access_token

nguoidung_router = APIRouter()

@nguoidung_router.get("/danhsachnguoidung", tags=["nguoidung"])
async def get_danhsachnguoidung(db: Session = Depends(get_db)):
    nguoidungs = db.query(NguoiDung).all()
    # Chuyển list Object DB sang list dict
    data = [NguoiDung_Schema.model_validate(n).model_dump() for n in nguoidungs]
    return DataResponse.success_response(data)

@nguoidung_router.get("/nguoidung/{id}", tags=["nguoidung"])
async def get_nguoidung(id: int, db: Session = Depends(get_db)):
    nguoidung = db.query(NguoiDung).filter(
        NguoiDung.manguoidung == id
    ).first()
    if not nguoidung:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy người dùng",
            data=None
        )
    return DataResponse.success_response(
        NguoiDung_Schema.model_validate(nguoidung).model_dump()
    )

@nguoidung_router.post("/dangky", tags=["nguoidung"])
async def register(data: Register_NguoiDung_Schema, db: Session = Depends(get_db)):
    try:
        nguoidung = NguoiDung(
            email=data.email,
            matkhau=hash_password(data.matkhau),
            hoten=data.hoten,
            sodienthoai=data.sodienthoai,
            anhdaidien=data.anhdaidien,
            vaitro=data.vaitro,
            trangthai=1
        )
        db.add(nguoidung)
        db.commit()
        db.refresh(nguoidung)
        return DataResponse.custom_response(
            code="200",
            message="Đăng ký thành công",
            data=NguoiDung_Schema.model_validate(nguoidung).model_dump()
        )
    except Exception:
        db.rollback()
        return DataResponse.custom_response(
            code="400",
            message="Email hoặc SĐT đã tồn tại!",
            data=None
        )

@nguoidung_router.post("/dangnhap", tags=["nguoidung"])
async def login(data: Login_Schema, db: Session = Depends(get_db)):
    nguoidung = db.query(NguoiDung).filter(
        NguoiDung.email == data.email
    ).first()

    if not nguoidung or not verify_password(data.matkhau, nguoidung.matkhau):
        return DataResponse.custom_response(
            code="401",
            message="Email hoặc mật khẩu không chính xác!",
            data=None
        )

    matruycap = create_access_token(
        data={
            "manguoidung": nguoidung.manguoidung,
            "vaitro": nguoidung.vaitro
        }
    )

    return DataResponse.success_response(
        data={
            "thong_tin": NguoiDung_Schema.model_validate(nguoidung).model_dump(),
            "matruycap": matruycap
        }
    )

@nguoidung_router.put("/suanguoidung/{id}", tags=["nguoidung"])
async def update_nguoidung(id: int, data: Update_NguoiDung_Schema, db: Session = Depends(get_db)):
    nguoidung = db.query(NguoiDung).filter(
        NguoiDung.manguoidung == id
    ).first()
    if not nguoidung:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy người dùng",
            data=None
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "matkhau":
            if not value or value.strip() == "":
                continue
            value = hash_password(value)
        setattr(nguoidung, key, value)

    db.commit()
    db.refresh(nguoidung)
    return DataResponse.success_response(
        NguoiDung_Schema.model_validate(nguoidung).model_dump()
    )

@nguoidung_router.patch("/khoanguoidung/{id}", tags=["nguoidung"])
async def toggle_trangthai_nguoidung(id: int, db: Session = Depends(get_db)):
    nguoidung = db.query(NguoiDung).filter(
        NguoiDung.manguoidung == id
    ).first()
    if not nguoidung:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy người dùng",
            data=None
        )

    nguoidung.trangthai = 0 if nguoidung.trangthai == 1 else 1
    db.commit()
    db.refresh(nguoidung)
    return DataResponse.success_response(
        NguoiDung_Schema.model_validate(nguoidung).model_dump()
    )

@nguoidung_router.delete("/xoanguoidung/{id}", tags=["NguoiDung"])
async def delete_nguoidung(id: int, db: Session = Depends(get_db)):
    nguoi_dung = db.query(NguoiDung).filter(
        NguoiDung.manguoidung == id
    ).first()

    if not nguoi_dung:
        return DataResponse.custom_response(
            code="404",
            message="Không tìm thấy tài khoản!",
            data=None
        )

    try:
        db.delete(nguoi_dung)
        db.commit()
        return DataResponse.custom_response(
            code="200",
            message="Đã xóa người dùng!",
            data=None
        )
    except Exception as e:
        db.rollback()
        return DataResponse.custom_response(
            code="500",
            message=str(e),
            data=None
        )
