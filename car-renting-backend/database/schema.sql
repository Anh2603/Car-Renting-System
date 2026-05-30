CREATE DATABASE IF NOT EXISTS car_renting_system;
USE car_renting_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('USER', 'ADMIN', 'STAFF') DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
);

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    category ENUM('ECONOMY', 'SUV', 'PREMIUM') NOT NULL DEFAULT 'ECONOMY',
    price_per_day DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(800),
    transmission VARCHAR(50),
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'RON 95',
    seats INT,
    status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE') DEFAULT 'AVAILABLE',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_cars_category (category),
    INDEX idx_cars_status (status),
    INDEX idx_cars_name (name)
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,

    renter_name VARCHAR(100) NOT NULL,
    renter_phone VARCHAR(20) NOT NULL,
    driver_license_number VARCHAR(100) NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    customer_note TEXT,

    pickup_location VARCHAR(255) NOT NULL,
    return_location VARCHAR(255),

    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    pickup_time TIME,
    return_time TIME,

    total_price DECIMAL(10,2) NOT NULL,

    status ENUM(
      'PENDING',
      'CONFIRMED',
      'PICKED_UP',
      'COMPLETED',
      'CANCELLED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bookings_car
        FOREIGN KEY (car_id) REFERENCES cars(id)
        ON DELETE CASCADE,

    INDEX idx_bookings_car_dates (car_id, pickup_date, return_date),
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_status (status)
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('BANK_CARD', 'CASH') DEFAULT 'BANK_CARD',
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE,

    INDEX idx_payments_status (status),
    INDEX idx_payments_method (method)
);

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  booking_id INT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  contact_reason VARCHAR(100) NOT NULL,
  topic VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  attachment_name VARCHAR(255),
  attachment_url VARCHAR(500),
  status ENUM('NEW', 'READ', 'REPLIED', 'ARCHIVED') DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_contact_messages_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_contact_messages_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE SET NULL,

  INDEX idx_contact_messages_status (status),
  INDEX idx_contact_messages_email (email),
  INDEX idx_contact_messages_created_at (created_at)
);

