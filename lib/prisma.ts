import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString =
      process.env.POSTGRES_PRISMA_URL ??
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL_NON_POOLING ??
      '';
    const adapter = new PrismaPg({ connectionString });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

/** Returns true if the database is configured and reachable */
export function isDbConnected(): boolean {
  return !!(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL);
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
