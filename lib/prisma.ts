import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DB_URL = process.env.DATABASE_URL || '';

function getPrismaClient(): PrismaClient {
  if (!DB_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaBetterSqlite3({ url: DB_URL });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

/** Returns true if the database is configured and reachable */
export function isDbConnected(): boolean {
  return !!DB_URL;
}

export const prisma = {
  get workflow() { return getPrismaClient().workflow; },
  get review() { return getPrismaClient().review; },
  get purchase() { return getPrismaClient().purchase; },
  get savedWorkflow() { return getPrismaClient().savedWorkflow; },
  get report() { return getPrismaClient().report; },
  get affiliateClick() { return getPrismaClient().affiliateClick; },
  get affiliateLink() { return getPrismaClient().affiliateLink; },
  get partnerSubscription() { return getPrismaClient().partnerSubscription; },
  get setting() { return getPrismaClient().setting; },
  get pipelineLog() { return getPrismaClient().pipelineLog; },
  get crawledUrl() { return getPrismaClient().crawledUrl; },
  get smokeTestLead() { return getPrismaClient().smokeTestLead; },
  get user() { return getPrismaClient().user; },
  $disconnect() { return getPrismaClient().$disconnect(); },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction(...args: any[]) { return (getPrismaClient() as any).$transaction(...args); },
};
