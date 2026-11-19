import crypto from "node:crypto";

export function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export function hashOtp(email, code, challengeId, secret) {
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("A strong OTP_HMAC_SECRET is required.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify([email.trim().toLowerCase(), challengeId, code]))
    .digest("hex");
}

export function verifyOtp({
  email,
  code,
  challengeId,
  codeHash,
  expiresAt,
  attempts,
  consumedAt,
  secret,
}) {
  // OTP must contain exactly 6 digits.
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return false;
  }

  // Stored OTP hash must be valid.
  if (typeof codeHash !== "string" || !/^[0-9a-f]{64}$/.test(codeHash)) {
    return false;
  }

  // Reject OTPs already used.
  if (consumedAt != null) {
    return false;
  }

  // Reject after 5 failed attempts.
  if (!Number.isInteger(attempts) || attempts < 0 || attempts >= 5) {
    return false;
  }

  // Reject expired OTPs.
  const expiry = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiry) || Date.now() >= expiry) {
    return false;
  }

  // Compare hashes using constant-time comparison.
  const expectedHash = hashOtp(email, code, challengeId, secret);

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, "hex"),
    Buffer.from(codeHash, "hex"),
  );
}
