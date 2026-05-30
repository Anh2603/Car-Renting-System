USE car_renting_system;

CREATE TABLE IF NOT EXISTS contact_messages (
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

SELECT 'contact_messages table ready' AS message;

-- Add attachment_url to older existing databases that already had contact_messages.
SET @attachment_url_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'contact_messages'
    AND COLUMN_NAME = 'attachment_url'
);

SET @attachment_url_sql := IF(
  @attachment_url_exists = 0,
  'ALTER TABLE contact_messages ADD COLUMN attachment_url VARCHAR(500) NULL AFTER attachment_name',
  'SELECT "attachment_url column already exists" AS message'
);

PREPARE attachment_url_stmt FROM @attachment_url_sql;
EXECUTE attachment_url_stmt;
DEALLOCATE PREPARE attachment_url_stmt;
