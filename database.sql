CREATE DATABASE IF NOT EXISTS php_quiz;
USE php_quiz;
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS results (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(180) NOT NULL,
  student_code VARCHAR(80) DEFAULT '',
  class_name VARCHAR(80) NOT NULL,
  correct_count INT NOT NULL,
  total_questions INT NOT NULL DEFAULT 50,
  score DECIMAL(4,2) NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NOT NULL,
  details_json LONGTEXT NOT NULL,
  INDEX idx_class (class_name),
  INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB;
-- Tài khoản giáo viên mặc định: admin / Admin@123
-- Đổi mật khẩu ngay sau lần đăng nhập đầu tiên.
INSERT IGNORE INTO teachers(username,password_hash) VALUES
('admin','$2y$12$Ov89wpREyvAHc8IhvQoJNeh0/qkc8k6nJYU5PLGT6qxCrUaE8.WdO');
