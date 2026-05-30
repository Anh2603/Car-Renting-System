import React, { useEffect, useMemo, useState } from 'react';
import {
  createAdminCar,
  createAdminStaff,
  getAdminBookings,
  getAdminCars,
  getAdminDashboard,
  getAdminPayments,
  getAdminStaff,
  getAdminUsers,
  updateAdminBookingStatus,
  updateAdminCar,
  updateAdminCarStatus,
  updateAdminPaymentStatus,
  updateAdminStaffStatus,
  updateAdminUserStatus,
} from '../../services/adminService';
import { getContactMessages, updateContactMessageStatus } from '../../services/contactService';
import { API_BASE_URL } from '../../config/api';
import './AdminPage.css';


const getAttachmentHref = (message) => {
  if (!message?.attachment_url) return null;
  if (message.attachment_url.startsWith('http')) return message.attachment_url;
  return `${API_BASE_URL}${message.attachment_url}`;
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'cars', label: 'Cars' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'users', label: 'Users' },
  { id: 'staff', label: 'Staff' },
  { id: 'messages', label: 'Messages' },
  { id: 'payments', label: 'Payments' },
];

const EMPTY_CAR_FORM = {
  id: null,
  name: '',
  brand: '',
  model: '',
  year: '',
  category: 'ECONOMY',
  price_per_day: '',
  image_url: '',
  transmission: 'Automatic',
  fuel_type: 'Gasoline',
  seats: 5,
  status: 'AVAILABLE',
  description: '',
};

