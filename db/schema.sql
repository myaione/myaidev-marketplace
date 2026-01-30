-- MyAIDev Marketplace Database Schema
-- SQLite

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  author VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT DEFAULT '[]',               -- JSON array stored as text
  stars INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 0,           -- SQLite boolean (0/1)
  featured INTEGER DEFAULT 0,           -- SQLite boolean (0/1)
  version VARCHAR(20) DEFAULT '1.0.0',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Skill files table
CREATE TABLE IF NOT EXISTS skill_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id VARCHAR(36) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,       -- 'SKILL.md', 'code', 'assets', 'package'
  content TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  icon VARCHAR(50) DEFAULT ''
);

-- Download tracking log
CREATE TABLE IF NOT EXISTS download_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id VARCHAR(36) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_author ON skills(author);
CREATE INDEX IF NOT EXISTS idx_skills_stars ON skills(stars);
CREATE INDEX IF NOT EXISTS idx_skills_downloads ON skills(downloads);
CREATE INDEX IF NOT EXISTS idx_skill_files_skill_id ON skill_files(skill_id);
CREATE INDEX IF NOT EXISTS idx_download_log_skill_id ON download_log(skill_id);
CREATE INDEX IF NOT EXISTS idx_download_log_created ON download_log(created_at);
