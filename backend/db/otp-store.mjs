import crypto from "node:crypto";
import { generateOtp, hashOtp, verifyOtp } from "./otp.mjs";
import { isWmsuEmail } from "./email-policy.mjs";
import { sendOtpEmail } from "./email.mjs";

export async function verifyEmailOtp(pool, email, code) {
  if (!isWmsuEmail(email)) return null;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the OTP record to prevent concurrent reuse.
    const { rows } = await client.query(
      `
SELECT o.*, u.email
FROM ct_email_otps o
JOIN ct_users u ON u.id = o.user_id
WHERE u.email = $1
  AND u.role = 'student'
  AND u.email_verified_at IS NULL
FOR UPDATE OF o

    `,
      [email.trim().toLowerCase()],
    );

    const record = rows[0];

    if (!record) {
      await client.query("COMMIT");
      return null;
    }

    const valid = verifyOtp({
      email: record.email,
      code,
      challengeId: record.id,
      codeHash: record.code_hash,
      expiresAt: record.expires_at,
      attempts: record.attempts,
      consumedAt: record.consumed_at,
      secret: process.env.OTP_HMAC_SECRET,
    });

    if (!valid) {
      // Count incorrect attempts while the challenge is active.
      if (
        record.consumed_at === null &&
        record.attempts < 5 &&
        new Date(record.expires_at).getTime() > Date.now()
      ) {
        await client.query(
          `
          UPDATE ct_email_otps
          SET attempts = attempts + 1
          WHERE id = $1
        `,
          [record.id],
        );
      }

      await client.query("COMMIT");
      return null;
    }

    // Mark this OTP as used.
    await client.query(
      `
      UPDATE ct_email_otps
      SET consumed_at = NOW()
      WHERE id = $1
    `,
      [record.id],
    );

    // Mark the user's WMSU email as verified.
    await client.query(
      `
      UPDATE ct_users
      SET email_verified_at = NOW()
      WHERE id = $1
    `,
      [record.user_id],
    );

    await client.query("COMMIT");

    return record.user_id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function issueEmailOtp(pool, userId) {
  if (typeof userId !== "string" || !userId) {
    return { sent: false };
  }

  // Only unverified WMSU student accounts can request OTP.
  const { rows } = await pool.query(
    `
    SELECT id, email
    FROM ct_users
    WHERE id = $1
      AND role = 'student'
      AND email_verified_at IS NULL
  `,
    [userId],
  );

  const user = rows[0];

  if (!user || !isWmsuEmail(user.email)) {
    return { sent: false };
  }

  const code = generateOtp();
  const challengeId = crypto.randomUUID();

  const codeHash = hashOtp(
    user.email,
    code,
    challengeId,
    process.env.OTP_HMAC_SECRET,
  );

  // Create or replace the OTP atomically.
  // Enforce a 60-second resend cooldown.
  const result = await pool.query(
    `
    INSERT INTO ct_email_otps (
      id, user_id, code_hash, expires_at,
      attempts, consumed_at, last_sent_at
    )
    SELECT
      $1, id, $3,
      NOW() + INTERVAL '5 minutes',
      0, NULL, NOW()
    FROM ct_users
    WHERE id = $2
      AND email = $4
      AND role = 'student'
      AND email_verified_at IS NULL

    ON CONFLICT (user_id)
    DO UPDATE SET
      id = EXCLUDED.id,
      code_hash = EXCLUDED.code_hash,
      expires_at = EXCLUDED.expires_at,
      attempts = 0,
      consumed_at = NULL,
      last_sent_at = NOW()
    WHERE ct_email_otps.last_sent_at
          <= NOW() - INTERVAL '60 seconds'

    RETURNING id
  `,
    [challengeId, userId, codeHash, user.email],
  );

  if (!result.rowCount) {
    return { sent: false };
  }

  // Email the code. Never log or return it to the client.
  try {
    await sendOtpEmail(user.email, code);
  } catch (emailError) {
    // Remove only the challenge created by this request.
    // Preserve newer challenges and already-consumed OTPs.
    await pool.query(
      `
      DELETE FROM ct_email_otps
      WHERE id = $1
        AND user_id = $2
        AND consumed_at IS NULL
      `,
      [challengeId, userId],
    );

    throw emailError;
  }

  return { sent: true };
}
