import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../config/env.js';

const baseEnv = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/bug_tracker',
  JWT_SECRET: 'a'.repeat(64),
  CORS_ORIGIN: 'https://example.com',
};

test('production environment accepts complete safe configuration', () => {
  assert.deepEqual(validateEnvironment({ ...baseEnv, NODE_ENV: 'production' }), []);
});

test('production environment rejects missing database url', () => {
  const errors = validateEnvironment({
    ...baseEnv,
    NODE_ENV: 'production',
    DATABASE_URL: '',
  });

  assert.match(errors.join('\n'), /DATABASE_URL is required/);
});

test('production environment rejects short or placeholder JWT secrets', () => {
  const errors = validateEnvironment({
    ...baseEnv,
    NODE_ENV: 'production',
    JWT_SECRET: 'your-secret-change-in-production',
  });

  assert.match(errors.join('\n'), /JWT_SECRET/);
});

test('development environment allows local placeholder-like secrets', () => {
  assert.deepEqual(
    validateEnvironment({
      DATABASE_URL: baseEnv.DATABASE_URL,
      JWT_SECRET: 'local-dev-secret',
      NODE_ENV: 'development',
    }),
    []
  );
});
