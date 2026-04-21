import React, { useState } from 'react';
import './App.css';

/* --- Import các trang --- */
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import DateTimePage from './pages/DateTimePage/DateTimePage';
import FleetPage from './pages/FleetPage/FleetPage';
import ConfirmPage from './pages/ConfirmPage/ConfirmPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import SuccessPage from './pages/SuccessPage/SuccessPage';

/* --- Import dữ liệu xe mặc định --- */
import CARS from './data/cars';

function App() {
  /* ===== STATE QUẢN LÝ TRANG HIỆN TẠI =====
   * Các giá trị: 'home' | 'login' | 'datetime' | 'fleet' | 'confirm' | 'checkout' | 'success'
   */
  const [page, setPage] = useState('home');

  /* ===== STATE THÔNG TIN ĐẶT XE ===== */
  const [booking, setBooking] = useState({
    location: '',       // Địa điểm đón/trả xe
    pickupDate: null,   // Ngày đón (số nguyên, VD: 14)
    returnDate: null,   // Ngày trả (số nguyên, VD: 19)
    pickupTime: '09:00 AM',
    returnTime: '06:30 PM',
    days: 5,            // Số ngày thuê
  });

  /* ===== STATE XE ĐANG CHỌN ===== */
  const [selectedCar, setSelectedCar] = useState(CARS[0]);

  /* --- Xử lý tìm kiếm xe: nếu chưa chọn ngày → mở calendar --- */
  const handleSearch = () => {
    if (!booking.pickupDate) {
      setPage('datetime');
    } else {
      setPage('fleet');
    }
  };

  /* --- Xử lý xác nhận ngày giờ → chuyển sang fleet --- */
  const handleConfirmDateTime = () => setPage('fleet');

  /* --- Xử lý chọn xe → chuyển sang confirm --- */
  const handleSelectCar = (car) => {
    setSelectedCar(car);
    setPage('confirm');
  };

  /* --- Render trang tương ứng với state --- */
  switch (page) {
    case 'login':
      return (
        <LoginPage
          onHome={() => setPage('home')}
          onLoginSuccess={() => setPage('home')}
        />
      );

    case 'datetime':
      return (
        <DateTimePage
          booking={booking}
          setBooking={setBooking}
          onConfirm={handleConfirmDateTime}
          onClose={() => setPage('home')}
        />
      );

    case 'fleet':
      return (
        <FleetPage
          booking={booking}
          onSelectCar={handleSelectCar}
          onHome={() => setPage('home')}
        />
      );

    case 'confirm':
      return (
        <ConfirmPage
          booking={booking}
          car={selectedCar}
          onNext={() => setPage('checkout')}
          onHome={() => setPage('home')}
        />
      );

    case 'checkout':
      return (
        <CheckoutPage
          booking={booking}
          car={selectedCar}
          onPay={() => setPage('success')}
          onHome={() => setPage('home')}
        />
      );

    case 'success':
      return (
        <SuccessPage
          car={selectedCar}
          booking={booking}
          onHome={() => setPage('home')}
        />
      );

    default: // 'home'
      return (
        <HomePage
          booking={booking}
          setBooking={setBooking}
          onLogin={() => setPage('login')}
          onSearch={handleSearch}
          onOpenCalendar={() => setPage('datetime')}
        />
      );
  }
}

export default App;
