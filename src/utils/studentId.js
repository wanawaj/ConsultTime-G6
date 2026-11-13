// WMSU student ID format requested for ConsultTime: exactly 4 digits, hyphen, 5 digits.
export const STUDENT_ID_PATTERN = /^\d{4}-\d{5}$/

export function validStudentId(value) {
  return typeof value === 'string' && STUDENT_ID_PATTERN.test(value)
}

export function formatStudentId(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 9)
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits
}
