import React, { useState, useEffect } from 'react';
import '../../assets/css/TimMonHoc.css';

import KhungGio_GiaSu_MonHoc_Service from '../../services/KhungGio_GiaSu_MonHoc_Service';

import DangKyMonHoc from '../timmonhoc_components/DangKyMonHoc';

const ChiTietMonHoc = ({ item, onClose }) => {
  const [danhSachKhungGio, setDanhSachKhungGio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const [dangMoFormDangKy, setDangMoFormDangKy] = useState(false);

  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (!item) return;

    const fetchKhungGio = async () => {
      try {
        setIsLoading(true);

        
        const tatCaKhungGio = await KhungGio_GiaSu_MonHoc_Service.layDanhSachKhungGio();

        
        const mangKhungGio = Array.isArray(tatCaKhungGio) ? tatCaKhungGio : [];

        
        const khungGioHopLe = mangKhungGio.filter(
          kg => String(kg.magiasu_monhoc) === String(item.magiasu_monhoc) && Number(kg.trangthai) === 1
        );

        setDanhSachKhungGio(khungGioHopLe);
      } catch (loi) {
        console.error("Lỗi tải khung giờ:", loi);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKhungGio();
  }, [item]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return String(timeStr).slice(0, 5);
  };

  if (!item) return null;

  return (
    <div className="ctmh-modal-overlay" onClick={onClose}>
      <div className="ctmh-container" onClick={(e) => e.stopPropagation()}>

        <button className="ctmh-close-btn" onClick={onClose} title="Đóng cửa sổ">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="ctmh-header">
          <span className="ctmh-badge">{item.tenhelop}</span>
          <h2 className="ctmh-title">Môn giảng dạy: {item.tenmonhoc}</h2>
        </div>

        <div className="ctmh-info-grid">
          <div className="ctmh-info-item">
            <span className="material-symbols-outlined ctmh-info-icon">person</span>
            <div>
              <strong>Gia sư phụ trách:</strong>
              <div style={{ color: '#0284c7', fontWeight: '600' }}>{item.tengiasu}</div>
            </div>
          </div>

          <div className="ctmh-info-item">
            <span className="material-symbols-outlined ctmh-info-icon">location_on</span>
            <div>
              <strong>Khu vực nhận dạy:</strong>
              <div>{item.tenkhuvuc}</div>
            </div>
          </div>

          <div className="ctmh-info-item">
            <span className="material-symbols-outlined ctmh-info-icon">schedule</span>
            <div>
              <strong>Tổng số buổi dự kiến:</strong>
              <div>{item.sobuoihoc} buổi / khóa</div>
            </div>
          </div>

          <div className="ctmh-info-item">
            <span className="material-symbols-outlined ctmh-info-icon">timer</span>
            <div>
              <strong>Thời lượng một buổi:</strong>
              <div>{item.thoiluonghienthi}</div>
            </div>
          </div>

          <div className="ctmh-info-item">
            <span className="material-symbols-outlined ctmh-info-icon">payments</span>
            <div>
              <strong>Tổng học phí toàn khóa:</strong>
              <div className="ctmh-fee-highlight">
                {item.hocphitong > 0 ? `${item.hocphitong.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
              </div>
            </div>
          </div>
        </div>

        {item.mota && (
          <div style={{ marginBottom: '30px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
            <strong>Mô tả chi tiết từ Gia sư:</strong>
            <p style={{ margin: '8px 0 0 0', color: '#475569', lineHeight: '1.6' }}>{item.mota}</p>
          </div>
        )}

        {}
        {!dangMoFormDangKy && (
          <div className="ctmh-schedule-section">
            <h3 className="ctmh-schedule-title">
              <span className="material-symbols-outlined">calendar_month</span>
              Lịch giảng dạy khả dụng của Gia sư
            </h3>

            {isLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: '8px' }}>sync</span>
                Đang tải dữ liệu khung giờ...
              </p>
            ) : danhSachKhungGio.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#dc2626', fontStyle: 'italic', padding: '20px 0' }}>
                Gia sư chưa thiết lập khung giờ rảnh cụ thể cho môn học này.
              </p>
            ) : (
              <div className="ctmh-slot-grid">
                {danhSachKhungGio.map(kg => (
                  <div key={kg.makhunggio} className="ctmh-slot-card">
                    <div className="ctmh-slot-day">{kg.ngayday}</div>
                    <div className="ctmh-slot-time">
                      {formatTime(kg.thoigianbatdau)} - {formatTime(kg.thoigianketthuc)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {dangMoFormDangKy ? (
          <DangKyMonHoc
            item={item}
            onClose={() => setDangMoFormDangKy(false)}
            onSuccess={onClose}
          />
        ) : (
          <button
            type="button"
            className="ctmh-btn-register"
            onClick={() => setDangMoFormDangKy(true)}
          >
            Tiến Hành Đăng Ký Học
          </button>
        )}

      </div>
    </div>
  );
};

export default ChiTietMonHoc;
