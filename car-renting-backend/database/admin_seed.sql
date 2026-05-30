USE car_renting_system;

-- Admin seed only.
-- Login: admin@gmail.com
-- Password: 123456
-- Run this after schema.sql + seed.sql, or run it alone on an existing database.

ALTER TABLE users
  MODIFY role ENUM('USER', 'ADMIN', 'STAFF') DEFAULT 'USER';

ALTER TABLE users
  MODIFY status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') DEFAULT 'ACTIVE';

ALTER TABLE cars
  MODIFY category ENUM('ECONOMY', 'SUV', 'PREMIUM') NOT NULL DEFAULT 'ECONOMY';

ALTER TABLE cars
  MODIFY status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE') DEFAULT 'AVAILABLE';

ALTER TABLE cars
  MODIFY fuel_type VARCHAR(50) NOT NULL DEFAULT 'RON 95';

ALTER TABLE bookings
  MODIFY status ENUM('PENDING', 'CONFIRMED', 'PICKED_UP', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING';

ALTER TABLE payments
  MODIFY method ENUM('BANK_CARD', 'CASH') DEFAULT 'BANK_CARD';

ALTER TABLE payments
  MODIFY status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING';

INSERT INTO users (full_name, email, password, phone, role, status)
SELECT
  'Admin User',
  'admin@gmail.com',
  '$2b$10$8I/3/rAhuO64Rugz7Q3LT.5l8WqvNAC1soFcOrBtaBpZJYlKa9I2W',
  '0900000000',
  'ADMIN',
  'ACTIVE'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@gmail.com'
);

UPDATE users
SET
  full_name = 'Admin User',
  password = '$2b$10$8I/3/rAhuO64Rugz7Q3LT.5l8WqvNAC1soFcOrBtaBpZJYlKa9I2W',
  phone = '0900000000',
  role = 'ADMIN',
  status = 'ACTIVE'
WHERE email = 'admin@gmail.com';

SELECT id, full_name, email, role, status
FROM users
WHERE email = 'admin@gmail.com';
