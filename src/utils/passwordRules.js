// The same password requirements are used for the live form and the local API.
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: value => value.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)', test: value => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)', test: value => /[a-z]/.test(value) },
  { id: 'number', label: 'One number (0–9)', test: value => /[0-9]/.test(value) },
  { id: 'symbol', label: 'One special character (!@#$…)', test: value => /[^A-Za-z0-9\s]/.test(value) },
  { id: 'spaces', label: 'No spaces', test: value => !/\s/.test(value) },
  { id: 'maximum', label: 'No more than 128 characters', test: value => value.length <= 128 },
]
export function passwordChecks(password = '') {
  return PASSWORD_RULES.map(rule => ({ id: rule.id, label: rule.label, passed: rule.test(password) }))
}
export function validPassword(password) {
  return typeof password === 'string' && PASSWORD_RULES.every(rule => rule.test(password))
}
