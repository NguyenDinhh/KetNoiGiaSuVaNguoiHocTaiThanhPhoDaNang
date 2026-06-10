# 🤝 Hướng dẫn Đóng góp

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án **Hệ thống Kết nối Người học và Gia sư**!

## 📋 Quy tắc chung

### Code of Conduct

- Tôn trọng tất cả mọi người tham gia dự án
- Sử dụng ngôn ngữ lịch sự và chuyên nghiệp
- Chấp nhận phản hồi mang tính xây dựng
- Tập trung vào những gì tốt nhất cho cộng đồng

## 🚀 Cách đóng góp

### 1. Fork Repository

```bash
# Click nút "Fork" trên GitHub
# Clone repository về máy
git clone https://github.com/your-username/KetNoiNguoiHocVaGiaSu.git
cd KetNoiNguoiHocVaGiaSu
```

### 2. Tạo Branch mới

```bash
# Tạo branch cho feature mới
git checkout -b feature/ten-tinh-nang

# Hoặc cho bug fix
git checkout -b fix/mo-ta-loi
```

### 3. Coding Standards

#### Backend (Python)

- Tuân thủ PEP 8
- Sử dụng type hints
- Viết docstrings cho functions và classes
- Đặt tên biến có ý nghĩa (tiếng Anh hoặc tiếng Việt không dấu)

```python
# ✅ Good
async def get_giasu_by_id(id: int, db: Session = Depends(get_db)) -> GiaSu:
    """
    Lấy thông tin gia sư theo ID
    
    Args:
        id: Mã gia sư
        db: Database session
        
    Returns:
        GiaSu object hoặc None nếu không tìm thấy
    """
    return db.query(GiaSu).filter(GiaSu.magiasu == id).first()

# ❌ Bad
def get(i,d):
    return d.query(GiaSu).filter(GiaSu.magiasu==i).first()
```

#### Frontend (React/JavaScript)

- Sử dụng functional components và hooks
- Đặt tên components theo PascalCase
- Đặt tên functions/variables theo camelCase
- Sử dụng arrow functions
- Comment code phức tạp

```javascript
// ✅ Good
const GiaSuCard = ({ giaSu }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };
  
  return (
    <div className="card">
      {/* Component content */}
    </div>
  );
};

// ❌ Bad
function giasu_card(props) {
  var expanded = false;
  return <div>...</div>;
}
```

#### CSS/Styling

- Ưu tiên sử dụng Tailwind CSS utilities
- Viết custom CSS khi cần thiết
- Đặt tên class có ý nghĩa
- Mobile-first approach

### 4. Commit Messages

Sử dụng format sau:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Cập nhật documentation
- `style`: Format code (không ảnh hưởng logic)
- `refactor`: Tái cấu trúc code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build tools, dependencies

**Ví dụ:**

```bash
# Tính năng mới
git commit -m "feat(giasu): thêm chức năng lọc gia sư theo rating"

# Sửa bug
git commit -m "fix(auth): sửa lỗi JWT token expired"

# Cập nhật docs
git commit -m "docs(readme): cập nhật hướng dẫn cài đặt"
```

### 5. Testing

#### Backend Testing

```bash
cd backend
pytest

# Chạy với coverage
pytest --cov=app tests/
```

#### Frontend Testing

```bash
cd frontend
npm run test
```

**Yêu cầu:**
- Tất cả tests phải pass trước khi commit
- Thêm tests cho tính năng mới
- Coverage >= 80%

### 6. Pull Request

#### Trước khi tạo PR:

```bash
# Cập nhật code từ main branch
git checkout main
git pull origin main

# Rebase feature branch
git checkout feature/ten-tinh-nang
git rebase main

# Push lên GitHub
git push origin feature/ten-tinh-nang
```

#### Template PR:

```markdown
## 📝 Mô tả

Mô tả ngắn gọn về những thay đổi trong PR này.

## 🎯 Mục đích

Giải thích tại sao cần thay đổi này. Liên kết đến issue nếu có.

Fixes #(issue_number)

## 📸 Screenshots (nếu có)

Thêm screenshots để minh họa thay đổi UI.

## ✅ Checklist

- [ ] Code tuân thủ coding standards
- [ ] Đã test kỹ các thay đổi
- [ ] Đã cập nhật documentation (nếu cần)
- [ ] Tất cả tests đều pass
- [ ] Không có conflict với main branch

## 🧪 Testing

Mô tả cách test những thay đổi này:
1. Bước 1
2. Bước 2
3. ...
```

## 🐛 Báo cáo Bug

### Template Bug Report:

```markdown
## 🐛 Mô tả Bug

Mô tả ngắn gọn về bug.

## 📋 Các bước tái hiện

1. Đi đến '...'
2. Click vào '...'
3. Scroll xuống '...'
4. Thấy lỗi

## ✅ Kết quả mong đợi

Mô tả kết quả bạn mong đợi.

## ❌ Kết quả thực tế

Mô tả kết quả thực tế xảy ra.

## 📸 Screenshots

Nếu có thể, thêm screenshots.

## 🖥️ Môi trường

- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node version: [e.g. 18.17.0]
- Python version: [e.g. 3.11.0]

## 📎 Thông tin bổ sung

Thêm bất kỳ thông tin nào khác về bug.
```

## 💡 Đề xuất Feature mới

### Template Feature Request:

```markdown
## 🚀 Mô tả Feature

Mô tả ngắn gọn về feature bạn muốn.

## 🎯 Vấn đề cần giải quyết

Feature này giải quyết vấn đề gì?

## 💡 Giải pháp đề xuất

Mô tả cách bạn muốn feature này hoạt động.

## 🔄 Giải pháp thay thế

Mô tả các giải pháp thay thế bạn đã cân nhắc.

## 📎 Thông tin bổ sung

Screenshots, mockups, hoặc bất kỳ thông tin nào khác.
```

## 📚 Tài liệu tham khảo

### Backend
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

### Frontend
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## ❓ Cần trợ giúp?

Nếu bạn cần trợ giúp hoặc có câu hỏi:

1. Đọc [README.md](README.md)
2. Tìm trong [Issues](https://github.com/your-repo/issues)
3. Tạo issue mới nếu chưa có câu trả lời
4. Liên hệ: giasudanangk22@gmail.com

## 🌟 Cảm ơn!

Cảm ơn bạn đã dành thời gian đóng góp cho dự án! Mọi đóng góp, dù lớn hay nhỏ, đều được trân trọng. 🙏
