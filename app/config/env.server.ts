import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GTAG_ID: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_REGION: z.string().default('us-east-1'),
  COGNITO_DOMAIN: z.string(),
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