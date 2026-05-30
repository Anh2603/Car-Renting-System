# Car Renting System

A full-stack car rental management system built with React, Node.js, Express.js, and MySQL.

The system supports customer booking, admin management, staff operations, payment tracking, contact support messages with attachments, and an EN/VI language toggle.

## Main Features

### Customer

- Register and log in with JWT authentication.
- Select pickup area, pickup date/time, and return date/time.
- Browse cars by availability, category, and selected rental schedule.
- View Economy, SUV / 7-seater, and Premium cars.
- Create a booking with renter information.
- Checkout with Bank Card demo or Cash at pickup.
- View personal bookings in My Bookings.
- Cancel eligible bookings before pickup.
- Send support requests through the Contact Us form.
- Upload an optional image/PDF attachment in the Contact Us form.
- Update personal profile and password.
- Switch interface language between English and Vietnamese.

### Admin

- View dashboard statistics.
- Manage cars, users, staff, bookings, payments, and support messages.
- Create and update cars.
- Create staff accounts.
- Update user and staff account status.
- Update booking status with payment synchronization.
- Review support messages submitted from Contact Us.
- Open uploaded contact attachments.
- Update car status, while preventing rented cars from being manually marked available before return is completed.

### Staff

- View operational dashboard.
- Use All Bookings to review current bookings and mark confirmed bookings as picked up.
- Cancel bookings when needed before pickup.
- Use Returns to complete vehicle returns.
- Send returned vehicles to maintenance if needed.
- Confirm Cash payment during pickup.
- View and update support messages.
- Open uploaded contact attachments.
- View and update operational car status.

## Tech Stack

- Frontend: React 18, CSS
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT
- Password hashing: bcryptjs
- File upload: multer

## Folder Structure

```text
Car-Renting-System-user/
├── car-renting-backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   │   └── contact/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── car-renting-frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── i18n/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

## Database Setup

Open MySQL Workbench and run these files in order:

```text
car-renting-backend/database/schema.sql
car-renting-backend/database/seed.sql
car-renting-backend/database/admin_seed.sql
```

Optional test staff account:

```text
car-renting-backend/database/staff_seed.sql
```

The main schema includes:

- users
- cars
- bookings
- payments
- contact_messages
- contact attachment fields
- updated car, booking, payment, and user status enums

Separate update SQL files may still exist for older local databases. For a clean reset, run `schema.sql` again after dropping the database.

### Reset Database

Use this only when you want to remove all existing users, bookings, payments, cars, and messages:

```sql
DROP DATABASE IF EXISTS car_renting_system;
CREATE DATABASE car_renting_system;
USE car_renting_system;
```

Then run:

```text
schema.sql
seed.sql
admin_seed.sql
staff_seed.sql optional
```

## Environment Setup

Create a backend `.env` file from the example:

```bat
cd car-renting-backend
copy .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_renting_system
JWT_SECRET=change_this_secret_for_your_machine
```

Do not commit your real `.env` file.

## Install and Run

Backend:

```bat
cd car-renting-backend
npm install
npm run dev
```

Frontend:

```bat
cd car-renting-frontend
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Backend health check:

```text
http://localhost:5000/api/health
```

## Test Accounts

Admin:

```text
Email: admin@gmail.com
Password: 123456
```

Optional staff seed account:

```text
Email: staff1@gmail.com
Password: 123456
```

Customer accounts can be created from the public Register page.

## Key API Endpoints

### Health

```text
GET /api/health
```

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

### Cars

```text
GET /api/cars
GET /api/cars?category=ECONOMY
GET /api/cars?category=SUV
GET /api/cars?category=PREMIUM
GET /api/cars?pickupDate=2026-05-30&returnDate=2026-06-03
GET /api/cars/:id
```

Cars are filtered by selected rental date. A car with an active booking in the same date range should not appear in FleetPage.

### Bookings

```text
POST /api/bookings
GET  /api/bookings/my-bookings
PUT  /api/bookings/:id/cancel
```

### Payments

```text
POST /api/payments
GET  /api/payments/booking/:bookingId
```

### Admin

```text
GET   /api/admin/dashboard
GET   /api/admin/cars
POST  /api/admin/cars
PUT   /api/admin/cars/:id
PATCH /api/admin/cars/:id/status
GET   /api/admin/bookings
PATCH /api/admin/bookings/:id/status
GET   /api/admin/payments
PATCH /api/admin/payments/:id/status
GET   /api/admin/users
PATCH /api/admin/users/:id/status
GET   /api/admin/staff
POST  /api/admin/staff
PATCH /api/admin/staff/:id/status
```

