USE car_renting_system;

-- Run this once if your database already has contact_messages but no attachment_url column.
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

SELECT 'contact attachment upload columns ready' AS message;
