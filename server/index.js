import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pool from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import ticketRoutes from './routes/tickets.routes.js';
import commentRoutes from './routes/comments.routes.js';
import activityRoutes from './routes/activity.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Trust proxy for Render/cloud deployments
 */
app.set('trust proxy', 1);

/**
 * Security & CORS Middleware
 */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Health Check Endpoint
 * Used by deployment platforms (Render, Railway, etc.) to verify app is running
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

/**
 * Example test route to verify database connection
 */
app.get('/api/test', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', ticketRoutes);
app.use('/api', commentRoutes);
app.use('/api', activityRoutes);

/**
 * 404 Not Found Middleware
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Global Error Handler (must be last)
 */
app.use(errorHandler);

/**
 * Server Start
 */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      🐛 BUG TRACKER API RUNNING        ║
║      🔗 http://localhost:${PORT}           ║
╚════════════════════════════════════════╝
  `);
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing gracefully...');
  pool.end(() => {
    process.exit(0);
  });
});
