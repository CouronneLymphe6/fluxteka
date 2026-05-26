import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const SubmitSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(30).max(2000),
  tool: z.string().min(1),
  category: z.string().min(1),
  source_url: z.string().url().optional().or(z.literal('')),
  author_name: z.string().min(2).max(60),
  author_email: z.string().email(),
  tags: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, 'submit', 3, 60_000);
    if (rl) return rl;

    const body = await request.json();
    const result = SubmitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Données invalides', details: result.error.flatten() }, { status: 400 });
    }

    const { title, description, tool, category, source_url, author_name, author_email, tags } = result.data;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    // Create a new workflow with "pending" status
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Here we should probably ensure the author exists or just save author name in DB.
    // Looking at the schema, Workflow requires an author_id (User).
    // Let's find or create a placeholder user, or the submitter must be logged in.
    // But the form asks for author_email, implying it can be anonymous or creating a basic user.
    let user = await prisma.user.findUnique({ where: { email: author_email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: author_email,
          name: author_name,
        }
      });
    }

    await prisma.workflow.create({
      data: {
        slug,
        title,
        description_fr: description,
        tool,
        category,
        source_url,
        status: 'pending', // IMPORTANT: pending so it doesn't show up immediately without validation
        tags: JSON.stringify(tagArray),
        tools_connected: JSON.stringify([]),
        author_id: user.id,
      }
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('[API /workflows/submit]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
