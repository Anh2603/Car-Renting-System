import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import DateTimePage from './pages/DateTimePage/DateTimePage';
import FleetPage from './pages/FleetPage/FleetPage';
import ConfirmPage from './pages/ConfirmPage/ConfirmPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import SuccessPage from './pages/SuccessPage/SuccessPage';
import MyBookingsPage from './pages/MyBookingsPage/MyBookingsPage';
import AdminPage from './pages/AdminPage/AdminPage';
import ContactPage from './pages/ContactPage/ContactPage';
import StaffPage from './pages/StaffPage/StaffPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage/ChangePasswordPage';
import { LanguageProvider } from './i18n/LanguageContext';

import { getCarById } from './services/carService';
import { createBooking } from './services/bookingService';
import { createPayment } from './services/paymentService';
import { normalizeDateForApi } from './utils/bookingFormat';

const initialBookingState = {
  location: '',
  pickupDate: null,
  returnDate: null,
  pickupTime: '09:00 AM',
  returnTime: '06:30 PM',
  days: 3,

  customerFullName: '',
  customerPhone: '',
  driverLicenseNumber: '',
  pickupAddress: '',
  customerNote: '',
};

const HISTORY_STATE_KEY = 'carRentalPage';

const PAGE_PATHS = {
  home: '/',
  login: '/login',
  datetime: '/schedule',
  fleet: '/fleet',
  confirm: '/confirm',
  checkout: '/checkout',
  success: '/success',
  'my-bookings': '/my-bookings',
  admin: '/admin',
  staff: '/staff',
  contact: '/contact',
  profile: '/profile',
  'change-password': '/change-password',
};

const PATH_TO_PAGE = Object.entries(PAGE_PATHS).reduce((map, [pageName, path]) => {
  map[path] = pageName;
  return map;
}, {});

const getPageFromPath = () => PATH_TO_PAGE[window.location.pathname] || 'home';

const getInitialPage = () => {
  const pageFromPath = getPageFromPath();

  if (pageFromPath !== 'home') {
    return pageFromPath;
  }

  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (savedUser?.role === 'ADMIN') return 'admin';
    if (savedUser?.role === 'STAFF') return 'staff';
    return 'home';
  } catch (error) {
    return 'home';
  }
};

