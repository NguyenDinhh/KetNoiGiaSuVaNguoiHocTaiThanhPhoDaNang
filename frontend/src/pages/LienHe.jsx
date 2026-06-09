import React from 'react';
import '../assets/css/LienHe.css'; // Tạo thêm file này nhé

const LienHe = () => {
  return (
    <div className="contact-wrapper">
      <div className="contact-header">
        <h1>Liên Hệ Với Chúng Tôi</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn kiến tạo hành trình tri thức tại Đà Nẵng</p>
      </div>

      <div className="contact-container">
        {/* CỘT TRÁI: THÔNG TIN */}
        <div className="contact-info-panel">
          <h3>Thông Tin Liên Hệ</h3>
          <p className="contact-subtext">Điền biểu mẫu bên cạnh hoặc liên hệ trực tiếp qua các kênh dưới đây:</p>

          <div className="info-item">
            <span className="material-symbols-outlined">location_on</span>
            <div>
              <strong>Trụ sở chính</strong>
              <p>Quận Hải Châu, TP. Đà Nẵng</p>
            </div>
          </div>

          <div className="info-item">
            <span className="material-symbols-outlined">call</span>
            <div>
              <strong>Hotline hỗ trợ (24/7)</strong>
              <p>+84 354 543 333</p>
            </div>
          </div>

          <div className="info-item">
            <span className="material-symbols-outlined">mail</span>
            <div>
              <strong>Email</strong>
              <p>giasudanangk22@gmail.com</p>
            </div>
          </div>

          {/* NHÚNG GOOGLE MAPS ĐÀ NẴNG */}
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.829986348421!2d108.21980831485854!3d16.074291888877543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142183186851d7b%3A0xcda6b005e839e944!2zSOG7m2kgQ2jDom4gVGjDoG5oIMSQw6AgTuG6tW5n!5e0!3m2!1svi!2s!4v1624021234567!5m2!1svi!2s"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              title="Bản đồ Đà Nẵng"
            ></iframe>
          </div>
        </div>

        {/* CỘT PHẢI: FORM */}
        <div className="contact-form-panel">
          <h3>Gửi Tin Nhắn</h3>
          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn! Lời nhắn đã được gửi.'); }}>

            <div className="form-group">
              <label>Họ và tên *</label>
              <input type="text" placeholder="Nhập họ tên của bạn" required />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Số điện thoại *</label>
                <input type="tel" placeholder="Ví dụ: 0987..." required />
              </div>
              <div className="form-group half-width">
                <label>Email</label>
                <input type="email" placeholder="example@gmail.com" />
              </div>
            </div>

            <div className="form-group">
              <label>Chủ đề hỗ trợ *</label>
              <select required>
                <option value="">-- Chọn vấn đề bạn cần hỗ trợ --</option>
                <option value="hocvien">Tư vấn tìm gia sư</option>
                <option value="giasu">Đăng ký làm gia sư</option>
                <option value="khieunai">Báo cáo sự cố / Khiếu nại</option>
                <option value="khac">Vấn đề khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nội dung chi tiết *</label>
              <textarea rows="5" placeholder="Viết lời nhắn của bạn ở đây..." required></textarea>
            </div>

            <button type="submit" className="btn-submit-contact">Gửi Yêu Cầu</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LienHe;
