/**
 * scripts/_prisma.ts — Helper Prisma partagé pour tous les scripts standalone
 * Connecte à Supabase PostgreSQL via POSTGRES_PRISMA_URL (même que la prod Vercel)
 *
 * Usage dans un script :
 *   import { createScriptPrisma } from './_prisma';
 *   const { prisma, disconnect } = createScriptPrisma();
 *   // ... utilise prisma ...
 *   await disconnect();
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export function createScriptPrisma() {
  const rawUrl =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL ??
    '';

  if (!rawUrl) {
    throw new Error('❌ Aucune URL de base de données trouvée.\nVérifier POSTGRES_PRISMA_URL dans .env.local');
  }

  // Nettoyer les paramètres incompatibles avec le driver pg
  let cleanUrl = rawUrl;
  try {
    const u = new URL(rawUrl);
    u.searchParams.delete('sslmode');
    u.searchParams.delete('pgbouncer');
    cleanUrl = u.toString();
  } catch { /* use raw */ }

  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 30000,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter }) as any;

  return {
    prisma,
    disconnect: async () => {
      await prisma.$disconnect();
      await pool.end();
    },
  };
}
