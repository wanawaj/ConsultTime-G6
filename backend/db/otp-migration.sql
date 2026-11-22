
-- ConsultTime Email OTP Migration
-- Do not execute until deployment is approved.

-- Track verified WMSU email addresses.
ALTER TABLE ct_users
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Store OTP verification challenges.
CREATE TABLE IF NOT EXISTS ct_email_otps (
    id TEXT PRIMARY KEY,

    user_id TEXT NOT NULL UNIQUE
        REFERENCES ct_users(id) ON DELETE CASCADE,

    code_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    attempts INTEGER NOT NULL DEFAULT 0
        CHECK (attempts >= 0),

    consumed_at TIMESTAMPTZ,

    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_email_otps_expires_idx
ON ct_email_otps(expires_at);