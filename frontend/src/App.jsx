import React, { useState } from 'react';
// 1. THÊM BÁNH LÁI VÀ 'Outlet' ĐỂ CHIA LAYOUT
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import Header from './parts/Header';
import Footer from './parts/Footer';

// 2. IMPORT CÁC TRANG CỦA ÔNG
import HomePage from './pages/TrangChu.jsx';
import TimGiaSu from './pages/TimGiaSu.jsx';
import TimMonHoc from './pages/TimMonHoc.jsx';

// 🟢 Bổ sung import trang Yêu Cầu Tìm Gia Sư vừa tạo
import YeuCauTimGiaSu from './pages/YeuCauTimGiaSu.jsx';
import LienHe from './pages/LienHe.jsx';
import Admin from './pages/QuanTriVien';
import GiaSu from './pages/GiaSu.jsx';
import NguoiHoc from './pages/NguoiHoc.jsx';

// 3. IMPORT CÁC COMPONENT GIAO DIỆN
import RegisterModal from './components/trangchu_components/RegisterModal';
import LoginModal from './components/trangchu_components/LoginModal';


function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const PublicLayout = () => {
    return (
      <>
        <Header
          onRegisterClick={() => setShowRegister(true)}
          onLoginClick={() => setShowLogin(true)}
        />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </>
    );
  };

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>

          {/* ================= NHÓM 1: CÁC TRANG CÓ HEADER & FOOTER ================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tim-gia-su" element={<TimGiaSu />} />
            <Route path="/tim-mon-hoc" element={<TimMonHoc />} />
            <Route path="/yeu-cau-tim-gia-su" element={<YeuCauTimGiaSu />} />

            <Route path="/nguoihoc" element={<NguoiHoc />} />
            <Route path="/lien-he" element={<LienHe />} />
          </Route>

          {/* ================= NHÓM 2: CÁC TRANG QUẢN TRỊ ĐỘC LẬP (FULL MÀN HÌNH) ================= */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/giasu" element={<GiaSu />} />

        </Routes>

        {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
