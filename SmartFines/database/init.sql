CREATE DATABASE IF NOT EXISTS smartfines;
USE smartfines;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30) UNIQUE,
  nic VARCHAR(30) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  assigned_by_user_id BIGINT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS regions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  district VARCHAR(100) NULL,
  province VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS license_details (
  user_id BIGINT PRIMARY KEY,
  license_number VARCHAR(50) NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  address TEXT NULL,
  region_id BIGINT NULL,
  stars INT NOT NULL DEFAULT 5,
  license_status ENUM('active','suspended','cancelled') NOT NULL DEFAULT 'active',
  license_cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_license_details_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_license_details_region FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicle_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS license_detail_categories (
  license_detail_user_id BIGINT NOT NULL,
  vehicle_category_id BIGINT NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  PRIMARY KEY (license_detail_user_id, vehicle_category_id),
  CONSTRAINT fk_license_detail_categories_license FOREIGN KEY (license_detail_user_id) REFERENCES license_details(user_id),
  CONSTRAINT fk_license_detail_categories_category FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS officer_profiles (
  user_id BIGINT PRIMARY KEY,
  officer_code VARCHAR(50) NOT NULL UNIQUE,
  badge_number VARCHAR(50) UNIQUE,
  station_name VARCHAR(150) NULL,
  region_id BIGINT NULL,
  created_by_user_id BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_officer_profiles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_officer_profiles_region FOREIGN KEY (region_id) REFERENCES regions(id),
  CONSTRAINT fk_officer_profiles_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS traffic_fines (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fine_reference_number VARCHAR(80) NOT NULL UNIQUE,
  driver_user_id BIGINT NOT NULL,
  officer_user_id BIGINT NOT NULL,
  region_id BIGINT NOT NULL,
  vehicle_number VARCHAR(30) NOT NULL,
  driver_license_number_snapshot VARCHAR(50) NOT NULL,
  violation_date DATE NOT NULL,
  violation_details TEXT NOT NULL,
  violation_place VARCHAR(255) NOT NULL,
  fine_amount DECIMAL(10,2) NOT NULL,
  license_collection_location VARCHAR(255) NOT NULL,
  status ENUM('issued','paid','disputed','cancelled','void') NOT NULL DEFAULT 'issued',
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  due_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_traffic_fines_driver FOREIGN KEY (driver_user_id) REFERENCES users(id),
  CONSTRAINT fk_traffic_fines_officer FOREIGN KEY (officer_user_id) REFERENCES users(id),
  CONSTRAINT fk_traffic_fines_region FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fine_status_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fine_id BIGINT NOT NULL,
  previous_status ENUM('issued','paid','disputed','cancelled','void') NULL,
  new_status ENUM('issued','paid','disputed','cancelled','void') NOT NULL,
  changed_by_user_id BIGINT NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comment VARCHAR(255) NULL,
  CONSTRAINT fk_fine_status_history_fine FOREIGN KEY (fine_id) REFERENCES traffic_fines(id),
  CONSTRAINT fk_fine_status_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS driver_star_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_user_id BIGINT NOT NULL,
  fine_id BIGINT NULL,
  stars_before INT NOT NULL,
  stars_after INT NOT NULL,
  change_reason VARCHAR(255) NOT NULL,
  changed_by_user_id BIGINT NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_driver_star_history_driver FOREIGN KEY (driver_user_id) REFERENCES users(id),
  CONSTRAINT fk_driver_star_history_fine FOREIGN KEY (fine_id) REFERENCES traffic_fines(id),
  CONSTRAINT fk_driver_star_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fine_id BIGINT NOT NULL,
  driver_user_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('online','receipt_upload') NOT NULL,
  payment_status ENUM('pending','paid','failed','reversed') NOT NULL DEFAULT 'pending',
  transaction_reference VARCHAR(100) UNIQUE,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_payments_fine FOREIGN KEY (fine_id) REFERENCES traffic_fines(id),
  CONSTRAINT fk_payments_driver FOREIGN KEY (driver_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_receipts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id BIGINT NOT NULL UNIQUE,
  receipt_number VARCHAR(80) NOT NULL UNIQUE,
  source ENUM('web_generated','driver_uploaded') NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NULL,
  mime_type VARCHAR(100) NULL,
  file_size_bytes BIGINT NULL,
  uploaded_by_user_id BIGINT NULL,
  generated_at TIMESTAMP NULL,
  verified_by_user_id BIGINT NULL,
  verified_at TIMESTAMP NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_receipts_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
  CONSTRAINT fk_payment_receipts_uploaded_by FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_payment_receipts_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS license_recollections (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fine_id BIGINT NOT NULL UNIQUE,
  driver_user_id BIGINT NOT NULL,
  status ENUM('pending','marked_by_driver','confirmed') NOT NULL DEFAULT 'pending',
  marked_recollected_at TIMESTAMP NULL,
  confirmed_by_user_id BIGINT NULL,
  confirmed_at TIMESTAMP NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_license_recollections_fine FOREIGN KEY (fine_id) REFERENCES traffic_fines(id),
  CONSTRAINT fk_license_recollections_driver FOREIGN KEY (driver_user_id) REFERENCES users(id),
  CONSTRAINT fk_license_recollections_confirmed_by FOREIGN KEY (confirmed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  recipient_user_id BIGINT NOT NULL,
  actor_user_id BIGINT NULL,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  related_fine_id BIGINT NULL,
  related_payment_id BIGINT NULL,
  action_url TEXT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id),
  CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
  CONSTRAINT fk_notifications_fine FOREIGN KEY (related_fine_id) REFERENCES traffic_fines(id),
  CONSTRAINT fk_notifications_payment FOREIGN KEY (related_payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  notification_id BIGINT NOT NULL,
  channel ENUM('in_app','email','sms') NOT NULL,
  delivery_status ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
  delivered_to VARCHAR(255) NULL,
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_deliveries_notification FOREIGN KEY (notification_id) REFERENCES notifications(id)
) ENGINE=InnoDB;

INSERT INTO roles (id, name, description, created_at)
VALUES
  (1, 'admin', 'System role: admin', CURRENT_TIMESTAMP),
  (2, 'traffic_officer', 'System role: traffic_officer', CURRENT_TIMESTAMP),
  (3, 'driver', 'System role: driver', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO users (id, full_name, username, email, phone, nic, password_hash, status, created_at)
VALUES (1, 'Admin One', 'admin1', 'admin1@smartfines.local', '0770000000', NULL, '$2b$10$tYEXTWGzA1uxRxXAM.kTT.rTOdi48eBKw7ZHtIu18sltQ8YqMfW8e', 'active', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO user_roles (user_id, role_id, assigned_by_user_id, assigned_at)
VALUES (1, 1, NULL, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE assigned_at = assigned_at;
