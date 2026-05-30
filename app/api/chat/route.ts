import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ai/chatRateLimiter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'Assistant Fluxteka, un expert en automatisation et IA au service des entreprises et professionnels.

TON RÔLE :
- Aider les visiteurs à comprendre comment automatiser leur business
- Recommander les workflows adaptés à leur situation
- Qualifier leur niveau technique (débutant/intermédiaire/expert)
- Orienter vers un expert quand le besoin dépasse le DIY (projet > 2h de setup ou budget > 500€)
- Capturer leur email quand c'est pertinent (après 3 échanges utiles)

TON STYLE :
- Langage simple, jamais de jargon technique incompréhensible
- Concret et orienté résultats ("ça te fera gagner X heures par semaine")
- Bienveillant mais direct
- Réponses courtes (3-5 phrases max sauf si besoin d'explication)
- Toujours proposer une prochaine étape claire

CE QUE TU SAIS :
- Fluxteka est une marketplace de workflows d'automatisation (N8N, Make, Zapier, LangChain)
- 1 854 workflows disponibles, gratuits, dans toutes les catégories
- Des agences et freelances experts en automatisation sont disponibles sur la plateforme
- Les principaux cas d'usage : email automatique, CRM, facturation, réseaux sociaux, leads, support

QUAND PROPOSER UN EXPERT :
- Si le projet semble complexe (> 3 outils, logique conditionnelle avancée)
- Si l'utilisateur dit qu'il n'est pas technique
- Si le budget mentionné dépasse 500€
- Toujours après avoir essayé d'aider soi-même d'abord

CAPTURE D'EMAIL :
Après 3 échanges pertinents, propose naturellement :
"Pour te suivre et t'envoyer les workflows adaptés à ton cas, puis-je avoir ton email ?"

LANGUE : Réponds TOUJOURS dans la langue dans laquelle l'utilisateur t'écrit.`;

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

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── No API key: return fallback ──
  if (!apiKey) {
    const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
    fallbackIndex++;
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        // Simulate streaming word by word
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
        max_tokens: 512,
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
    // Graceful fallback
    const fallback = "Désolé, je rencontre une difficulté technique. Tu peux rechercher directement dans notre bibliothèque de workflows ou contacter notre équipe.";
    return new Response(fallback, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
