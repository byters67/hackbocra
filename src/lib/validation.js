/**
 * validation.js — Form Validation Utilities
 *
 * Reusable, declarative validation for all public-facing forms
 * (complaint submission, contact form, licence applications, etc.).
 *
 * Design:
 *   Each validator returns `null` on success or an error string on failure.
 *   validateForm() aggregates results into { isValid, errors } for easy
 *   binding to form state.
 *
 * USAGE:
 *   import { validateForm } from '@/lib/validation';
 *
 *   const { isValid, errors } = validateForm([
 *     { value: name, name: 'Name', rules: ['required'] },
 *     { value: email, name: 'Email', rules: ['required', 'email'] },
 *     { value: desc, name: 'Description', rules: ['required', { maxLength: 5000 }] },
 *   ]);
 */

/**
 * Checks that a value is non-empty.
 * @param {*} value - The form field value
 * @param {string} fieldName - Human-readable field label (used in error message)
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validates email address format using a standard RFC-compatible pattern.
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

/**
 * Validates phone number length (7–15 digits). Optional field — returns null if empty.
 * Strips spaces, dashes, and parentheses before checking.
 * @param {string} phone
 * @returns {string|null} Error message or null if valid
 */
export function validatePhone(phone) {
  if (!phone) return null; // optional field
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) return 'Please enter a valid phone number';
  return null;
}

/**
 * Checks that a string does not exceed a maximum length.
 * @param {string} value
 * @param {number} max - Maximum allowed characters
 * @param {string} fieldName - Human-readable field label
 * @returns {string|null} Error message or null if valid
 */
export function validateMaxLength(value, max, fieldName) {
  if (value && value.length > max) return `${fieldName} must be under ${max} characters`;
  return null;
}

/**
 * Validates an array of form fields against their declared rules.
 * Stops at the first error per field (so the user fixes one thing at a time).
 *
 * @param {Array<{value: *, name: string, rules: Array<string|{maxLength: number}>}>} fields
 * @returns {{ isValid: boolean, errors: Object<string, string> }}
 *
 * @example
 *   const { isValid, errors } = validateForm([
 *     { value: form.name,  name: 'Name',  rules: ['required'] },
 *     { value: form.email, name: 'Email', rules: ['required', 'email'] },
 *   ]);
 *   if (!isValid) setFormErrors(errors);
 */
export function validateForm(fields) {
  const errors = {};
  for (const { value, name, rules } of fields) {
    for (const rule of rules) {
      let error = null;
      if (rule === 'required') error = validateRequired(value, name);
      if (rule === 'email') error = validateEmail(value);
      if (rule === 'phone') error = validatePhone(value);
      if (typeof rule === 'object' && rule.maxLength) {
        error = validateMaxLength(value, rule.maxLength, name);
      }
      if (error) {
        errors[name] = error;
        break;
      }
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
