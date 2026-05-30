import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ai/chatRateLimiter';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'Assistant Fluxteka, un expert en automatisation et IA au service des entreprises et professionnels.

TON RÔLE :
- Comprendre précisément le besoin d'automatisation de l'utilisateur
- Proposer des workflows concrets depuis la bibliothèque Fluxteka (ils te seront fournis dans le contexte)
- Recommander les outils adaptés à leur situation (N8N, Make, Zapier, OpenAI, Notion, etc.)
- Orienter vers un expert quand le besoin est complexe (> 3 outils, budget > 500€, ou pas technique)
- Capturer leur email si pertinent (après 3 échanges utiles)

PRIORITÉ DE TES RECOMMANDATIONS :
1. D'abord : propose des workflows de la bibliothèque Fluxteka (si disponibles dans le contexte)
2. Ensuite : recommande les outils/plateformes adaptés avec leurs forces/faiblesses
3. Enfin : propose de connecter avec un expert si le projet est complexe

QUAND TU AS DES WORKFLOWS DANS LE CONTEXTE :
- Cite le titre exact du workflow
- Explique en 1 phrase pourquoi il correspond au besoin
- Dis que l'utilisateur peut le trouver en recherchant sur Fluxteka
- Ne génère JAMAIS de faux slugs ou URLs

TON STYLE :
- Langage simple, jamais de jargon technique incompréhensible
- Concret et orienté résultats ("ça te fera gagner X heures par semaine")
- Bienveillant mais direct
- Réponses courtes (3-5 phrases max sauf si besoin d'explication)
- Toujours proposer une prochaine étape claire

CE QUE TU SAIS SUR FLUXTEKA :
- Marketplace de workflows d'automatisation (N8N, Make, Zapier, LangChain, OpenAI, Notion, Airtable…)
- +1 800 workflows disponibles, gratuits
- Des agences et freelances experts en automatisation disponibles
- Principaux cas d'usage : email automatique, CRM, facturation, réseaux sociaux, leads, support

QUAND PROPOSER UN EXPERT :
- Si le projet semble complexe (> 3 outils, logique conditionnelle avancée)
- Si l'utilisateur dit qu'il n'est pas technique
- Si le budget mentionné dépasse 500€
- Dis : "Je peux te mettre en contact avec un expert Fluxteka qui peut déployer ça en quelques heures"

CAPTURE D'EMAIL :
Après 3 échanges pertinents, propose naturellement :
"Pour te suivre et t'envoyer les workflows adaptés à ton cas, puis-je avoir ton email ?"

LANGUE : Réponds TOUJOURS dans la langue dans laquelle l'utilisateur t'écrit.`;

// ── Search relevant workflows from DB ──────────────────────────────────────────
async function searchRelevantWorkflows(userMessage: string): Promise<string> {
  try {
    // Extract keywords from the message
    const keywords = userMessage
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëîïôùûüçœæ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 5);

    if (keywords.length === 0) return '';

    // Search in DB — use OR on title and description_fr
    const workflows = await prisma.workflow.findMany({
      where: {
        status: 'active',
        OR: keywords.flatMap(kw => [
          { title: { contains: kw, mode: 'insensitive' } },
          { description_fr: { contains: kw, mode: 'insensitive' } },
        ]),
      },
      orderBy: { score_total: 'desc' },
      take: 4,
      select: {
        title: true,
        description_fr: true,
        tool: true,
        category: true,
        slug: true,
        difficulty: true,
      },
    });

    if (workflows.length === 0) return '';

    const formatted = workflows.map((w, i) =>
      `${i + 1}. "${w.title}" (${w.tool}, ${w.category}) — ${w.description_fr?.slice(0, 120)}...`
    ).join('\n');

    return `\n\nWORKFLOWS PERTINENTS TROUVÉS DANS LA BIBLIOTHÈQUE FLUXTEKA :\n${formatted}\n\nUtilise ces workflows dans ta réponse si pertinents. L'utilisateur peut les trouver en cherchant leur titre sur fluxteka.com/recherche.`;
  } catch (err) {
    // Graceful — DB error doesn't break the chat
    console.warn('[chat] DB search failed:', err);
    return '';
  }
}

// ── Fallback responses (no API key) ──────────────────────────────────────────
const FALLBACK_RESPONSES = [
  "Bonjour ! Je suis l'assistant Fluxteka. Pour t'aider à trouver la meilleure automatisation, dis-moi : qu'est-ce que tu fais manuellement aujourd'hui que tu voudrais automatiser ?",
  "Je comprends ! Sur Fluxteka, nous avons des centaines de workflows pour ce cas d'usage. Tu peux rechercher directement dans notre bibliothèque, ou je peux te guider. Quel outil utilises-tu actuellement ?",
  "Super choix ! Pour aller plus loin, je te recommande de consulter la section dédiée dans notre catalogue, ou de contacter un de nos experts partenaires qui peuvent déployer ça en quelques heures. Tu veux que je t'oriente vers un expert ?",
  "Absolument ! La plupart de nos workflows s'installent en moins de 15 minutes. Tu peux aussi faire appel à un expert Fluxteka si tu préfères déléguer. Est-ce que tu veux plus d'informations ?",
];

let fallbackIndex = 0;

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Trop de messages. Réessaie dans une heure.' },
      { status: 429 }
    );
  }

  let body: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    workflowContext?: { title: string; description?: string; tools?: string[]; category?: string };
    locale?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { messages, workflowContext } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
  }

  // Get the last user message for DB search
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  // Search relevant workflows in parallel with prompt building
  const dbContext = await searchRelevantWorkflows(lastUserMessage);

  // Build contextual system prompt
  let systemPrompt = SYSTEM_PROMPT;

  if (workflowContext) {
    systemPrompt += `\n\nCONTEXTE ACTUEL : L'utilisateur regarde le workflow "${workflowContext.title}"`;
    if (workflowContext.description) {
      systemPrompt += ` — ${workflowContext.description.slice(0, 200)}`;
    }
    if (workflowContext.tools?.length) {
      systemPrompt += `. Outils utilisés : ${workflowContext.tools.join(', ')}.`;
    }
    if (workflowContext.category) {
      systemPrompt += ` Catégorie : ${workflowContext.category}.`;
    }
    systemPrompt += '\nTu peux donc répondre de manière très contextualisée à ce workflow précis.';
  }

  // Inject real DB results into prompt
  if (dbContext) {
    systemPrompt += dbContext;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── No API key: return fallback ──
  if (!apiKey) {
    const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
    fallbackIndex++;
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const words = response.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i] + (i < words.length - 1 ? ' ' : '')));
            i++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 30);
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Rate-Limit-Remaining': String(rate.remaining),
      },
    });
  }

  // ── Anthropic streaming ──
  try {
    const anthropicMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    // Stream SSE → plain text chunks
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                    controller.enqueue(encoder.encode(parsed.delta.text));
                  }
                } catch {
                  // skip malformed SSE
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Rate-Limit-Remaining': String(rate.remaining),
      },
    });
  } catch (err) {
    console.error('[/api/chat] Error:', err);
    const fallback = "Désolé, je rencontre une difficulté technique. Tu peux rechercher directement dans notre bibliothèque de workflows ou contacter notre équipe.";
    return new Response(fallback, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
