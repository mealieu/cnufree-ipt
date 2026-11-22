import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8081,http://127.0.0.1:8081'),
  SUPABASE_PROJECT_ID: z.string().min(1).optional(),
  SUPABASE_URL: z
    .string()
    .url('SUPABASE_URL must be a valid https://<project-ref>.supabase.co URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedIssues = parsedEnv.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error(
    `[env] Invalid or missing backend environment configuration:\n${formattedIssues}\n` +
      'Copy backend/.env.example to backend/.env and fill in your Supabase Cloud credentials.'
  );
  process.exit(1);
}

const data = parsedEnv.data;

export const env = {
  ...data,
  corsOriginsList: data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
