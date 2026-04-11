import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * Creates a signed JWT token with user ID payload
 * Expiration time comes from JWT_EXPIRES_IN env variable
 *
 * @param {string} userId - User ID to encode in token
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};
