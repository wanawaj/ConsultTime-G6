
-- ConsultTime persistent rate limiting
-- Apply through the approved database migration process.

CREATE TABLE IF NOT EXISTS ct_rate_limits (
    bucket_key TEXT PRIMARY KEY
        CHECK (bucket_key ~ '^[0-9a-f]{64}$'),

    attempts INTEGER NOT NULL DEFAULT 0
        CHECK (attempts >= 0),

    window_started_at TIMESTAMPTZ NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_rate_limits_expires_idx
ON ct_rate_limits(expires_at);
