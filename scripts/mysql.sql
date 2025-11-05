-- MySQL 8 schema and seed data

CREATE DATABASE IF NOT EXISTS hssc_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE hssc_db;

-- student_id table
CREATE TABLE IF NOT EXISTS student_id (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_no VARCHAR(20) NOT NULL UNIQUE,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- config table
CREATE TABLE IF NOT EXISTS config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poetry JSON NOT NULL,
  task_prompt JSON NOT NULL,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- generate_record table
CREATE TABLE IF NOT EXISTS generate_record (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_no VARCHAR(20) NOT NULL,
  prompt_text TEXT NOT NULL,
  image_no VARCHAR(50) NOT NULL,
  status TINYINT(1) NOT NULL DEFAULT 0,
  generate_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submit_time DATETIME NULL,
  total_time_seconds INT NULL,
  INDEX idx_student_no (student_no),
  INDEX idx_submit_time (submit_time),
  CONSTRAINT fk_student_no FOREIGN KEY (student_no) REFERENCES student_id(student_no)
);

-- seed students
INSERT INTO student_id (student_no) VALUES ('11'), ('12'), ('13');

-- default config
INSERT INTO config (poetry, task_prompt) VALUES (
  JSON_OBJECT('title','静夜思','author','李白','content','床前明月光，疑是地上霜。举头望明月，低头思故乡。','annotation','本诗表达了诗人夜思乡愁之情。'),
  JSON_ARRAY('阅读古诗理解诗意','撰写提示词引导AI生成符合意境的中国风画面')
);