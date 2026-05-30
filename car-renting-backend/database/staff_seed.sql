USE car_renting_system;

-- Optional demo staff account
-- Login: staff1@gmail.com
-- Password: 123456

ALTER TABLE users
  MODIFY role ENUM('USER', 'ADMIN', 'STAFF') DEFAULT 'USER';

ALTER TABLE users
  MODIFY status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') DEFAULT 'ACTIVE';

INSERT INTO users (full_name, email, password, phone, role, status)
SELECT
  'Staff One',
  'staff1@gmail.com',
  '$2b$10$t3het2sBp0m.mDwjMYRlAO9xqt2TZGKS103Q/srMFC5tq.NKJKE2G',
  '0900000001',
  'STAFF',
  'ACTIVE'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'staff1@gmail.com'
);

UPDATE users
SET
  full_name = 'Staff One',
  password = '$2b$10$t3het2sBp0m.mDwjMYRlAO9xqt2TZGKS103Q/srMFC5tq.NKJKE2G',
  phone = '0900000001',
  role = 'STAFF',
  status = 'ACTIVE'
WHERE email = 'staff1@gmail.com';

SELECT id, full_name, email, role, status
FROM users
WHERE email = 'staff1@gmail.com';
