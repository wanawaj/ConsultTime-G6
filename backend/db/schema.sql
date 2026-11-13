-- ConsultTime's initial PostgreSQL schema. Safe to rerun on an existing deployment.
CREATE TABLE IF NOT EXISTS ct_users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT NOT NULL DEFAULT '',
  student_id TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  college TEXT,
  program TEXT,
  year_level TEXT,
  department TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ct_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES ct_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_sessions_user_idx ON ct_sessions(user_id);
CREATE INDEX IF NOT EXISTS ct_sessions_expires_idx ON ct_sessions(expires_at);

CREATE TABLE IF NOT EXISTS ct_appointments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES ct_users(id) ON DELETE CASCADE,
  faculty_id TEXT NOT NULL REFERENCES ct_users(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  topic TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Declined', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Prevent two concurrent requests from claiming the same active faculty slot.
CREATE UNIQUE INDEX IF NOT EXISTS ct_unique_active_slot
  ON ct_appointments (faculty_id, slot_date, slot_time)
  WHERE status IN ('Pending', 'Approved');

CREATE INDEX IF NOT EXISTS ct_appointments_student_idx ON ct_appointments(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ct_appointments_faculty_idx ON ct_appointments(faculty_id, created_at DESC);
