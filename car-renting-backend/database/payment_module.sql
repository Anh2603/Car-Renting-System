    USE car_renting_system;

-- Run this once if your current database was created before the Bank Card + Cash payment flow.
-- It keeps existing data and only updates the payments table definition.

ALTER TABLE payments
  MODIFY method ENUM('BANK_CARD', 'CASH') DEFAULT 'BANK_CARD';

ALTER TABLE payments
  MODIFY status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING';

ALTER TABLE payments
  MODIFY paid_at TIMESTAMP NULL;

-- Optional cleanup: store demo-card payments as BANK_CARD for clearer admin display.
SET SQL_SAFE_UPDATES = 0;
UPDATE payments SET method = 'BANK_CARD' WHERE method = 'DEMO_CARD';
SET SQL_SAFE_UPDATES = 1;

SELECT id, booking_id, amount, method, status, paid_at
FROM payments
ORDER BY id DESC;
    