const EMPTY_STAFF_FORM = {
  full_name: '',
  email: '',
  password: '123456',
  phone: '',
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VND`;

const getStatusClassName = (status) => {
  if (['AVAILABLE', 'ACTIVE', 'CONFIRMED', 'SUCCESS', 'COMPLETED', 'REPLIED'].includes(status)) {
    return 'admin-status admin-status--success';
  }

  if (['PENDING', 'MAINTENANCE', 'PICKED_UP', 'NEW', 'READ'].includes(status)) {
    return 'admin-status admin-status--warning';
  }

  if (['CANCELLED', 'FAILED', 'INACTIVE', 'LOCKED', 'REFUNDED', 'ARCHIVED'].includes(status)) {
    return 'admin-status admin-status--danger';
  }

  if (status === 'RENTED') {
    return 'admin-status admin-status--info';
  }

  return 'admin-status';
};

function StatCard({ label, value, hint }) {
  return (
    <div className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function AdminPage({ user, onHome, onLogout, onProfile, onChangePassword }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [dashboard, setDashboard] = useState(null);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);

  const [carStatusFilter, setCarStatusFilter] = useState('ALL');
  const [carCategoryFilter, setCarCategoryFilter] = useState('ALL');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [messageStatusFilter, setMessageStatusFilter] = useState('ALL');

  const [carForm, setCarForm] = useState(EMPTY_CAR_FORM);
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF_FORM);

  const isEditingCar = Boolean(carForm.id);

  const userLabel = useMemo(() => {
    return user?.full_name || user?.email || 'Admin';
  }, [user]);

  const showMessage = (text) => {
    setMessage(text);
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => setMessage(''), 3000);
  };

  const runAction = async (action, successMessage) => {
    try {
      setLoading(true);
      await action();
      if (successMessage) showMessage(successMessage);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Admin action failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    const data = await getAdminDashboard();
    setDashboard(data);
  };

  const loadCars = async () => {
    const data = await getAdminCars({
      status: carStatusFilter,
      category: carCategoryFilter,
    });
    setCars(data);
  };

  const loadBookings = async () => {
    const data = await getAdminBookings({ status: bookingStatusFilter });
    setBookings(data);
  };

  const loadUsers = async () => {
    const data = await getAdminUsers({ role: 'USER' });
    setUsers(data);
  };

  const loadStaff = async () => {
    const data = await getAdminStaff();
    setStaff(data);
  };

  const loadPayments = async () => {
    const data = await getAdminPayments({ status: paymentStatusFilter });
    setPayments(data);
  };

  const loadMessages = async () => {
    const data = await getContactMessages({ status: messageStatusFilter });
    setMessages(data);
  };

  const refreshActiveTab = async () => {
    if (activeTab === 'dashboard') await loadDashboard();
    if (activeTab === 'cars') await loadCars();
    if (activeTab === 'bookings') await loadBookings();
    if (activeTab === 'users') await loadUsers();
    if (activeTab === 'staff') await loadStaff();
    if (activeTab === 'messages') await loadMessages();
    if (activeTab === 'payments') await loadPayments();
  };

  useEffect(() => {
    runAction(refreshActiveTab);
  }, [activeTab, carStatusFilter, carCategoryFilter, bookingStatusFilter, paymentStatusFilter, messageStatusFilter]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (onLogout) {
      onLogout();
      return;
    }

    window.location.reload();
  };

  const handleCarFormChange = (field, value) => {
    setCarForm((current) => ({ ...current, [field]: value }));
  };

  const handleStaffFormChange = (field, value) => {
    setStaffForm((current) => ({ ...current, [field]: value }));
  };

  const handleEditCar = (car) => {
    setCarForm({
      id: car.id,
      name: car.name || '',
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      category: car.category || 'ECONOMY',
      price_per_day: car.price_per_day || '',
      image_url: car.image_url || '',
      transmission: car.transmission || 'Automatic',
      fuel_type: car.fuel_type || 'Gasoline',
      seats: car.seats || 5,
      status: car.status || 'AVAILABLE',
      description: car.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitCar = (event) => {
    event.preventDefault();

    runAction(async () => {
      const payload = {
        ...carForm,
        year: carForm.year ? Number(carForm.year) : null,
        price_per_day: Number(carForm.price_per_day),
        seats: Number(carForm.seats),
      };

      if (isEditingCar) {
        await updateAdminCar(carForm.id, payload);
      } else {
        await createAdminCar(payload);
      }

      setCarForm(EMPTY_CAR_FORM);
      await loadCars();
      await loadDashboard();
    }, isEditingCar ? 'Car updated successfully.' : 'Car created successfully.');
  };

  const handleSubmitStaff = (event) => {
    event.preventDefault();

    runAction(async () => {
      await createAdminStaff(staffForm);
      setStaffForm(EMPTY_STAFF_FORM);
      await loadStaff();
      await loadDashboard();
    }, 'Staff account created successfully.');
  };

  const renderDashboard = () => {
    const carsData = dashboard?.cars || {};
    const usersData = dashboard?.users || {};
    const bookingsData = dashboard?.bookings || {};
    const paymentsData = dashboard?.payments || {};
    const recentBookings = dashboard?.recentBookings || [];

    return (
      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <p className="admin-eyebrow">Overview</p>
            <h2>System Dashboard</h2>
          </div>
          <button className="admin-light-btn" type="button" onClick={() => runAction(loadDashboard, 'Dashboard refreshed.')}>Refresh</button>
        </div>

        <div className="admin-stats-grid">
          <StatCard label="Total Cars" value={carsData.total || 0} hint={`${carsData.available || 0} available`} />
          <StatCard label="Active Rentals" value={carsData.rented || 0} hint={`${carsData.maintenance || 0} maintenance`} />
          <StatCard label="Customers" value={usersData.totalUsers || 0} hint={`${usersData.totalStaff || 0} staff`} />
          <StatCard label="Bookings" value={bookingsData.total || 0} hint={`${bookingsData.pending || 0} pending`} />
          <StatCard label="Confirmed" value={bookingsData.confirmed || 0} hint={`${bookingsData.completed || 0} completed`} />
          <StatCard label="Revenue" value={formatMoney(paymentsData.revenue || 0)} hint={`${paymentsData.pending || 0} pending payments`} />
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Recent Bookings</h3>
            <button type="button" onClick={() => setActiveTab('bookings')}>View all</button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.customer_name}<small>{booking.customer_email}</small></td>
                    <td>{booking.car_name}</td>
                    <td>{booking.pickup_date} → {booking.return_date}</td>
                    <td>{formatMoney(booking.total_price)}</td>
                    <td><span className={getStatusClassName(booking.status)}>{booking.status}</span></td>
                    <td>{booking.payment_status ? <span className={getStatusClassName(booking.payment_status)}>{booking.payment_status}</span> : 'UNPAID'}</td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr><td colSpan="7" className="admin-empty-row">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  const renderCars = () => (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="admin-eyebrow">Fleet control</p>
          <h2>Car Management</h2>
        </div>
        <button className="admin-light-btn" type="button" onClick={() => runAction(loadCars, 'Cars refreshed.')}>Refresh</button>
      </div>

      <form className="admin-form-card" onSubmit={handleSubmitCar}>
        <div className="admin-form-title-row">
          <h3>{isEditingCar ? 'Edit Car' : 'Create New Car'}</h3>
          {isEditingCar && (
            <button className="admin-light-btn" type="button" onClick={() => setCarForm(EMPTY_CAR_FORM)}>Cancel edit</button>
          )}
        </div>

        <div className="admin-form-grid">
          <label>
            Name
            <input value={carForm.name} onChange={(e) => handleCarFormChange('name', e.target.value)} placeholder="Toyota Camry 2024" required />
          </label>
          <label>
            Brand
            <input value={carForm.brand} onChange={(e) => handleCarFormChange('brand', e.target.value)} placeholder="Toyota" />
          </label>
          <label>
            Model
            <input value={carForm.model} onChange={(e) => handleCarFormChange('model', e.target.value)} placeholder="Camry" />
          </label>
          <label>
            Year
            <input type="number" value={carForm.year} onChange={(e) => handleCarFormChange('year', e.target.value)} placeholder="2024" />
          </label>
          <label>
            Category
            <select value={carForm.category} onChange={(e) => handleCarFormChange('category', e.target.value)}>
              <option value="ECONOMY">Economy</option>
              <option value="SUV">SUV / 7-Seater</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </label>
          <label>
            Price per day
            <input type="number" value={carForm.price_per_day} onChange={(e) => handleCarFormChange('price_per_day', e.target.value)} placeholder="1500000" required />
          </label>
          <label>
            Seats
            <input type="number" value={carForm.seats} onChange={(e) => handleCarFormChange('seats', e.target.value)} />
          </label>
          <label>
            Status
            <select value={carForm.status} onChange={(e) => handleCarFormChange('status', e.target.value)}>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
          <label>
            Transmission
            <input value={carForm.transmission} onChange={(e) => handleCarFormChange('transmission', e.target.value)} />
          </label>
          <label>
            Fuel type
            <input value={carForm.fuel_type} onChange={(e) => handleCarFormChange('fuel_type', e.target.value)} />
          </label>
          <label className="admin-form-wide">
            Image URL
            <input value={carForm.image_url} onChange={(e) => handleCarFormChange('image_url', e.target.value)} placeholder="https://..." />
          </label>
          <label className="admin-form-wide">
            Description
            <textarea value={carForm.description} onChange={(e) => handleCarFormChange('description', e.target.value)} placeholder="Short car description" />
          </label>
        </div>

        <button className="admin-primary-btn" type="submit" disabled={loading}>{isEditingCar ? 'Save Changes' : 'Create Car'}</button>
      </form>

      <div className="admin-filter-row">
        <select value={carCategoryFilter} onChange={(e) => setCarCategoryFilter(e.target.value)}>
          <option value="ALL">All categories</option>
          <option value="ECONOMY">Economy</option>
          <option value="SUV">SUV</option>
          <option value="PREMIUM">Premium</option>
        </select>
        <select value={carStatusFilter} onChange={(e) => setCarStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="admin-card-grid">
        {cars.map((car) => (
          <article className="admin-car-card" key={car.id}>
            <div className="admin-car-img-wrap">
              {car.image_url ? <img src={car.image_url} alt={car.name} /> : <div>CAR</div>}
            </div>
            <div className="admin-car-body">
              <div className="admin-car-title-row">
                <h3>{car.name}</h3>
                <span className={getStatusClassName(car.status)}>{car.status}</span>
              </div>
              <p>{car.brand} {car.model} {car.year}</p>
              <div className="admin-car-meta">
                <span>{car.category}</span>
                <span>{car.seats} seats</span>
                <span>{formatMoney(car.price_per_day)}/day</span>
              </div>
              <div className="admin-card-actions">
                <button type="button" onClick={() => handleEditCar(car)}>Edit</button>
                {String(car.status || '').toUpperCase() === 'RENTED' ? (
                  <p className="admin-car-status-note">
                    Currently rented. Complete return first.
                  </p>
                ) : (
                  <select
                    value={car.status}
                    onChange={(e) =>
                      runAction(
                        async () => {
                          await updateAdminCarStatus(car.id, e.target.value);
                          await loadCars();
                          await loadDashboard();
                        },
                        'Car status updated.'
                      )
                    }
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                )}
              </div>
            </div>
          </article>
        ))}
        {cars.length === 0 && <div className="admin-empty-card">No cars found.</div>}
      </div>
    </section>
  );

  const renderBookings = () => (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="admin-eyebrow">Operations</p>
          <h2>Booking Management</h2>
        </div>
        <button className="admin-light-btn" type="button" onClick={() => runAction(loadBookings, 'Bookings refreshed.')}>Refresh</button>
      </div>

      <div className="admin-filter-row">
        <select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-table--wide">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Car</th>
              <th>Pickup / Return</th>
              <th>Total</th>
              <th>Booking</th>
              <th>Payment</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>{booking.customer_name}<small>{booking.customer_email}</small><small>{booking.renter_phone}</small></td>
                <td>{booking.car_name}<small>{booking.brand} {booking.model}</small></td>
                <td>{booking.pickup_date} {booking.pickup_time}<small>{booking.return_date} {booking.return_time}</small></td>
                <td>{formatMoney(booking.total_price)}</td>
                <td><span className={getStatusClassName(booking.status)}>{booking.status}</span></td>
                <td>{booking.payment_status ? <span className={getStatusClassName(booking.payment_status)}>{booking.payment_status}</span> : 'UNPAID'}<small>{booking.payment_method || ''}</small></td>
                <td>
                  <select value={booking.status} onChange={(e) => runAction(async () => { await updateAdminBookingStatus(booking.id, e.target.value); await loadBookings(); await loadDashboard(); }, 'Booking status updated.') }>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan="8" className="admin-empty-row">No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderUsers = () => (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="admin-eyebrow">Customers</p>
          <h2>User Management</h2>
        </div>
        <button className="admin-light-btn" type="button" onClick={() => runAction(loadUsers, 'Users refreshed.')}>Refresh</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {users.map((customer) => (
              <tr key={customer.id}>
                <td>#{customer.id}</td>
                <td>{customer.full_name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || '-'}</td>
                <td><span className={getStatusClassName(customer.status)}>{customer.status}</span></td>
                <td>
                  <select value={customer.status} onChange={(e) => runAction(async () => { await updateAdminUserStatus(customer.id, e.target.value); await loadUsers(); }, 'User status updated.') }>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="LOCKED">Locked</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="6" className="admin-empty-row">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderStaff = () => (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="admin-eyebrow">Team</p>
          <h2>Staff Management</h2>
        </div>
        <button className="admin-light-btn" type="button" onClick={() => runAction(loadStaff, 'Staff refreshed.')}>Refresh</button>
      </div>

      <form className="admin-form-card admin-form-card--compact" onSubmit={handleSubmitStaff}>
        <h3>Create Staff Account</h3>
        <div className="admin-form-grid">
          <label>
            Full name
            <input value={staffForm.full_name} onChange={(e) => handleStaffFormChange('full_name', e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={staffForm.email} onChange={(e) => handleStaffFormChange('email', e.target.value)} required />
          </label>
          <label>
            Password
            <input value={staffForm.password} onChange={(e) => handleStaffFormChange('password', e.target.value)} required />
          </label>
          <label>
            Phone
            <input value={staffForm.phone} onChange={(e) => handleStaffFormChange('phone', e.target.value)} />
          </label>
        </div>
        <button className="admin-primary-btn" type="submit" disabled={loading}>Create Staff</button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((employee) => (
              <tr key={employee.id}>
                <td>#{employee.id}</td>
                <td>{employee.full_name}</td>
                <td>{employee.email}</td>
                <td>{employee.phone || '-'}</td>
                <td><span className={getStatusClassName(employee.status)}>{employee.status}</span></td>
                <td>
                  <select value={employee.status} onChange={(e) => runAction(async () => { await updateAdminStaffStatus(employee.id, e.target.value); await loadStaff(); await loadDashboard(); }, 'Staff status updated.') }>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="LOCKED">Locked</option>
                  </select>
                </td>
              </tr>
            ))}
            {staff.length === 0 && <tr><td colSpan="6" className="admin-empty-row">No staff accounts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderMessages = () => (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="admin-eyebrow">Customer Support</p>
          <h2>Contact Messages</h2>
        </div>
        <button className="admin-light-btn" type="button" onClick={() => runAction(loadMessages, 'Messages refreshed.')}>Refresh</button>
      </div>

      <div className="admin-filter-row">
        <select value={messageStatusFilter} onChange={(e) => setMessageStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="REPLIED">Replied</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-table--wide">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Reason</th>
              <th>Topic / Details</th>
              <th>Booking</th>
              <th>Attachment</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((item) => (
              <tr key={item.id}>
                <td>MSG-{item.id}</td>
                <td>
                  {item.full_name}
                  <small>{item.email}</small>
                  <small>{item.phone || '-'}</small>
                </td>
                <td>{item.contact_reason}</td>
                <td>
                  <strong>{item.topic}</strong>
                  <small>{item.message}</small>
                </td>
                <td>{item.booking_id ? `#${item.booking_id}` : '-'}<small>{item.car_name || item.booking_status || ''}</small></td>
                <td>
                  {getAttachmentHref(item) ? (
                    <a
                      className="admin-attachment-link"
                      href={getAttachmentHref(item)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View {item.attachment_name || 'attachment'}
                    </a>
                  ) : (
                    item.attachment_name || '-'
                  )}
                </td>
                <td><span className={getStatusClassName(item.status)}>{item.status}</span></td>
                <td>
                  <select value={item.status} onChange={(e) => runAction(async () => { await updateContactMessageStatus(item.id, e.target.value); await loadMessages(); }, 'Message status updated.') }>
                    <option value="NEW">New</option>
                    <option value="READ">Read</option>
                    <option value="REPLIED">Replied</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </td>
              </tr>
            ))}
            {messages.length === 0 && <tr><td colSpan="8" className="admin-empty-row">No contact messages found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderPayments = () => (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <p className="admin-eyebrow">Finance</p>
          <h2>Payment Management</h2>
        </div>
        <button className="admin-light-btn" type="button" onClick={() => runAction(loadPayments, 'Payments refreshed.')}>Refresh</button>
      </div>

      <div className="admin-filter-row">
        <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-table--wide">
          <thead>
            <tr>
              <th>ID</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Car</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>PAY-{payment.id}</td>
                <td>BOOKING-{payment.booking_id}<small>{payment.booking_status}</small></td>
                <td>{payment.customer_name}<small>{payment.customer_email}</small></td>
                <td>{payment.car_name}</td>
                <td>{payment.method === 'CASH' ? 'Cash' : 'Bank Card'}</td>
                <td>{formatMoney(payment.amount)}</td>
                <td><span className={getStatusClassName(payment.status)}>{payment.status}</span></td>
                <td>
                  <select value={payment.status} onChange={(e) => runAction(async () => { await updateAdminPaymentStatus(payment.id, e.target.value); await loadPayments(); await loadDashboard(); }, 'Payment status updated.') }>
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan="8" className="admin-empty-row">No payments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'cars') return renderCars();
    if (activeTab === 'bookings') return renderBookings();
    if (activeTab === 'users') return renderUsers();
    if (activeTab === 'staff') return renderStaff();
    if (activeTab === 'messages') return renderMessages();
    if (activeTab === 'payments') return renderPayments();
    return renderDashboard();
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <button className="admin-brand" type="button" onClick={onHome}>
          <span>CR</span>
          <strong>Admin Panel</strong>
        </button>

        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'is-active' : ''}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <small>Signed in as</small>
          <strong>{userLabel}</strong>
          <button type="button" onClick={onProfile}>My Profile</button>
          <button type="button" onClick={onChangePassword}>Change Password</button>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Car Renting System</p>
            <h1>Admin Workspace</h1>
          </div>
          <div className="admin-topbar-actions">
            {message && <span className="admin-toast">{message}</span>}
            {loading && <span className="admin-loading">Loading...</span>}
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default AdminPage;
