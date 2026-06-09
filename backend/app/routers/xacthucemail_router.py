import os
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

load_dotenv()

xacthucemail_router = APIRouter()
OTP_STORE = {} # Giỏ lưu OTP tạm trên RAM

class EmailRequest(BaseModel):
    email: str

class OTPVerifyRequest(BaseModel):
    email: str
    otp: str

# Hàm lõi để cấu hình gửi thư
def send_email_sync(email_to: str, otp_code: str):
    sender_email = os.getenv("EMAIL_SENDER")
    sender_password = os.getenv("EMAIL_APP_PASSWORD")

    msg = MIMEMultipart()
    msg['From'] = f"Kết nối gia sư với người học tại thành phố Đà Nẵng <{sender_email}>"
    msg['To'] = email_to
    msg['Subject'] = "Mã xác thực đăng ký tài khoản"

    html_content = f"<h3>Mã OTP của bạn là: <span style='color:red'>{otp_code}</span></h3><p>Mã có hiệu lực 5 phút.</p>"
    msg.attach(MIMEText(html_content, 'html'))

    try:
        # Đổi SMTP thường thành SMTP_SSL và dùng cổng 465
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)

        # Không cần dòng server.starttls() nữa vì SSL đã mã hóa từ đầu rồi
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        print(f"✅ Đã gửi mail thành công tới: {email_to}")
    except Exception as e:
        print("❌ Lỗi gửi mail:", e)

# API 1: Người dùng bấm "Gửi mã" thì gọi vào đây
@xacthucemail_router.post("/api/gui-otp")
async def gui_ma_otp(req: EmailRequest, background_tasks: BackgroundTasks):
    otp_code = str(random.randint(100000, 999999)) # Sinh số ngẫu nhiên
    OTP_STORE[req.email] = {"otp": otp_code, "expires_at": datetime.now() + timedelta(minutes=5)}

    # Ném việc gửi mail ra chạy ngầm cho web khỏi bị đơ
    background_tasks.add_task(send_email_sync, req.email, otp_code)
    return {"message": "Đã gửi mã"}

# API 2: Người dùng nhập mã xong bấm "Xác nhận" thì gọi vào đây
@xacthucemail_router.post("/api/xac-thuc-otp")
async def xac_thuc_otp(req: OTPVerifyRequest):
    record = OTP_STORE.get(req.email)
    if not record or datetime.now() > record["expires_at"]:
        raise HTTPException(status_code=400, detail="Mã không hợp lệ hoặc đã hết hạn")
    if record["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Mã OTP sai")

    del OTP_STORE[req.email] # Đúng thì xóa luôn cho sạch
    return {"message": "Xác thực thành công"}
