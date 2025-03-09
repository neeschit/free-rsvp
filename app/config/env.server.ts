import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

const envSchema = z.object({
  AMPLIFY_AUTH_USER_POOL_ID: z.string().min(1),
  AMPLIFY_AUTH_USER_POOL_CLIENT_ID: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv(); 