import slugifyLib from 'slugify';
import type { PrismaClient } from '@prisma/client';

export async function generateUniqueSlug(title: string, prisma: PrismaClient): Promise<string> {
  const base = slugifyLib(title, { lower: true, strict: true, locale: 'fr' });
  let slug = base;
  let counter = 1;
  while (await prisma.workflow.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}
