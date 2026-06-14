const placeholderPatterns = [/change.*production/i, /your[-_ ]/i, /example/i];

export const validateEnvironment = (env = process.env) => {
  const errors = [];

  if (!env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (
    env.NODE_ENV === 'production' &&
    (env.JWT_SECRET.length < 64 || placeholderPatterns.some((pattern) => pattern.test(env.JWT_SECRET)))
  ) {
    errors.push('JWT_SECRET must be a non-placeholder secret of at least 64 characters in production');
  }

  if (env.NODE_ENV === 'production' && !env.CORS_ORIGIN) {
    errors.push('CORS_ORIGIN is required in production');
  }

  return errors;
};

export const assertValidEnvironment = (env = process.env) => {
  const errors = validateEnvironment(env);

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);
  }
};
