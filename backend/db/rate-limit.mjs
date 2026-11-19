import crypto from "node:crypto";
import { isIP } from "node:net";

function getSecret() {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET || "";

  if (!/^[0-9a-f]{64}$/.test(secret)) {
    throw new Error("Invalid RATE_LIMIT_HMAC_SECRET configuration.");
  }

  return Buffer.from(secret, "hex");
}

function createBucketKey(scope, identifier) {
  if (
    typeof scope !== "string" ||
    !/^[a-z0-9:_-]{1,64}$/.test(scope) ||
    typeof identifier !== "string" ||
    !identifier.trim()
  ) {
    throw new Error("Invalid rate-limit identifier.");
  }

  return crypto
    .createHmac("sha256", getSecret())
    .update(`${scope}\0${identifier.trim()}`)
    .digest("hex");
}

// Production trusts only the IP inserted by the authenticated
// Cloudflare Pages Function. Local development uses the socket IP.
export function getClientIp(req) {
  const candidate =
    process.env.NODE_ENV === "production"
      ? req.headers["x-ct-client-ip"]
      : req.socket?.remoteAddress;

  if (typeof candidate !== "string") return null;

  const ip = candidate.trim();

  return isIP(ip) ? ip : null;
}

// Atomically consume one attempt in a fixed time window.
export async function consumeRateLimit(
  pool,
  { scope, identifier, limit, windowSeconds },
) {
  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger(windowSeconds) ||
    windowSeconds < 1
  ) {
    throw new Error("Invalid rate-limit configuration.");
  }

  const bucketKey = createBucketKey(scope, identifier);

  const { rows } = await pool.query(
    `
    INSERT INTO ct_rate_limits (
      bucket_key,
      attempts,
      window_started_at,
      expires_at,
      updated_at
    )
    VALUES (
      $1,
      1,
      NOW(),
      NOW() + ($3::int * INTERVAL '1 second'),
      NOW()
    )
    ON CONFLICT (bucket_key)
    DO UPDATE SET
      attempts = CASE
        WHEN ct_rate_limits.expires_at <= NOW() THEN 1
        ELSE LEAST(ct_rate_limits.attempts + 1, $2::int + 1)
      END,

      window_started_at = CASE
        WHEN ct_rate_limits.expires_at <= NOW() THEN NOW()
        ELSE ct_rate_limits.window_started_at
      END,

      expires_at = CASE
        WHEN ct_rate_limits.expires_at <= NOW()
          THEN NOW() + ($3::int * INTERVAL '1 second')
        ELSE ct_rate_limits.expires_at
      END,

      updated_at = NOW()

    RETURNING attempts, expires_at
    `,
    [bucketKey, limit, windowSeconds],
  );

  const attempts = Number(rows[0].attempts);
  const expiresAt = new Date(rows[0].expires_at).getTime();

  const allowed = attempts <= limit;

  return {
    allowed,
    remaining: Math.max(0, limit - attempts),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000)),
  };
}

export async function clearRateLimit(pool, { scope, identifier }) {
  const bucketKey = createBucketKey(scope, identifier);

  await pool.query("DELETE FROM ct_rate_limits WHERE bucket_key = $1", [
    bucketKey,
  ]);
}

// Remove old expired buckets during scheduled maintenance.
export async function pruneExpiredRateLimits(pool) {
  const result = await pool.query(`
    DELETE FROM ct_rate_limits
    WHERE expires_at < NOW() - INTERVAL '1 day'
  `);

  return result.rowCount;
}