function App() {
  const [page, setPage] = useState(getInitialPage);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  const [booking, setBooking] = useState(initialBookingState);
  const [selectedCar, setSelectedCar] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [createdPayment, setCreatedPayment] = useState(null);

  const pageRef = useRef(page);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    window.history.replaceState(
      { ...(window.history.state || {}), [HISTORY_STATE_KEY]: pageRef.current },
      '',
      PAGE_PATHS[pageRef.current] || window.location.pathname
    );

    const handleBrowserBackForward = (event) => {
      const browserPage = event.state?.[HISTORY_STATE_KEY] || getPageFromPath();
      setPage(browserPage);
    };

    window.addEventListener('popstate', handleBrowserBackForward);

    return () => {
      window.removeEventListener('popstate', handleBrowserBackForward);
    };
  }, []);

  const navigateToPage = (targetPage, options = {}) => {
    const { replace = false } = options;

    setPage(targetPage);

    const currentHistoryPage = window.history.state?.[HISTORY_STATE_KEY];
    const nextState = {
      ...(window.history.state || {}),
      [HISTORY_STATE_KEY]: targetPage,
    };
    const nextPath = PAGE_PATHS[targetPage] || '/';

    if (replace) {
      window.history.replaceState(nextState, '', nextPath);
      return;
    }

    if (currentHistoryPage !== targetPage || window.location.pathname !== nextPath) {
      window.history.pushState(nextState, '', nextPath);
    }
  };

  const goToPage = (targetPage, options = {}) => {
    let nextPage = targetPage;

    if (targetPage === 'fleet' && (!booking.pickupDate || !booking.returnDate)) {
      nextPage = 'datetime';
    }

    if (targetPage === 'confirm' && !selectedCar) {
      nextPage = 'fleet';
    }

    navigateToPage(nextPage, options);
  };


  useEffect(() => {
    const handleFooterNavigation = (event) => {
      const target = event.detail?.target || 'home';

      if (target === 'fleet') {
        goToPage('fleet');
        return;
      }

      if (target === 'contact') {
        sessionStorage.removeItem('carRentalFooterTarget');
        goToPage('contact');
        return;
      }

      if (target === 'book') {
        sessionStorage.setItem('carRentalFooterTarget', target);
        goToPage('home');

        window.setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('car-rental:home-action', {
              detail: { target },
            })
          );
        }, 140);
        return;
      }

      sessionStorage.removeItem('carRentalFooterTarget');
      goToPage('home');
    };

    window.addEventListener('car-rental:footer-navigate', handleFooterNavigation);

    return () => {
      window.removeEventListener('car-rental:footer-navigate', handleFooterNavigation);
    };
  }, [booking.pickupDate, booking.returnDate, selectedCar]);

  const hydrateBookingFromUser = (userData) => {
    setBooking((currentBooking) => ({
      ...currentBooking,
      customerFullName:
        currentBooking.customerFullName ||
        userData?.full_name ||
        '',
      customerPhone:
        currentBooking.customerPhone ||
        userData?.phone ||
        '',
    }));
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    hydrateBookingFromUser(userData);

    if (userData?.role === 'ADMIN') {
      goToPage('admin');
      return;
    }

    if (userData?.role === 'STAFF') {
      goToPage('staff');
      return;
    }

    goToPage('home');
  };


  const handleUserUpdate = (updatedUser) => {
    if (!updatedUser) return;

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    hydrateBookingFromUser(updatedUser);
  };

  const handleOpenProfile = () => {
    if (!localStorage.getItem('token')) {
      alert('Please login first to open your profile.');
      goToPage('login');
      return;
    }

    goToPage('profile');
  };

  const handleOpenChangePassword = () => {
    if (!localStorage.getItem('token')) {
      alert('Please login first to change password.');
      goToPage('login');
      return;
    }

    goToPage('change-password');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);
    setSelectedCar(null);
    setCreatedBooking(null);
    setCreatedPayment(null);

    setBooking((currentBooking) => ({
      ...currentBooking,
      customerFullName: '',
      customerPhone: '',
      driverLicenseNumber: '',
      pickupAddress: '',
      customerNote: '',
    }));

    goToPage('home', { replace: true });
  };

  const handleOpenMyBookings = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login to view your bookings.');
      goToPage('login');
      return;
    }

    goToPage('my-bookings');
  };

  const handleSearch = () => {
    if (!booking.location) {
      alert('Please select a rental location.');
      return;
    }

    goToPage(booking.pickupDate && booking.returnDate ? 'fleet' : 'datetime');
  };

  const handleConfirmDateTime = () => goToPage('fleet');

  const handleSelectCar = async (car) => {
    try {
      const carDetail = await getCarById(car.id);
      setSelectedCar(carDetail);
    } catch (error) {
      console.error('Failed to fetch car detail:', error);
      setSelectedCar(car);
    } finally {
      setCreatedBooking(null);
      setCreatedPayment(null);
      goToPage('confirm');
    }
  };

  const validateRentalAgreement = () => {
    if (!booking.location) {
      alert('Please select a rental location.');
      goToPage('home');
      return false;
    }

    if (!booking.customerFullName.trim()) {
      alert('Please enter customer full name.');
      return false;
    }

    if (!booking.customerPhone.trim()) {
      alert('Please enter customer phone number.');
      return false;
    }

    if (!booking.driverLicenseNumber.trim()) {
      alert("Please enter driver's license number.");
      return false;
    }

    if (!booking.pickupAddress.trim()) {
      alert('Please enter specific pickup address.');
      return false;
    }

    return true;
  };

  const handleCreateBooking = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login before booking a car.');
        goToPage('login');
        return;
      }

      if (!selectedCar) {
        alert('Please select a car first.');
        goToPage('fleet');
        return;
      }

      if (!booking.pickupDate || !booking.returnDate) {
        alert('Please choose pickup and return dates first.');
        goToPage('datetime');
        return;
      }

      if (!validateRentalAgreement()) {
        return;
      }

      const formattedPickupDate = normalizeDateForApi(booking.pickupDate);
      const formattedReturnDate = normalizeDateForApi(booking.returnDate);

      if (!formattedPickupDate || !formattedReturnDate) {
        alert('Invalid pickup or return date.');
        return;
      }

      const fullRentalLocation = `${booking.location} - ${booking.pickupAddress.trim()}`;

      const bookingData = await createBooking({
        carId: selectedCar.id,
        pickupLocation: fullRentalLocation,
        returnLocation: fullRentalLocation,
        pickupDate: formattedPickupDate,
        returnDate: formattedReturnDate,
        pickupTime: booking.pickupTime,
        returnTime: booking.returnTime,

        customerFullName: booking.customerFullName?.trim(),
        customerPhone: booking.customerPhone?.trim(),
        driverLicenseNumber: booking.driverLicenseNumber?.trim(),
        pickupAddress: booking.pickupAddress?.trim(),
        customerNote: booking.customerNote?.trim() || null,
      });

      setCreatedBooking(bookingData);
      setCreatedPayment(null);
      goToPage('checkout');
    } catch (error) {
      console.error('Create booking error:', error);
      alert(error.message);
    }
  };

  const handleCreatePayment = async (paymentMethod = 'DEMO_CARD') => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login before payment.');
        goToPage('login');
        return;
      }

      const bookingId = createdBooking?.id || createdBooking?.booking_id;
      const amount = createdBooking?.total_price || createdBooking?.amount;

      if (!bookingId) {
        alert('Booking ID is missing.');
        return;
      }

      if (!amount) {
        alert('Booking amount is missing.');
        return;
      }

      const paymentData = await createPayment({
        bookingId,
        amount,
        method: paymentMethod,
      });

      setCreatedPayment(paymentData);
      goToPage('success');
    } catch (error) {
      console.error('Create payment error:', error);
      alert(error.message);
    }
  };

  const commonNavbarProps = {
    user,
    isLoggedIn: Boolean(user || localStorage.getItem('token')),
    onLogin: () => goToPage('login'),
    onLogout: handleLogout,
    onMyBookings: handleOpenMyBookings,
    onProfile: handleOpenProfile,
    onChangePassword: handleOpenChangePassword,
    onAdminPanel: () => goToPage('admin'),
    onStaffPanel: () => goToPage('staff'),
  };

  const renderPage = () => {
    switch (page) {
      case 'staff':
        if (!user || !['STAFF', 'ADMIN'].includes(user.role)) {
          return (
            <LoginPage
              onHome={() => goToPage('home')}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }

        return (
          <StaffPage
            user={user}
            onHome={() => goToPage('home')}
            onLogout={handleLogout}
            onProfile={handleOpenProfile}
            onChangePassword={handleOpenChangePassword}
          />
        );

      case 'admin':
        if (!user || user.role !== 'ADMIN') {
          return (
            <LoginPage
              onHome={() => goToPage('home')}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }

        return (
          <AdminPage
            user={user}
            onHome={() => goToPage('home')}
            onLogout={handleLogout}
            onProfile={handleOpenProfile}
            onChangePassword={handleOpenChangePassword}
          />
        );

      case 'login':
        return (
          <LoginPage
            onHome={() => goToPage('home')}
            onLoginSuccess={handleLoginSuccess}
          />
        );

      case 'datetime':
        return (
          <DateTimePage
            booking={booking}
            setBooking={setBooking}
            onConfirm={handleConfirmDateTime}
            onClose={() => goToPage('home')}
          />
        );

      case 'fleet':
        return (
          <FleetPage
            booking={booking}
            onSelectCar={handleSelectCar}
            onHome={() => goToPage('home')}
            onEditSchedule={() => goToPage('datetime')}
            {...commonNavbarProps}
          />
        );

      case 'confirm':
        return selectedCar ? (
          <ConfirmPage
            booking={booking}
            setBooking={setBooking}
            car={selectedCar}
            onNext={handleCreateBooking}
            onHome={() => goToPage('home')}
            onBackToFleet={() => goToPage('fleet')}
            {...commonNavbarProps}
          />
        ) : (
          <FleetPage
            booking={booking}
            onSelectCar={handleSelectCar}
            onHome={() => goToPage('home')}
            onEditSchedule={() => goToPage('datetime')}
            {...commonNavbarProps}
          />
        );

      case 'checkout':
        return selectedCar ? (
          <CheckoutPage
            booking={booking}
            car={selectedCar}
            createdBooking={createdBooking}
            onPay={handleCreatePayment}
            onHome={() => goToPage('home')}
            {...commonNavbarProps}
          />
        ) : (
          <FleetPage
            booking={booking}
            onSelectCar={handleSelectCar}
            onHome={() => goToPage('home')}
            onEditSchedule={() => goToPage('datetime')}
            {...commonNavbarProps}
          />
        );

      case 'profile':
        if (!user && !localStorage.getItem('token')) {
          return (
            <LoginPage
              onHome={() => goToPage('home')}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }

        return (
          <ProfilePage
            user={user}
            onHome={() => goToPage('home')}
            onBack={() => goToPage(user?.role === 'ADMIN' ? 'admin' : user?.role === 'STAFF' ? 'staff' : 'home')}
            onChangePassword={handleOpenChangePassword}
            onUserUpdate={handleUserUpdate}
          />
        );

      case 'change-password':
        if (!user && !localStorage.getItem('token')) {
          return (
            <LoginPage
              onHome={() => goToPage('home')}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        }

        return (
          <ChangePasswordPage
            user={user}
            onHome={() => goToPage('home')}
            onBack={() => goToPage('profile')}
          />
        );

      case 'contact':
        return (
          <ContactPage
            user={user}
            onHome={() => goToPage('home')}
            onBook={() => goToPage('datetime')}
          />
        );

      case 'my-bookings':
        return (
          <MyBookingsPage
            onHome={() => goToPage('home')}
            onLogin={() => goToPage('login')}
            {...commonNavbarProps}
          />
        );

      case 'success':
        return selectedCar ? (
          <SuccessPage
            car={selectedCar}
            booking={booking}
            createdBooking={createdBooking}
            createdPayment={createdPayment}
            onHome={() => goToPage('home')}
          />
        ) : (
          <HomePage
            booking={booking}
            setBooking={setBooking}
            user={user}
            onLogin={() => goToPage('login')}
            onLogout={handleLogout}
            onMyBookings={handleOpenMyBookings}
            onProfile={handleOpenProfile}
            onChangePassword={handleOpenChangePassword}
            onAdminPanel={() => goToPage('admin')}
            onStaffPanel={() => goToPage('staff')}
            onSearch={handleSearch}
            onOpenCalendar={() => goToPage('datetime')}
            onContact={() => goToPage('contact')}
          />
        );

      default:
        return (
          <HomePage
            booking={booking}
            setBooking={setBooking}
            user={user}
            onLogin={() => goToPage('login')}
            onLogout={handleLogout}
            onMyBookings={handleOpenMyBookings}
            onProfile={handleOpenProfile}
            onChangePassword={handleOpenChangePassword}
            onAdminPanel={() => goToPage('admin')}
            onStaffPanel={() => goToPage('staff')}
            onSearch={handleSearch}
            onOpenCalendar={() => goToPage('datetime')}
            onContact={() => goToPage('contact')}
          />
        );
    }
  };

  return (
    <LanguageProvider>
      <div className="car-app">{renderPage()}</div>
    </LanguageProvider>
  );
}

export default App;
