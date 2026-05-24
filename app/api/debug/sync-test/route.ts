import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {};

  // 1. Check env vars
  results.dbConnected = isDbConnected();
  results.hasPostgresPrismaUrl = !!process.env.POSTGRES_PRISMA_URL;
  results.hasDatabaseUrl = !!process.env.DATABASE_URL;

  // 2. Check auth session
  try {
    const user = await getAuthUser(request);
    results.authUser = user ? { id: user.id, email: user.email } : null;
  } catch (e) {
    results.authError = String(e);
  }

  // 3. Test Prisma connection
  try {
    const count = await prisma.user.count();
    results.prismaConnected = true;
    results.userCount = count;
  } catch (e) {
    results.prismaConnected = false;
    results.prismaError = String(e);
  }

  // 4. Try creating a test user
  try {
    const user = await getAuthUser(request);
    if (user?.email) {
      const existing = await prisma.user.findFirst({ where: { email: user.email } });
      if (!existing) {
        const created = await prisma.user.create({
          data: {
            email: user.email,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0],
            email_verified: true,
          },
        });
        results.userCreated = { id: created.id, email: created.email };
      } else {
        results.userAlreadyExists = { id: existing.id, email: existing.email };
      }
    }
  } catch (e) {
    results.createError = String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
