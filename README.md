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

The system provides a complete rental workflow from vehicle browsing, booking, checkout, pickup confirmation, vehicle return, payment tracking, maintenance management, and customer support.

The application supports three main roles:

* Customer
* Staff
* Admin

Each role has different permissions and interface functions.

---

## Key Features

### Customer Features

* Register and log in with JWT authentication
* Browse available vehicles
* Filter cars by category, keyword, and rental schedule
* View car details before booking
* Create car bookings
* Checkout with Bank Card demo or Cash at pickup
* View personal booking history
* Cancel eligible bookings before pickup
* Submit support messages with optional attachments
* Update profile information
* Change password
* Switch interface language between English and Vietnamese

### Staff Features

* View operational dashboard
* Manage operational bookings
* Mark confirmed bookings as picked up
* Complete vehicle returns
* Send returned cars to maintenance if needed
* Confirm Cash payment during pickup
* Cancel eligible bookings
* View and update support messages
* Update operational car status

### Admin Features

* View dashboard statistics
* Manage cars, users, staff accounts, bookings, payments, and support messages
* Create and update car records
* Create staff accounts
* Update user and staff account status
* Update booking and payment status
* Review contact support messages and attachments
* Manage vehicle availability and maintenance status

---

## Technology Stack

### Frontend

* React 18
* React DOM
* React state-based navigation with browser History API
* Fetch API for backend requests
* Context API for language support
* CSS3

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs
* multer
* mysql2
* dotenv
* cors

### Database

* MySQL
* Railway MySQL Cloud Database for deployment

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

The frontend sends HTTP requests to the Express backend API. The backend validates requests, applies authentication and role-based authorization, executes business logic, and communicates with the MySQL database.

---

## Folder Structure

```text
Car-Renting-System/
├── car-renting-backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── carController.js
│   │   ├── contactController.js
│   │   ├── paymentController.js
│   │   └── staffController.js
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── admin_seed.sql
│   │   └── staff_seed.sql
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   │   └── contact/
│   ├── .env
│   ├── .env.example
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
    ├── package.json
    └── package-lock.json
```

---

## User Roles

### Customer

Customers can browse cars, create bookings, make payments, manage personal bookings, update profile information, change password, and contact support.

### Staff

Staff users handle daily rental operations such as pickup confirmation, vehicle return processing, cash payment confirmation, support message review, cancellation, and maintenance updates.

### Admin

Admin users have full management access over cars, bookings, payments, users, staff accounts, support messages, and dashboard statistics.

---

## Car Categories

* Economy
* SUV / 7-Seater
* Premium

---

## Car Status Flow

Normal rental flow:

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

Normal booking flow:

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

Picked-up or completed bookings are protected from normal customer cancellation.

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

Pickup flow:

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
Customer or guest submits Contact Us form
↓
Message is stored in MySQL
↓
Optional attachment is saved in uploads/contact
↓
Admin or Staff reviews the message
↓
Message status can be updated
```

Supported attachment types:

* JPG
* JPEG
* PNG
* WEBP
* PDF

Maximum attachment size: 5MB.

---

## Language Support

The application supports English and Vietnamese through:

```text
car-renting-frontend/src/i18n/LanguageContext.jsx
```

The selected language is stored in `localStorage`.

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
GET   /api/admin/contact-messages
PATCH /api/admin/contact-messages/:id/status
```

### Staff

```http
GET   /api/staff/dashboard
GET   /api/staff/bookings
PATCH /api/staff/bookings/:id/pickup
PATCH /api/staff/bookings/:id/complete
PATCH /api/staff/bookings/:id/cancel
PATCH /api/staff/cars/:id/status
GET   /api/staff/contact-messages
PATCH /api/staff/contact-messages/:id/status
```

### Contact Support

```http
POST /api/contact
```

---

## Local Installation

### 1. Clone or open the project folder

```bash
cd Car-Renting-System-user
```

### 2. Install backend dependencies

```bash
cd car-renting-backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../car-renting-frontend
npm install
```

