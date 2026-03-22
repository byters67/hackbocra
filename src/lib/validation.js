export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePhone(phone) {
  if (!phone) return null; // optional field
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) return 'Please enter a valid phone number';
  return null;
}

export function validateMaxLength(value, max, fieldName) {
  if (value && value.length > max) return `${fieldName} must be under ${max} characters`;
  return null;
}

export function validateForm(fields) {
  // fields = [{ value, name, rules: ['required', 'email', ...] }]
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
