/**
 * Simple Rate Limiting Middleware
 * Prevents brute force attacks on auth endpoints
 * Stores requests in memory (for production use Redis)
 */

const requestCounts = new Map();
const MAX_REQUESTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const timestamps = requestCounts.get(ip);
  
  // Remove old timestamps
  const recentTimestamps = timestamps.filter((time) => now - time < WINDOW_MS);
  requestCounts.set(ip, recentTimestamps);

  if (recentTimestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }

  recentTimestamps.push(now);
  next();
};

export default rateLimit;
