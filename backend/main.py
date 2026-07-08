from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import Base
from app.db.base import engine
from app.routers import (
    nguoidung_router, giasu_router, hocvien_router,
    khuvuc_router, bangcap_router, helop_router,
    monhoc_router, bangcap_monhoc_router, giasu_bangcap_router,
    giasu_monhoc_router, giasu_ungtuyen_router, khunggio_giasu_monhoc_router,
    yeucautimgiasu_router, yeucau_hocvien_router, dangkylich_router,
    chitietdangkylich_router, chitietyeucau_router, danhgia_router,
    upload_router, xacthucemail_router
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Đồ án tốt nghiệp",
    description="Đề tài: Kết nối người học với gia sư tại thành phố Đà Nẵng"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(nguoidung_router)
app.include_router(giasu_router)
app.include_router(hocvien_router)
app.include_router(khuvuc_router)
app.include_router(bangcap_router)
app.include_router(helop_router)
app.include_router(monhoc_router)
app.include_router(bangcap_monhoc_router)
app.include_router(giasu_bangcap_router)
app.include_router(giasu_monhoc_router)
app.include_router(giasu_ungtuyen_router)
app.include_router(khunggio_giasu_monhoc_router)
app.include_router(yeucautimgiasu_router)
app.include_router(yeucau_hocvien_router)
app.include_router(dangkylich_router)
app.include_router(chitietdangkylich_router)
app.include_router(chitietyeucau_router)
app.include_router(danhgia_router)
app.include_router(upload_router)
app.include_router(xacthucemail_router)