### Staff

```text
GET   /api/staff/dashboard
GET   /api/staff/bookings
PATCH /api/staff/bookings/:id/pickup
PATCH /api/staff/bookings/:id/complete
PATCH /api/staff/bookings/:id/cancel
PATCH /api/staff/cars/:id/status
```

### Contact Support

```text
POST  /api/contact
GET   /api/contact/messages
PATCH /api/contact/messages/:id/status
```

Contact support supports multipart form upload for image/PDF attachments. Uploaded files are stored under:

```text
car-renting-backend/uploads/contact/
```

Backend exposes uploaded files through:

```text
http://localhost:5000/uploads/contact/<filename>
```

## Business Flow Summary

### Customer Booking Flow

```text
Home
-> Select schedule
-> Fleet
-> Select car
-> Confirm renter details
-> Checkout
-> Success
-> My Bookings
```

### Bank Card Payment Flow

```text
Customer chooses Bank Card
-> Payment status: SUCCESS
-> Booking status: CONFIRMED
```

Bank Card is a demo payment method. It does not connect to a real payment gateway.

### Cash Payment Flow

```text
Customer chooses Cash
-> Payment status: PENDING
-> Booking status: CONFIRMED
-> Staff marks pickup
-> Payment status: SUCCESS
-> Booking status: PICKED_UP
-> Car status: RENTED
```

### Booking Status Flow

```text
PENDING
-> CONFIRMED
-> PICKED_UP
-> COMPLETED
```

Cancellation flow:

```text
PENDING / CONFIRMED
-> CANCELLED
```

### Car Status Flow

```text
AVAILABLE
-> RENTED
-> AVAILABLE
```

Maintenance flow:

```text
AVAILABLE
-> MAINTENANCE
-> AVAILABLE
```

A `RENTED` car should not be manually changed to `AVAILABLE` from Cars Status. It should become available only after the return is completed.

### Staff Operations Flow

```text
All Bookings
-> Staff reviews CONFIRMED bookings
-> Mark Picked Up when customer receives the car
-> Booking becomes PICKED_UP
-> Car becomes RENTED

Returns
-> Staff completes return when customer brings car back
-> Complete Return: Booking COMPLETED, Car AVAILABLE
-> Return + Maintenance: Booking COMPLETED, Car MAINTENANCE
```

### Admin Cancellation Flow

```text
Booking CANCELLED
Cash PENDING -> Payment FAILED
Bank Card SUCCESS -> Payment REFUNDED
Car becomes AVAILABLE unless it is under MAINTENANCE
```

### Contact Support Flow

```text
Customer opens Contact Us
-> Customer submits message and optional attachment
-> Message is saved to MySQL
-> Attachment is saved to uploads/contact
-> Admin/Staff review message in Messages tab
-> Admin/Staff open attachment if available
-> Status can be changed to NEW, READ, or REPLIED
```

## Staff Panel Tabs

```text
Dashboard
All Bookings
Returns
Messages
Cars Status
```

`All Bookings` replaces the old Pickups tab. Confirmed bookings can be marked as picked up from All Bookings.

## Admin Panel Tabs

```text
Dashboard
Cars
Bookings
Users
Staff
Messages
Payments
```

Admin keeps full management access. Staff has only daily operational access.

## Language Toggle

The app supports English and Vietnamese through:

```text
car-renting-frontend/src/i18n/LanguageContext.jsx
```

The language toggle stores the selected language in localStorage.

## Cleanup Notes

This project should not commit:

- `node_modules/`
- `.git/` inside exported zip files
- real `.env`
- `debug.log`
- frontend `build/`
- uploaded runtime files if they are only local testing files

After extracting a clean project zip, run `npm install` inside both backend and frontend.

## Recommended .gitignore

```gitignore
node_modules/
.env
*.log
build/
dist/
.DS_Store

car-renting-backend/node_modules/
car-renting-backend/.env
car-renting-backend/uploads/contact/*
!car-renting-backend/uploads/contact/.gitkeep

car-renting-frontend/node_modules/
car-renting-frontend/.env
car-renting-frontend/build/
```

## GitHub Push

From the project root:

```bat
git init
git add .
git commit -m "Update latest car renting system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If remote already exists:

```bat
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Always check before pushing:

```bat
git status --short
```

Make sure `.env` and `node_modules/` are not included.