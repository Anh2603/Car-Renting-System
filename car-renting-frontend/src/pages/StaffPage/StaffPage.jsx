import React, { useEffect, useMemo, useState } from 'react';
import './StaffPage.css';

import {
  cancelStaffBooking,
  completeStaffBooking,
  getStaffBookings,
  getStaffCars,
  getStaffDashboard,
  markStaffBookingPickedUp,
  updateStaffCarStatus,
} from '../../services/staffService';
import { getContactMessages, updateContactMessageStatus } from '../../services/contactService';
import { API_BASE_URL } from '../../config/api';


const getAttachmentHref = (message) => {
  if (!message?.attachment_url) return null;
  if (message.attachment_url.startsWith('http')) return message.attachment_url;
  return `${API_BASE_URL}${message.attachment_url}`;
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bookings', label: 'All Bookings' },
  { id: 'returns', label: 'Returns' },
  { id: 'messages', label: 'Messages' },
  { id: 'cars', label: 'Cars Status' },
];

const BOOKING_FILTERS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PICKED_UP', label: 'Picked up' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const CAR_FILTERS = [
  { value: 'ALL', label: 'All cars' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const MESSAGE_FILTERS = [
  { value: 'ALL', label: 'All messages' },
  { value: 'NEW', label: 'New' },
  { value: 'READ', label: 'Read' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const formatMoney = (value) => {
  const numberValue = Number(value || 0);
  return `${numberValue.toLocaleString('vi-VN')} VND`;
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return String(value).split('T')[0];
};

const formatTime = (value) => {
  if (!value) return '';
  return String(value).slice(0, 5);
};

const normalizeStatusLabel = (status) => String(status || 'UNKNOWN').replaceAll('_', ' ');

function StatusBadge({ status, type = 'booking' }) {
  return (
    <span className={`staff-badge staff-badge--${type} staff-badge--${String(status || '').toLowerCase()}`}>
      {normalizeStatusLabel(status)}
    </span>
  );
}

function StaffSidebar({ activeTab, setActiveTab, user, onLogout, onHome, onProfile, onChangePassword }) {
  return (
    <aside className="staff-sidebar">
      <div className="staff-sidebar-brand">
        <div className="staff-logo">CR</div>
        <div>
          <strong>Staff Panel</strong>
          <span>Daily operations</span>
        </div>
      </div>

      <nav className="staff-sidebar-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="staff-sidebar-user">
        <span>Signed in as</span>
        <strong>{user?.full_name || 'Staff User'}</strong>
        <button type="button" onClick={onHome}>Customer Home</button>
        <button type="button" onClick={onProfile}>My Profile</button>
        <button type="button" onClick={onChangePassword}>Change Password</button>
        <button type="button" className="danger" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}

function DashboardView({ dashboard, loading, onRefresh, setActiveTab }) {
  const cards = [
    {
      label: 'Waiting pickup',
      value: dashboard?.bookings?.confirmedWaitingPickup || 0,
      helper: 'Confirmed bookings ready for handover',
    },
    {
      label: 'Picked up',
      value: dashboard?.bookings?.currentlyPickedUp || 0,
      helper: 'Cars currently with customers',
    },
    {
      label: 'Due returns',
      value: dashboard?.bookings?.dueReturnsToday || 0,
      helper: 'Picked-up bookings due today or earlier',
    },
    {
      label: 'Cash pending',
      value: dashboard?.payments?.pendingCash || 0,
      helper: 'Cash payments waiting for pickup confirmation',
    },
    {
      label: 'Maintenance cars',
      value: dashboard?.cars?.maintenance || 0,
      helper: 'Cars not ready for customers',
    },
  ];

  return (
    <section className="staff-section">
      <div className="staff-section-header">
        <div>
          <p className="staff-eyebrow">Operations</p>
          <h1>Staff Dashboard</h1>
        </div>
        <button type="button" className="staff-refresh-btn" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="staff-stats-grid">
        {cards.map((card) => (
          <article className="staff-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.helper}</p>
          </article>
        ))}
      </div>

      <div className="staff-dashboard-grid">
        <article className="staff-panel-card">
          <div className="staff-card-title-row">
            <h2>Pickup queue</h2>
            <button type="button" onClick={() => setActiveTab('bookings')}>Open</button>
          </div>
          {(dashboard?.pickupQueue || []).length === 0 ? (
            <p className="staff-empty-text">No confirmed bookings waiting for pickup.</p>
          ) : (
            <div className="staff-mini-list">
              {dashboard.pickupQueue.map((booking) => (
                <div key={booking.id} className="staff-mini-item">
                  <strong>#{booking.id} · {booking.car_name}</strong>
                  <span>{booking.renter_name} · {formatDate(booking.pickup_date)} {formatTime(booking.pickup_time)}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="staff-panel-card">
          <div className="staff-card-title-row">
            <h2>Return queue</h2>
            <button type="button" onClick={() => setActiveTab('returns')}>Open</button>
          </div>
          {(dashboard?.returnQueue || []).length === 0 ? (
            <p className="staff-empty-text">No picked-up cars waiting for return.</p>
          ) : (
            <div className="staff-mini-list">
              {dashboard.returnQueue.map((booking) => (
                <div key={booking.id} className="staff-mini-item">
                  <strong>#{booking.id} · {booking.car_name}</strong>
                  <span>{booking.renter_name} · return {formatDate(booking.return_date)} {formatTime(booking.return_time)}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function BookingActions({ booking, onPickup, onComplete, onCancel, busyId }) {
  const isBusy = busyId === booking.id;

  if (booking.status === 'CONFIRMED') {
    const cashPending = booking.payment_method === 'CASH' && booking.payment_status === 'PENDING';

    return (
      <div className="staff-action-stack">
        <button type="button" onClick={() => onPickup(booking)} disabled={isBusy}>
          {cashPending ? 'Pickup + Cash Received' : 'Mark Picked Up'}
        </button>
        <button type="button" className="ghost-danger" onClick={() => onCancel(booking)} disabled={isBusy}>
          Cancel
        </button>
      </div>
    );
  }

  if (booking.status === 'PENDING') {
    return (
      <button type="button" className="ghost-danger" onClick={() => onCancel(booking)} disabled={isBusy}>
        Cancel
      </button>
    );
  }

  if (booking.status === 'PICKED_UP') {
    return (
      <div className="staff-action-stack">
        <button type="button" onClick={() => onComplete(booking, 'AVAILABLE')} disabled={isBusy}>
          Complete
        </button>
        <button type="button" className="ghost-warning" onClick={() => onComplete(booking, 'MAINTENANCE')} disabled={isBusy}>
          Complete + Maintenance
        </button>
      </div>
    );
  }

  return <span className="staff-muted">No action</span>;
}

function BookingsTable({ bookings, busyId, onPickup, onComplete, onCancel }) {
  if (!bookings.length) {
    return <div className="staff-empty-box">No bookings found.</div>;
  }

  return (
    <div className="staff-table-wrap">
      <table className="staff-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Car</th>
            <th>Pickup / Return</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>#{booking.id}</td>
              <td>
                <strong>{booking.renter_name || booking.customer_name}</strong>
                <span>{booking.customer_email}</span>
                <span>{booking.renter_phone}</span>
                <span className="staff-muted">License: {booking.driver_license_number}</span>
              </td>
              <td>
                <strong>{booking.car_name}</strong>
                <span>{booking.car_brand} {booking.car_model}</span>
                <span>{booking.pickup_address}</span>
              </td>
              <td>
                <strong>{formatDate(booking.pickup_date)} {formatTime(booking.pickup_time)}</strong>
                <span>{formatDate(booking.return_date)} {formatTime(booking.return_time)}</span>
              </td>
              <td>{formatMoney(booking.total_price)}</td>
              <td><StatusBadge status={booking.status} /></td>
              <td>
                <StatusBadge status={booking.payment_status || 'NO PAYMENT'} type="payment" />
                <span>{booking.payment_method || 'N/A'}</span>
              </td>
              <td>
                <BookingActions
                  booking={booking}
                  busyId={busyId}
                  onPickup={onPickup}
                  onComplete={onComplete}
                  onCancel={onCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingsView({ title, subtitle, bookings, filter, setFilter, search, setSearch, loading, busyId, onRefresh, onPickup, onComplete, onCancel }) {
  return (
    <section className="staff-section">
      <div className="staff-section-header">
        <div>
          <p className="staff-eyebrow">Booking operations</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button type="button" className="staff-refresh-btn" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="staff-toolbar">
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          {BOOKING_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search booking, customer, phone, car..."
        />
      </div>

      <BookingsTable
        bookings={bookings}
        busyId={busyId}
        onPickup={onPickup}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </section>
  );
}

function CarsView({ cars, filter, setFilter, search, setSearch, loading, busyId, onRefresh, onUpdateCarStatus }) {
  return (
    <section className="staff-section">
      <div className="staff-section-header">
        <div>
          <p className="staff-eyebrow">Fleet operations</p>
          <h1>Cars Status</h1>
          <p>Staff can only update operational status. Creating or deleting cars stays with Admin.</p>
        </div>
        <button type="button" className="staff-refresh-btn" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="staff-toolbar">
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          {CAR_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search car name, brand, model..."
        />
      </div>

      {!cars.length ? (
        <div className="staff-empty-box">No cars found.</div>
      ) : (
        <div className="staff-car-grid">
          {cars.map((car) => (
            <article className="staff-car-card" key={car.id}>
              <div className="staff-car-image-wrap">
                <img src={car.image_url} alt={car.name} />
              </div>
              <div className="staff-car-body">
                <div>
                  <h2>{car.name}</h2>
                  <p>{car.brand} {car.model} · {car.category}</p>
                </div>
                <StatusBadge status={car.status} type="car" />
                <p>{car.seats} seats · {car.transmission} · {car.fuel_type}</p>
                <strong>{formatMoney(car.price_per_day)} / day</strong>
                <div className="staff-car-actions">
                  {String(car.status || '').toUpperCase() === 'RENTED' ? (
                    <p className="staff-car-status-note">
                      Currently rented. Complete return first.
                    </p>
                  ) : String(car.status || '').toUpperCase() === 'MAINTENANCE' ? (
                    <button
                      type="button"
                      disabled={busyId === car.id}
                      onClick={() => onUpdateCarStatus(car, 'AVAILABLE')}
                    >
                      Available
                    </button>
                  ) : String(car.status || '').toUpperCase() === 'AVAILABLE' ? (
                    <button
                      type="button"
                      className="ghost-warning"
                      disabled={busyId === car.id}
                      onClick={() => onUpdateCarStatus(car, 'MAINTENANCE')}
                    >
                      Maintenance
                    </button>
                  ) : (
                    <p className="staff-car-status-note">
                      Inactive. Admin can reactivate this car.
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MessagesView({ messages, filter, setFilter, loading, busyId, onRefresh, onUpdateStatus }) {
  return (
    <section className="staff-section">
      <div className="staff-section-header">
        <div>
          <p className="staff-eyebrow">Customer support</p>
          <h1>Support Messages</h1>
          <p>Review support requests submitted from the Contact Us form.</p>
        </div>
        <button type="button" className="staff-refresh-btn" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="staff-toolbar">
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          {MESSAGE_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      {!messages.length ? (
        <div className="staff-empty-box">No contact messages found.</div>
      ) : (
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Topic / Details</th>
                <th>Booking</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((item) => (
                <tr key={item.id}>
                  <td>MSG-{item.id}</td>
                  <td>
                    <strong>{item.full_name}</strong>
                    <span>{item.email}</span>
                    <span>{item.phone || '-'}</span>
                  </td>
                  <td>{item.contact_reason}</td>
                  <td>
                    <strong>{item.topic}</strong>
                    <span>{item.message}</span>
                    {getAttachmentHref(item) ? (
                      <a
                        className="staff-attachment-link"
                        href={getAttachmentHref(item)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View {item.attachment_name || 'attachment'}
                      </a>
                    ) : (
                      <span>{item.attachment_name ? `Attachment: ${item.attachment_name}` : ''}</span>
                    )}
                  </td>
                  <td>{item.booking_id ? `#${item.booking_id}` : '-'}<span>{item.car_name || item.booking_status || ''}</span></td>
                  <td><StatusBadge status={item.status} type="payment" /></td>
                  <td>
                    <select value={item.status} disabled={busyId === item.id} onChange={(event) => onUpdateStatus(item, event.target.value)}>
                      <option value="NEW">New</option>
                      <option value="READ">Read</option>
                      <option value="REPLIED">Replied</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StaffPage({ user, onHome, onLogout, onProfile, onChangePassword }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [messages, setMessages] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [carFilter, setCarFilter] = useState('ALL');
  const [messageFilter, setMessageFilter] = useState('ALL');
  const [bookingSearch, setBookingSearch] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const effectiveBookingFilter = useMemo(() => {
    if (activeTab === 'returns') return 'PICKED_UP';
    return bookingFilter;
  }, [activeTab, bookingFilter]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getStaffDashboard();
      setDashboard(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getStaffBookings({
        status: effectiveBookingFilter,
        search: bookingSearch,
      });
      setBookings(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCars = async () => {
    setLoading(true);
    try {
      const data = await getStaffCars({
        status: carFilter,
        search: carSearch,
      });
      setCars(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages({ status: messageFilter });
      setMessages(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrent = async () => {
    if (activeTab === 'dashboard') {
      await loadDashboard();
      return;
    }

    if (activeTab === 'cars') {
      await loadCars();
      return;
    }

    if (activeTab === 'messages') {
      await loadMessages();
      return;
    }

    await loadBookings();
  };

  useEffect(() => {
    refreshCurrent();
  }, [activeTab, effectiveBookingFilter, carFilter, messageFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeTab === 'bookings' || activeTab === 'returns') {
        loadBookings();
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [bookingSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeTab === 'cars') {
        loadCars();
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [carSearch]);

  const handlePickup = async (booking) => {
    const cashPending = booking.payment_method === 'CASH' && booking.payment_status === 'PENDING';
    const message = cashPending
      ? 'Confirm pickup and mark Cash payment as received?'
      : 'Confirm this booking as picked up?';

    if (!window.confirm(message)) return;

    setBusyId(booking.id);
    try {
      await markStaffBookingPickedUp(booking.id);
      await refreshCurrent();
      await loadDashboard();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = async (booking, carStatus) => {
    const message = carStatus === 'MAINTENANCE'
      ? 'Complete booking and move the car to maintenance?'
      : 'Complete booking and mark car available?';

    if (!window.confirm(message)) return;

    setBusyId(booking.id);
    try {
      await completeStaffBooking(booking.id, carStatus);
      await refreshCurrent();
      await loadDashboard();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking #${booking.id}?`)) return;

    setBusyId(booking.id);
    try {
      await cancelStaffBooking(booking.id);
      await refreshCurrent();
      await loadDashboard();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateMessageStatus = async (message, status) => {
    setBusyId(message.id);
    try {
      await updateContactMessageStatus(message.id, status);
      await loadMessages();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateCarStatus = async (car, status) => {
    if (!window.confirm(`Set ${car.name} to ${status}?`)) return;

    setBusyId(car.id);
    try {
      await updateStaffCarStatus(car.id, status);
      await loadCars();
      await loadDashboard();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="staff-page">
      <StaffSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onHome={onHome}
        onLogout={onLogout}
        onProfile={onProfile}
        onChangePassword={onChangePassword}
      />

      <div className="staff-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            dashboard={dashboard}
            loading={loading}
            onRefresh={loadDashboard}
            setActiveTab={setActiveTab}
          />
        )}


        {activeTab === 'returns' && (
          <BookingsView
            title="Return Management"
            subtitle="Complete picked-up bookings when customers return the car."
            bookings={bookings}
            filter="PICKED_UP"
            setFilter={() => {}}
            search={bookingSearch}
            setSearch={setBookingSearch}
            loading={loading}
            busyId={busyId}
            onRefresh={loadBookings}
            onPickup={handlePickup}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsView
            title="All Bookings"
            subtitle="Review all operational bookings. Confirmed bookings can be picked up here; returned cars are handled in Returns."
            bookings={bookings}
            filter={bookingFilter}
            setFilter={setBookingFilter}
            search={bookingSearch}
            setSearch={setBookingSearch}
            loading={loading}
            busyId={busyId}
            onRefresh={loadBookings}
            onPickup={handlePickup}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            messages={messages}
            filter={messageFilter}
            setFilter={setMessageFilter}
            loading={loading}
            busyId={busyId}
            onRefresh={loadMessages}
            onUpdateStatus={handleUpdateMessageStatus}
          />
        )}

        {activeTab === 'cars' && (
          <CarsView
            cars={cars}
            filter={carFilter}
            setFilter={setCarFilter}
            search={carSearch}
            setSearch={setCarSearch}
            loading={loading}
            busyId={busyId}
            onRefresh={loadCars}
            onUpdateCarStatus={handleUpdateCarStatus}
          />
        )}
      </div>
    </main>
  );
}

export default StaffPage;