---

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE car_renting_system;
```

Import the SQL files from:

```text
car-renting-backend/database/
```

Recommended import order:

```text
schema.sql
seed.sql
admin_seed.sql
staff_seed.sql
```

---

## Environment Configuration

### Backend `.env`

Create or update:

```text
car-renting-backend/.env
```

Example local configuration:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_renting_system

JWT_SECRET=dev_secret_for_classroom_demo
BCRYPT_SALT_ROUNDS=10
```

For classroom ZIP submission, a local/demo `.env` file may be included. Do not include private Railway credentials or production secrets in a public repository.

### Backend `.env.example`

The project should also include:

```text
car-renting-backend/.env.example
```

Example:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_renting_system

JWT_SECRET=replace_this_with_a_secret_key
BCRYPT_SALT_ROUNDS=10
```

### Frontend Environment Variable

For deployed frontend builds:

```env
REACT_APP_API_URL=https://car-renting-system-qe9k.onrender.com
```

For local development, the frontend can call the local backend:

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## Running the Project Locally

### Start backend

```bash
cd car-renting-backend
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### Start frontend

Open a new terminal:

```bash
cd car-renting-frontend
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

## Build Test

To check whether the frontend can build successfully:

```bash
cd car-renting-frontend
npm run build
```

To check backend JavaScript syntax:

```bash
cd car-renting-backend
node --check server.js
```

PowerShell command to check all backend JavaScript files:

```powershell
Get-ChildItem -Recurse -Filter *.js | Where-Object { $_.FullName -notmatch "node_modules" } | ForEach-Object { node --check $_.FullName }
```

---

## Deployment Configuration

### Frontend Deployment

Platform: Vercel

Environment variable:

```env
REACT_APP_API_URL=https://car-renting-system-qe9k.onrender.com
```

### Backend Deployment

Platform: Render

Environment variables:

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
BCRYPT_SALT_ROUNDS=10
```

### Database Deployment

Platform: Railway MySQL

The Render backend connects to Railway MySQL using the public Railway host, port, username, password, and database name stored in Render environment variables.

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

Example customer account used during testing:

```text
Email: suddenalice@gmail.com
Password: 123456
```

---

## Project Status

The system has been developed and deployed as a full-stack web application.

Implemented modules include:

* Authentication and authorization
* Role-based access control
* Vehicle browsing and filtering
* Vehicle management
* Booking creation and booking history
* Date-based availability checking
* Double-booking prevention
* Payment management
* Staff pickup and return workflow
* Maintenance workflow
* Customer support system
* Attachment upload
* Admin dashboard
* Staff operations dashboard
* English / Vietnamese language support
* Production deployment using Vercel, Render, and Railway

---

## Known Limitations

* Bank Card payment is a demo flow and is not connected to a real payment gateway.
* Availability checking is mainly date-based and does not fully support hourly-level rental conflicts.
* The project mainly uses manual testing and does not yet include a full automated test suite.
* Contact attachments are stored in the backend upload directory instead of cloud object storage.
* Render free-tier hosting may cause cold-start delays.
* Email notifications are not implemented yet.
* JWT refresh tokens and password reset by email are not implemented yet.

---

## Notes for Submission

The submission ZIP should avoid unnecessary runtime or dependency files:

* `node_modules/`
* `debug.log`
* frontend `build/`
* uploaded runtime files used only for local testing

The `.env` file may be included in a classroom ZIP only when it contains local/demo values. Do not include private production credentials.

Recommended `.gitignore` entries:

```gitignore
node_modules/
*.log
build/
dist/
.DS_Store

car-renting-backend/node_modules/
car-renting-backend/uploads/contact/*
!car-renting-backend/uploads/contact/.gitkeep

car-renting-frontend/node_modules/
car-renting-frontend/build/

# For public GitHub repositories, also ignore:
# .env
# car-renting-backend/.env
# car-renting-frontend/.env
```

---

## Authors

Car Renting System Team

* Nguyễn Trung Anh
* Lê Đoàn Minh Ngọc
* Đỗ Phú Thành

Course: Web Application Development

Year: 2026
