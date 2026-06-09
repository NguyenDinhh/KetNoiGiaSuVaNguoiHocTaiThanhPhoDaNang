import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Khối màu xanh lá cây chứa nút bấm kêu gọi */}
      <div className="footer-cta-banner">
        <button className="btn-footer-cta">Đăng ký làm người học</button>
        <button className="btn-footer-cta">Trở thành gia sư</button>
      </div>

      {/* Thanh màu xanh dương dưới đáy cùng */}
      <div className="footer-bottom-bar">
        <div className="footer-links">
          <a href="/lien-he" className="footer-link">Liên hệ</a>
          <a href="/ve-chung-toi" className="footer-link">Về chúng tôi</a>
        </div>
        <div className="footer-copy">
          © 2026 Gia Sư Đà Nẵng P2P. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
