import path from 'path';
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load .env.local first (Next.js convention), then .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // URL directe (non-poolée) pour les migrations Prisma
    url: env('POSTGRES_URL_NON_POOLING'),
  },
});
