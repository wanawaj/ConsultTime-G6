export function isWmsuEmail(email) {
  if (typeof email !== "string") return false;

  const normalized = email.trim().toLowerCase();

  return /^[^\s@]+@wmsu\.edu\.ph$/.test(normalized);
}
