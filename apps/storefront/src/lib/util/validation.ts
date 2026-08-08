const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Accepts optional leading +, spaces, dashes, dots, parens; requires 7-15 digits overall.
const PHONE_REGEX = /^\+?[0-9](?:[0-9\s\-.()]{5,17})[0-9]$/

export const isValidEmail = (value: string): boolean => {
  return EMAIL_REGEX.test(value.trim())
}

export const isValidPhone = (value: string): boolean => {
  const trimmed = value.trim()
  const digitCount = trimmed.replace(/\D/g, "").length

  return PHONE_REGEX.test(trimmed) && digitCount >= 7 && digitCount <= 15
}
