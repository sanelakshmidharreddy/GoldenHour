import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env from backend directory or project root if present
const rootEnvPath = path.resolve(process.cwd(), '../.env');
const localEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PUBLIC_BACKEND_ORIGIN: z
    .string()
    .default('http://localhost:3000'),
  KNOWLEDGE_BASE_DIR: z
    .string()
    .optional()
    .transform((val) => {
      if (val && val.trim() !== '') {
        return path.resolve(val);
      }
      // Look for knowledge-base relative to project root or backend
      const candidates = [
        path.resolve(process.cwd(), 'knowledge-base'),
        path.resolve(process.cwd(), '../knowledge-base'),
        path.resolve(__dirname, '../../../knowledge-base'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
      return candidates[1]; // default fallback
    }),
  SESSION_SECRET: z
    .string()
    .optional()
    .default('dev_session_secret_goldenhour_local_only'),
  OPENAI_API_KEY: z
    .string()
    .optional()
    .transform((val) => (val === 'replace_me' || !val ? undefined : val)),
  OPENAI_MODEL: z
    .string()
    .optional()
    .default('gpt-4o'),
});

export type AppConfig = {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  isTest: boolean;
  publicBackendOrigin: string;
  knowledgeBaseDir: string;
  sessionSecret: string;
  openaiApiKey?: string;
  openaiModel: string;
};

export function parseConfig(sourceEnv: Record<string, string | undefined> = process.env): AppConfig {
  const result = envSchema.safeParse(sourceEnv);

  if (!result.success) {
    const errorMessages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Configuration validation error: ${errorMessages}`);
  }

  const parsed = result.data;

  // Strict check in production
  if (parsed.NODE_ENV === 'production') {
    if (
      !parsed.SESSION_SECRET ||
      parsed.SESSION_SECRET === 'replace_me_with_a_long_random_string' ||
      parsed.SESSION_SECRET === 'dev_session_secret_goldenhour_local_only' ||
      parsed.SESSION_SECRET.length < 16
    ) {
      throw new Error('SESSION_SECRET must be set to a secure string of at least 16 characters in production.');
    }
  }

  return {
    port: parsed.PORT,
    nodeEnv: parsed.NODE_ENV,
    isProduction: parsed.NODE_ENV === 'production',
    isTest: parsed.NODE_ENV === 'test',
    publicBackendOrigin: parsed.PUBLIC_BACKEND_ORIGIN,
    knowledgeBaseDir: parsed.KNOWLEDGE_BASE_DIR,
    sessionSecret: parsed.SESSION_SECRET,
    openaiApiKey: parsed.OPENAI_API_KEY,
    openaiModel: parsed.OPENAI_MODEL,
  };
}

export const config = parseConfig();
