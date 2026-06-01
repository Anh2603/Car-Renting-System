# Car Renting System

A full-stack web application for online car rental management, supporting vehicle booking, payment processing, customer support, staff operations, and role-based administration.

---

## Live Demo

### Frontend

https://car-renting-system-2603.vercel.app

### Backend API

https://car-renting-system-qe9k.onrender.com

### Health Check

https://car-renting-system-qe9k.onrender.com/api/health

---

## Project Overview

Car Renting System is a web-based rental management platform designed to help customers book cars online and help staff/admin users manage daily rental operations.

The system provides a complete rental workflow from vehicle browsing, booking, checkout, pickup, return, payment tracking, maintenance management, and customer support.

---

## Key Features

### Customer Features

* Register and log in with JWT authentication
* Browse available vehicles
* Filter cars by category and rental schedule
* Create car bookings
* Checkout with Bank Card demo or Cash at pickup
* View personal booking history
* Cancel eligible bookings before pickup
* Submit support messages with optional attachments
* Update profile and change password
* Switch interface language between English and Vietnamese

### Staff Features

* View operational dashboard
* Manage all bookings
* Mark confirmed bookings as picked up
* Complete vehicle returns
* Send returned cars to maintenance if needed
* Confirm Cash payment during pickup
* View and update support messages
* Update operational car status

### Admin Features

* View dashboard statistics
* Manage cars, users, staff, bookings, payments, and support messages
* Create and update car records
* Create staff accounts
* Update account status
* Update booking and payment status
* Review contact support messages and attachments
* Manage vehicle availability and maintenance status

---

## Technology Stack

### Frontend

* React 18
* React Router
* Axios
* CSS3

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs
* multer
* mysql2

### Database

* MySQL
* Railway MySQL Cloud Database

### Deployment

* Frontend: Vercel
* Backend API: Render
* Database: Railway

---

## System Architecture

```text
Client Browser
     ↓
React Frontend - Vercel
     ↓
Express Backend API - Render
     ↓
MySQL Database - Railway
```

---

## Folder Structure

```text
Car-Renting-System/
├── car-renting-backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   │   └── contact/
│   ├── package.json
│   └── server.js
│
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

---

## User Roles

### Customer

Customers can browse cars, create bookings, make payments, manage personal bookings, and contact support.

### Staff

Staff users handle daily rental operations such as pickup confirmation, vehicle returns, cash payment confirmation, and maintenance updates.

### Admin

Admin users have full management access over cars, bookings, payments, users, staff accounts, and support messages.

---

## Car Categories

* Economy
* SUV / 7-Seater
* Premium

---

## Car Status Flow

```text
AVAILABLE
↓
RENTED
↓
AVAILABLE
```

Maintenance flow:

```text
AVAILABLE
↓
MAINTENANCE
↓
AVAILABLE
```

A rented car cannot be manually changed back to available before the return process is completed.

---

## Booking Status Flow

```text
PENDING
↓
CONFIRMED
↓
PICKED_UP
↓
COMPLETED
```

Cancellation flow:

```text
PENDING / CONFIRMED
↓
CANCELLED
```

---

## Payment Flow

### Bank Card Demo

```text
Customer selects Bank Card
↓
Payment status becomes SUCCESS
↓
Booking status becomes CONFIRMED
```

Bank Card is a demo payment method and is not connected to a real payment gateway.

### Cash at Pickup

```text
Customer selects Cash
↓
Payment status becomes PENDING
↓
Booking status becomes CONFIRMED
↓
Staff confirms pickup
↓
Payment status becomes SUCCESS
↓
Booking status becomes PICKED_UP
↓
Car status becomes RENTED
```

---

## Staff Operations Flow

```text
All Bookings
↓
Review confirmed bookings
↓
Mark Picked Up when customer receives the car
↓
Booking becomes PICKED_UP
↓
Car becomes RENTED
```

Return flow:

```text
Returns
↓
Complete Return
↓
Booking becomes COMPLETED
↓
Car becomes AVAILABLE
```

Maintenance return flow:

```text
Returns
↓
Complete + Maintenance
↓
Booking becomes COMPLETED
↓
Car becomes MAINTENANCE
```

---

## Contact Support Flow

```text
Customer submits Contact Us form
↓
Message is stored in MySQL
↓
Optional attachment is saved in uploads/contact
↓
Admin/Staff review message
↓
Message status can be updated
```

Supported attachment types include image and PDF files.

---

## Language Support

The application supports English and Vietnamese through:

```text
car-renting-frontend/src/i18n/LanguageContext.jsx
```

The selected language is stored in localStorage.

---

## API Endpoints

### Health

```http
GET /api/health
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

### Cars

```http
GET /api/cars
GET /api/cars/:id
```

### Bookings

```http
POST /api/bookings
GET  /api/bookings/my-bookings
PUT  /api/bookings/:id/cancel
```

### Payments

```http
POST /api/payments
GET  /api/payments/booking/:bookingId
```

### Admin

```http
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

```http
GET   /api/staff/dashboard
GET   /api/staff/bookings
PATCH /api/staff/bookings/:id/pickup
PATCH /api/staff/bookings/:id/complete
PATCH /api/staff/bookings/:id/cancel
PATCH /api/staff/cars/:id/status
```

### Contact Support

```http
POST  /api/contact
GET   /api/contact/messages
PATCH /api/contact/messages/:id/status
```

---

## Deployment Configuration

### Frontend Environment Variable

```env
REACT_APP_API_URL=https://car-renting-system-qe9k.onrender.com
```

### Backend Environment Variables

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://car-renting-system-2603.vercel.app
DB_HOST=your_railway_mysql_public_host
DB_PORT=your_railway_mysql_public_port
DB_USER=your_railway_mysql_user
DB_PASSWORD=your_railway_mysql_password
DB_NAME=railway
JWT_SECRET=your_secret_key
```

The real `.env` file must not be committed to GitHub.

---

## Test Accounts

### Admin

```text
Email: admin@gmail.com
Password: 123456
```

### Staff

```text
Email: staff1@gmail.com
Password: 123456
```

### Customer

Customers can create accounts from the public Register page.

---

## Project Status

The system has been fully developed and deployed in a production environment.

Implemented modules include:

* Authentication and authorization
* Vehicle management
* Booking management
* Payment management
* Customer support system
* Attachment upload
* Maintenance workflow
* Admin dashboard
* Staff operations dashboard
* English / Vietnamese language support

Deployment infrastructure:

* Frontend hosted on Vercel
* Backend API hosted on Render
* MySQL database hosted on Railway

---

## Notes

This project should not commit:

* `node_modules/`
* `.env`
* `debug.log`
* frontend `build/`
* uploaded runtime files used only for local testing

Recommended `.gitignore` entries:

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

---

## Authors

Car Renting System Development Team

2026
