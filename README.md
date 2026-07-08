# 🎓 Hệ thống Kết nối Người học và Gia sư tại Đà Nẵng

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.127.0-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.1-646CFF.svg)](https://vitejs.dev/)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt và Chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Sơ đồ Database](#-sơ-đồ-database)
- [API Documentation](#-api-documentation)
- [Đóng góp](#-đóng-góp)
- [Tác giả](#-tác-giả)

## 📖 Giới thiệu

**Hệ thống Kết nối Người học và Gia sư** là một nền tảng trực tuyến giúp kết nối người học với gia sư tại thành phố Đà Nẵng. Hệ thống cung cấp giải pháp toàn diện cho việc tìm kiếm, đăng ký, quản lý lịch dạy và đánh giá chất lượng gia sư.

### 🎯 Mục tiêu dự án

- Tạo cầu nối hiệu quả giữa người học và gia sư
- Hỗ trợ quản lý lịch dạy và học một cách khoa học
- Đảm bảo chất lượng thông qua hệ thống đánh giá và xác thực
- Tối ưu hóa trải nghiệm người dùng với giao diện thân thiện

## ✨ Tính năng chính

### 👨‍🎓 Dành cho Người học

- 🔍 Tìm kiếm gia sư theo môn học, khu vực, hệ lớp
- 📝 Đăng yêu cầu tìm gia sư với thông tin chi tiết
- 📅 Quản lý lịch học và học viên
- ⭐ Đánh giá và phản hồi về gia sư
- 👤 Quản lý thông tin cá nhân và hồ sơ học viên

### 👨‍🏫 Dành cho Gia sư

- 📚 Đăng ký môn học và bằng cấp
- 🕐 Thiết lập khung giờ dạy có thể
- 📋 Xem và ứng tuyển các yêu cầu tìm gia sư
- 📊 Thống kê lịch dạy và thu nhập
- 💬 Nhận đánh giá từ học viên
- 🎓 Quản lý hồ sơ và chứng chỉ

### 👨‍💼 Dành cho Quản trị viên

- 👥 Quản lý người dùng (Người học, Gia sư)
- ✅ Xác thực hồ sơ và bằng cấp gia sư
- 📈 Thống kê tổng quan hệ thống
- 🗂️ Quản lý danh mục (Môn học, Bằng cấp, Hệ lớp, Khu vực)
- 📊 Báo cáo và phân tích dữ liệu

## 🛠️ Công nghệ sử dụng

### Backend

- **Framework**: FastAPI 0.127.0
- **Database**: MySQL
- **ORM**: SQLAlchemy 2.0.45
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: Argon2 (via Passlib)
- **Email Service**: SMTP Gmail
- **File Upload**: Cloudinary
- **CORS**: FastAPI CORS Middleware
- **Environment**: Python-dotenv

### Frontend

- **Framework**: React 19.2.4
- **Build Tool**: Vite 8.0.1
- **Routing**: React Router DOM 7.15.1
- **Styling**: Tailwind CSS 4.3.0
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)

### DevOps & Tools

- **Version Control**: Git
- **API Testing**: FastAPI Swagger UI
- **Database Design**: PlantUML
- **Code Editor**: VS Code

## 📁 Cấu trúc dự án

```
KetNoiNguoiHocVaGiaSu/
│
├── backend/                          # Backend FastAPI
│   ├── app/
│   │   ├── core/                     # Cấu hình core
│   │   │   ├── config.py             # Cấu hình ứng dụng
│   │   │   └── security.py           # JWT, mã hóa mật khẩu
│   │   │
│   │   ├── db/                       # Database
│   │   │   └── base.py               # Kết nối database
│   │   │
│   │   ├── models/                   # SQLAlchemy Models
│   │   │   ├── nguoidung_model.py
│   │   │   ├── giasu_model.py
│   │   │   ├── hocvien_model.py
│   │   │   ├── monhoc_model.py
│   │   │   ├── bangcap_model.py
│   │   │   ├── yeucautimgiasu_model.py
│   │   │   ├── dangkylich_model.py
│   │   │   ├── danhgia_model.py
│   │   │   └── ...
│   │   │
│   │   ├── schemas/                  # Pydantic Schemas
│   │   │   ├── nguoidung_schema.py
│   │   │   ├── giasu_schema.py
│   │   │   └── ...
│   │   │
│   │   ├── routers/                  # API Routes
│   │   │   ├── nguoidung_router.py
│   │   │   ├── giasu_router.py
│   │   │   ├── yeucautimgiasu_router.py
│   │   │   ├── dangkylich_router.py
│   │   │   ├── danhgia_router.py
│   │   │   └── ...
│   │   │
│   │   └── utils/                    # Utilities
│   │       └── cloudinary_config.py  # Upload file
│   │
│   ├── main.py                       # Entry point
│   ├── .env                          # Environment variables
│   └── requirements.txt              # Python dependencies
│
├── frontend/                         # Frontend React
│   ├── src/
│   │   ├── assets/                   # Tài nguyên tĩnh
│   │   │   ├── css/                  # Stylesheets
│   │   │   └── images/               # Hình ảnh
│   │   │
│   │   ├── components/               # React Components
│   │   │   ├── giasu_components/
│   │   │   ├── nguoihoc_components/
│   │   │   ├── quantrivien_components/
│   │   │   ├── trangchu_components/
│   │   │   └── timmonhoc_components/
│   │   │
│   │   ├── pages/                    # Các trang chính
│   │   │   ├── TrangChu.jsx
│   │   │   ├── GiaSu.jsx
│   │   │   ├── NguoiHoc.jsx
│   │   │   ├── QuanTriVien.jsx
│   │   │   ├── TimGiaSu.jsx
│   │   │   ├── TimMonHoc.jsx
│   │   │   └── YeuCauTimGiaSu.jsx
│   │   │
│   │   ├── services/                 # API Services
│   │   │   ├── NguoiDung_Service.js
│   │   │   ├── GiaSu_Service.js
│   │   │   ├── YeuCauTimGiaSu_Service.js
│   │   │   └── ...
│   │   │
│   │   ├── parts/                    # Layout components
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── App.jsx                   # Main App component
│   │   └── main.jsx                  # Entry point
│   │
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   └── tailwind.config.js            # Tailwind configuration
│
├── SoDoHoatDong_GiaSu.puml          # Activity diagrams
├── SoDoHoatDong_NguoiHoc.puml
├── SoDoTuanTu_GiaSu.puml            # Sequence diagrams
├── SoDoTuanTu_NguoiHoc_Part1.puml
├── SoDoTuanTu_NguoiHoc_Part2.puml
└── README.md                         # Documentation
```

## 💻 Yêu cầu hệ thống

### Backend Requirements

- Python 3.9 hoặc cao hơn
- MySQL 8.0 hoặc cao hơn
- pip (Python package manager)

### Frontend Requirements

- Node.js 18.0 hoặc cao hơn
- npm hoặc yarn

## 🚀 Cài đặt và Chạy dự án

### 1. Clone Repository

```bash
git clone <repository-url>
cd KetNoiNguoiHocVaGiaSu
```

### 2. Cài đặt Backend

#### 2.1. Tạo Virtual Environment

```bash
cd backend
python -m venv venv
```

#### 2.2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### 2.3. Cài đặt Dependencies

```bash
pip install -r requirements.txt
```

#### 2.4. Cấu hình Database

Tạo database MySQL:

```sql
CREATE DATABASE ketnoinguoihocvagiasu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.5. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Database Configuration
sql="mysql://username:password@localhost:3306/ketnoinguoihocvagiasu"

# Email Configuration
EMAIL_SENDER="your-email@gmail.com"
EMAIL_APP_PASSWORD="your-app-password"

# Security (optional)
SECRET_KEY="your-secret-key-here"
```

**Lưu ý**: Để sử dụng Gmail SMTP, bạn cần:
1. Bật xác thực 2 bước trên tài khoản Google
2. Tạo App Password tại: https://myaccount.google.com/apppasswords

#### 2.6. Chạy Backend Server

```bash
uvicorn main:app --reload --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 3. Cài đặt Frontend

#### 3.1. Install Dependencies

```bash
cd frontend
npm install
```

#### 3.2. Chạy Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

#### 3.3. Build cho Production

```bash
npm run build
```

## 🗄️ Sơ đồ Database

### Các bảng chính

1. **NguoiDung** - Quản lý tài khoản người dùng
2. **GiaSu** - Thông tin gia sư
3. **HocVien** - Thông tin học viên
4. **MonHoc** - Danh sách môn học
5. **BangCap** - Loại bằng cấp
6. **HeLop** - Hệ lớp (Tiểu học, THCS, THPT...)
7. **KhuVuc** - Khu vực dạy học
8. **YeuCauTimGiaSu** - Yêu cầu tìm gia sư từ người học
9. **GiaSu_UngTuyen** - Gia sư ứng tuyển vào yêu cầu
10. **DangKyLich** - Lịch đăng ký dạy của gia sư
11. **ChiTietDangKyLich** - Chi tiết các buổi học
12. **YeuCau_HocVien** - Liên kết học viên với yêu cầu/lịch
13. **DanhGia** - Đánh giá của người học về gia sư

Chi tiết sơ đồ quan hệ xem tại các file `.puml` trong thư mục gốc.

## 📚 API Documentation

### Authentication Endpoints

- `POST /dangky` - Đăng ký tài khoản mới
- `POST /dangnhap` - Đăng nhập
- `GET /nguoidung/{id}` - Lấy thông tin người dùng
- `PUT /suanguoidung/{id}` - Cập nhật thông tin
- `PATCH /khoanguoidung/{id}` - Khóa/mở khóa tài khoản

### Gia Sư Endpoints

- `GET /danhsachgiasu` - Danh sách gia sư
- `POST /themgiasu` - Thêm hồ sơ gia sư
- `PUT /suagiasu/{id}` - Cập nhật hồ sơ
- `GET /giasu_timkiem` - Tìm kiếm gia sư theo điều kiện

### Yêu Cầu Tìm Gia Sư Endpoints

- `GET /danhsachyeucautimgiasu` - Danh sách yêu cầu
- `POST /themyeucautimgiasu` - Đăng yêu cầu mới
- `PUT /suayeucautimgiasu/{id}` - Cập nhật yêu cầu
- `DELETE /xoayeucautimgiasu/{id}` - Xóa yêu cầu

### Đăng Ký Lịch Endpoints

- `GET /danhsachdangkylich` - Danh sách lịch đăng ký
- `POST /themdangkylich` - Tạo lịch mới
- `PUT /suadangkylich/{id}` - Cập nhật lịch

### Đánh Giá Endpoints

- `GET /danhsachdanhgia` - Danh sách đánh giá
- `POST /themdanhgia` - Thêm đánh giá
- `PUT /suadanhgia/{id}` - Sửa đánh giá
- `DELETE /xoadanhgia/{id}` - Xóa đánh giá

Xem đầy đủ API docs tại: `http://localhost:8000/docs`

## 🧪 Testing

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
cd frontend
npm run test
```

## 📝 Các tính năng nổi bật

### 🔐 Bảo mật

- Mã hóa mật khẩu với Argon2
- JWT Authentication
- CORS Protection
- Input validation với Pydantic
- SQL Injection prevention với SQLAlchemy ORM

### 📧 Email Service

- Xác thực email khi đăng ký
- Thông báo khi có gia sư ứng tuyển
- Nhắc lịch học sắp tới

### ☁️ Upload File

- Upload ảnh đại diện
- Upload chứng chỉ bằng cấp
- Sử dụng Cloudinary CDN

### 📱 Responsive Design

- Giao diện thân thiện trên mọi thiết bị
- Mobile-first approach
- Tailwind CSS utilities

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## 👨‍💻 Tác giả

**Đồ án tốt nghiệp**
- Đề tài: Kết nối người học với gia sư tại thành phố Đà Nẵng
- Trường: Đại sư phạm kỹ thuật - Đại học Đà Nẵng
- Khoa: Công nghệ số
- Niên khóa: 2026

## 📞 Liên hệ

- Email: giasudanangk22@gmail.com
- GitHub: https://github.com/NguyenDinhh/KetNoiGiaSuVaNguoiHocTaiThanhPhoDaNang.git

---

⭐ Nếu dự án hữu ích, hãy cho một star nhé! ⭐
