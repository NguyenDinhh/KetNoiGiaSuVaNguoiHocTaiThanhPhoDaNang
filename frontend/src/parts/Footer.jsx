import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Khối nội dung chính của Footer */}
      <div className="footer-main">
        <div className="footer-content-grid">
          
          {/* Cột 1: Giới thiệu */}
          <div className="footer-column">
            <h3 className="footer-column-title">Kết nối gia sư và người học tại thành phố Đà Nẵng</h3>
            <p className="footer-description">
              Nền tảng kết nối gia sư và người học uy tín tại Đà Nẵng. 
              Giúp học viên tìm kiếm gia sư phù hợp và gia sư tìm được học viên một cách nhanh chóng.
            </p>
            <div className="footer-social">
              <a href="#facebook" className="footer-social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#zalo" className="footer-social-link" aria-label="Zalo">
                <i className="fab fa-zalo"></i>
              </a>
              <a href="#email" className="footer-social-link" aria-label="Email">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="footer-column">
            <h3 className="footer-column-title">Liên kết nhanh</h3>
            <ul className="footer-link-list">
              <li><a href="/" className="footer-link">Trang chủ</a></li>
              <li><a href="/tim-gia-su" className="footer-link">Tìm gia sư</a></li>
              <li><a href="/tim-hoc-vien" className="footer-link">Tìm học viên</a></li>
              <li><a href="/ve-chung-toi" className="footer-link">Về chúng tôi</a></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="footer-column">
            <h3 className="footer-column-title">Hỗ trợ</h3>
            <ul className="footer-link-list">
              <li><a href="/lien-he" className="footer-link">Liên hệ</a></li>
              <li><a href="/huong-dan" className="footer-link">Hướng dẫn sử dụng</a></li>
              <li><a href="/chinh-sach" className="footer-link">Chính sách bảo mật</a></li>
              <li><a href="/dieu-khoan" className="footer-link">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="footer-column">
            <h3 className="footer-column-title">Liên hệ</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Đà Nẵng, Việt Nam</span>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-phone"></i>
                <span>0123 456 789</span>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-envelope"></i>
                <span>contact@giasudn.vn</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Thanh đáy cùng */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">
          <p className="footer-copy">
            © 2026 Gia Sư Đà Nẵng P2P. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="/chinh-sach" className="footer-bottom-link">Chính sách</a>
            <span className="footer-divider">|</span>
            <a href="/dieu-khoan" className="footer-bottom-link">Điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
