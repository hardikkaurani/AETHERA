/**
 * Input Sanitization Utilities
 * Protects against XSS and injection attacks
 */

/**
 * Escape HTML special characters
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
};

/**
 * Sanitize user input - remove dangerous HTML
 */

// Removes HTML elements and scripts to guard against XSS attempts
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript protocol
};

/**
 * Sanitize text for display (escape HTML)
 */
export const displayText = (text) => {
  return escapeHtml(sanitizeInput(text));
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate strong password
 */
export const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/\d/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain a special character';
  return null;
};

export default {
  escapeHtml,
  sanitizeInput,
  displayText,
  validateEmail,
  validatePassword,
};
