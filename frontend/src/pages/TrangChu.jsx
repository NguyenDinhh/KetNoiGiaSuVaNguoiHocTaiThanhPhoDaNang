import React from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom';
import QuickSearch from '../components/trangchu_components/TimKiemNhanh.jsx';
import TutorCard from '../components/trangchu_components/TutorCard';
import ClassCard from '../components/trangchu_components/ClassCard';

// 🟢 ĐÃ XÓA: Các Service không dùng tới nữa vì các Card con tự gọi rồi

const HomePage = () => {
  const navigate = useNavigate();

  // 🟢 ĐÃ XÓA: Khối state danhSachYeuCau và useEffect fetchYeuCau lằng nhằng lúc trước

  // HÀM XỬ LÝ KHI BẤM NÚT TÌM KIẾM TỪ COMPONENT QuickSearch
  const handleTimKiemNhanh = (duLieuTimKiem) => {
    navigate({
      pathname: '/tim-mon-hoc',
      search: createSearchParams(duLieuTimKiem).toString()
    });
  };

  return (
    <div className="homepage-wrapper">
      {/* 1. Phần Banner */}
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">KẾT NỐI GIA SƯ VÀ NGƯỜI HỌC TẠI THÀNH PHỐ <br/> ĐÀ NẴNG</h1>
          <p className="hero-subtitle">Nhanh chóng - An toàn - Minh bạch</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => window.location.href = '/tim-gia-su'}>
              Bắt đầu tìm gia sư
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = '/tim-mon-hoc'}>
              Xem các môn học
            </button>
          </div>
        </div>
      </div>

      {/* 2. Phần Tìm kiếm nhanh */}
      <div className="quick-search-wrapper">
        <QuickSearch onSearch={handleTimKiemNhanh} />
      </div>

      {/* 3 & 4. KHỐI CHUNG HÀNG: Gia sư nổi bật & Lớp học cần gia sư */}
      <div className="main-content-split-row">

        {/* Cột bên trái: Gia sư nổi bật */}
        <section className="sub-column-section">
          <h2 className="section-title border-left-blue">Gia sư nổi bật mới</h2>
          <div className="card-carousel-scroll">
            <TutorCard />
          </div>
          <div className="view-more-container">
            <a href="/tim-gia-su" className="view-more-link">Xem thêm →</a>
          </div>
        </section>

        {/* Cột bên phải: Lớp học cần gia sư */}
        <section className="sub-column-section">
          <h2 className="section-title border-left-green">Lớp học cần gia sư!</h2>
          <div className="card-carousel-scroll">

            {/* 🟢 CHỈ CẦN GỌI ĐÚNG 1 DÒNG NÀY
                ClassCard bây giờ tự lo kéo data, tự lo loading, và tự render đúng 3 lớp mới nhất ở cuối */}
            <ClassCard />

          </div>
          <div className="view-more-container">
            <a href="/yeu-cau-tim-gia-su" className="view-more-link">Xem thêm →</a>
          </div>
        </section>

      </div>

      {/* 5. KHỐI THÔNG TIN: Giới thiệu & Tại sao chọn chúng tôi */}
      <section className="info-section-container">

        {/* Nửa bên trái: Giới thiệu & Liên hệ */}
        <div className="info-left-block">
          <h2 className="info-block-title">
            Khởi tạo hành trình tri thức cùng nền tảng Gia Sư Đà Nẵng!
          </h2>
          <p className="info-block-desc">
            Tại Gia Sư Đà Nẵng P2P, chúng tôi xây dựng và triển khai giải pháp kết nối giáo dục thông minh, hỗ trợ phụ huynh cùng học viên rút ngắn quá trình tìm kiếm, tối ưu hóa lịch trình và minh bạch chi phí học tập. Với mạng lưới gia sư chuyên môn cao được kiểm duyệt chặt chẽ, chúng tôi mang đến một nền tảng công nghệ tiện ích nhất, giúp quá trình dạy và học vận hành hiệu quả, an toàn và trơn tru như một hệ sinh thái giáo dục toàn diện!
          </p>

          <div className="info-block-buttons">
            <button className="btn-primary" onClick={() => window.location.href = '/lien-he'}>
              Liên hệ ngay
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = '/lien-he'}>
              Về chúng tôi
            </button>
          </div>

          <div className="feedback-section">
            <h4 className="feedback-title">Phản hồi với chúng tôi</h4>
            <div className="feedback-row">
              <div className="feedback-card-item">
                <div className="feedback-icon-round">📞</div>
                <div className="feedback-text-group">
                  <span className="feedback-label">Hotline</span>
                  <span className="feedback-value">+84 354 543 333</span>
                </div>
              </div>
              <div className="feedback-card-item">
                <div className="feedback-icon-round">✉️</div>
                <div className="feedback-text-group">
                  <span className="feedback-label">Email</span>
                  <span className="feedback-value">giasudanangk22@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nửa bên phải: Lý do chọn thương hiệu */}
        <div className="info-right-block">
          <h3 className="why-choose-heading">Tại sao chọn chúng tôi?</h3>
          <div className="why-cards-flex-row">

            <div className="why-feature-card">
              <div className="why-icon-circle-badge">🪪</div>
              <h4 className="why-card-title">Xét duyệt chặt chẽ</h4>
              <p className="why-card-text">Hệ thống yêu cầu gia sư xác minh CCCD và bằng cấp trước khi được duyệt.</p>
            </div>

            <div className="why-feature-card">
              <div className="why-icon-circle-badge">🤝</div>
              <h4 className="why-card-title">Kết nối trực tiếp</h4>
              <p className="why-card-text">Học viên và gia sư trao đổi trực tiếp, không qua trung gian thu phí cắt cổ.</p>
            </div>

            <div className="why-feature-card">
              <div className="why-icon-circle-badge">⭐</div>
              <h4 className="why-card-title">Đánh giá minh bạch</h4>
              <p className="why-card-text">Hệ thống đánh giá công khai giúp bạn dễ dàng chọn được người đồng hành tốt nhất.</p>
            </div>

        </div>
      </div>

      </section>
    </div>
  );
};

export default HomePage;
