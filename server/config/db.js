import pkg from 'pg';
const { Pool } = pkg;

/**
 * PostgreSQL Connection Pool
 * Uses DATABASE_URL from environment variables
 * Supports both local and cloud-hosted databases (Neon, Supabase, etc.)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration: require in production, optional in development
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true }
    : process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

/**
 * Event listeners for connection pool
 */
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('✓ Database pool connected');
});

export default pool;
