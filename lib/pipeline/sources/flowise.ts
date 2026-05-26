/**
 * Flowise AI Nodes Crawler — Indexe les composants/nodes de Flowise
 *
 * Flowise est open-source sur GitHub.
 * Les nodes (composants) sont dans : packages/components/nodes
 * https://api.github.com/repos/FlowiseAI/Flowise/contents/packages/components/nodes
 *
 * Chaque dossier = un node = un composant LLM/AI.
 * Exemples : ChatOpenAI, PineconeVectorStore, ConversationChain...
 *
 * Stratégie :
 * 1. Liste tous les dossiers (nodes) via GitHub API
 * 2. Pour chaque node, lit le fichier index.ts ou *.ts principal pour extraire
 *    nom, description, catégorie, inputs/outputs
 * 3. Génère un RawWorkflow par node avec contexte LLM app builder
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO = 'FlowiseAI/Flowise';
const NODES_PATH = 'packages/components/nodes';

// Catégories Flowise → catégories Fluxteka
const NODE_CATEGORIES: Record<string, string> = {
  // LLM & Chat models
  chatmodels: 'ai-agents',
  llms: 'ai-agents',
  embeddings: 'ai-agents',
  // Memory
  memory: 'ai-agents',
  // Vector stores
  vectorstores: 'data-analytics',
  // Agents & Chains
  agents: 'ai-agents',
  chains: 'ai-agents',
  // Tools
  tools: 'ai-agents',
  toolsFlowNode: 'ai-agents',
  // Document loaders
  documentloaders: 'data-analytics',
  // Text splitters
  textsplitters: 'data-analytics',
  // Retrievers
  retrievers: 'ai-agents',
  // Output parsers
  outputparsers: 'ai-agents',
  // Prompts
  prompts: 'ai-agents',
  // Cache
  cache: 'dev-tech',
  // Moderation
  moderation: 'ai-agents',
  // Multi-agents
  multiAgents: 'ai-agents',
  sequentialagents: 'ai-agents',
  // Utilities
  utilities: 'operations',
};

// Mapping nom de node → outils connectés inférés
const NODE_TOOL_HINTS: Record<string, string[]> = {
  openai: ['OpenAI', 'GPT-4'],
  anthropic: ['Anthropic', 'Claude'],
  gemini: ['Google Gemini', 'Google AI'],
  azure: ['Azure OpenAI', 'Microsoft Azure'],
  pinecone: ['Pinecone'],
  chroma: ['ChromaDB'],
  weaviate: ['Weaviate'],
  supabase: ['Supabase'],
  postgres: ['PostgreSQL'],
  mongodb: ['MongoDB'],
  redis: ['Redis'],
  notion: ['Notion'],
  github: ['GitHub'],
  slack: ['Slack'],
  gmail: ['Gmail'],
  serpapi: ['SerpAPI', 'Google Search'],
  browserless: ['Browserless'],
  playwright: ['Playwright'],
  pdf: ['PDF'],
  docx: ['Word/DOCX'],
  csv: ['CSV'],
  sqlite: ['SQLite'],
  mysql: ['MySQL'],
  milvus: ['Milvus'],
  qdrant: ['Qdrant'],
  faiss: ['FAISS'],
  cohere: ['Cohere'],
  mistral: ['Mistral AI'],
  ollama: ['Ollama'],
  huggingface: ['HuggingFace'],
  replicate: ['Replicate'],
  groq: ['Groq'],
};

interface GitHubContent {
  name: string;
  path: string;
  type: 'dir' | 'file';
  html_url: string;
}

function toLabel(dirName: string): string {
  // CamelCase to readable
  return dirName
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function inferCategory(nodeName: string): string {
  const lower = nodeName.toLowerCase();
  for (const [key, cat] of Object.entries(NODE_CATEGORIES)) {
    if (lower.includes(key.toLowerCase())) return cat;
  }
  return 'ai-agents'; // Flowise est 100% LLM/AI
}

function inferTools(nodeName: string, description: string): string[] {
  const tools: string[] = [];
  const text = (nodeName + ' ' + description).toLowerCase();

  for (const [key, toolList] of Object.entries(NODE_TOOL_HINTS)) {
    if (text.includes(key)) {
      tools.push(...toolList);
    }
  }

  // Toujours inclure Flowise
  tools.push('Flowise');
  if (text.includes('langchain') || text.includes('chain')) tools.push('LangChain');
  if (text.includes('llm') || text.includes('model')) tools.push('LLM');

  return [...new Set(tools)].slice(0, 8);
}

export class FlowiseCrawler implements CrawlerSource {
  name = 'flowise-nodes';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    const headers: Record<string, string> = {
      'User-Agent': 'Fluxteka/1.0',
      'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Liste tous les dossiers de nodes
    let nodes: GitHubContent[] = [];
    try {
      const listRes = await fetch(
        `${GITHUB_API_BASE}/repos/${REPO}/contents/${NODES_PATH}`,
        { headers }
      );

      if (!listRes.ok) {
        console.error(`[Flowise] GitHub API error: ${listRes.status} ${listRes.statusText}`);
        return [];
      }

      const data: GitHubContent[] = await listRes.json();
      nodes = data.filter(item => item.type === 'dir');
      console.log(`[Flowise] ${nodes.length} nodes trouvés`);
    } catch (err) {
      console.error(`[Flowise] Erreur liste GitHub: ${err}`);
      return [];
    }

    // 2. Pour chaque node, extraire les métadonnées
    const toProcess = nodes.slice(0, maxResults);

    for (const node of toProcess) {
      if (results.length >= maxResults) break;

      try {
        const nodeName = node.name;
        const displayName = toLabel(nodeName);

        // Tenter de lire le fichier principal du node pour extraire description
        let description = `Composant ${displayName} pour Flowise — builder d'applications LLM`;
        let nodeType = 'unknown';
        let category = inferCategory(nodeName);

        // Lecture du répertoire pour trouver le fichier principal
        const nodeContentsRes = await fetch(
          `${GITHUB_API_BASE}/repos/${REPO}/contents/${node.path}`,
          { headers }
        );

        if (nodeContentsRes.ok) {
          const nodeContents: GitHubContent[] = await nodeContentsRes.json();
          const mainFile = nodeContents.find(f =>
            f.type === 'file' &&
            (f.name === `${nodeName}.ts` || f.name === 'index.ts' || f.name.endsWith('.ts'))
          );

          if (mainFile) {
            // Lire le fichier pour extraire description et type
            const fileRes = await fetch(mainFile.html_url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/'), {
              headers: { 'User-Agent': 'Fluxteka/1.0' }
            });

            if (fileRes.ok) {
              const content = await fileRes.text();
              // Extraire la description depuis le code TypeScript
              const descMatch = content.match(/description['":\s]+['"`]([^'"`\n]{20,300})['"`]/i);
              if (descMatch) description = descMatch[1];

              // Extraire le type de node
              const typeMatch = content.match(/type['":\s]+['"`]([A-Za-z]+)['"`]/);
              if (typeMatch) nodeType = typeMatch[1];

              // Extraire la catégorie depuis le code
              const catMatch = content.match(/category['":\s]+['"`]([^'"`]+)['"`]/i);
              if (catMatch) {
                const rawCat = catMatch[1].toLowerCase().replace(/\s+/g, '');
                category = NODE_CATEGORIES[rawCat] || category;
              }
            }
          }
        }

        const tools = inferTools(nodeName, description);
        const title = `${displayName} — Node Flowise pour apps LLM`;
        const url = `https://github.com/${REPO}/tree/main/${node.path}`;

        const tags = [
          nodeName.toLowerCase(),
          'flowise',
          'llm',
          'ai',
          'no-code',
          'langchain',
          category,
          nodeType !== 'unknown' ? nodeType.toLowerCase() : 'node',
        ].filter(Boolean).slice(0, 10);

        const rawContent = [
          `Platform: Flowise`,
          `Node: ${displayName}`,
          `Type: ${nodeType}`,
          `Category: ${category}`,
          `Description: ${description}`,
          `Connected Tools: ${tools.join(', ')}`,
          ``,
          `${displayName} est un composant (node) de Flowise, la plateforme low-code pour créer des applications LLM.`,
          ``,
          `Flowise permet de construire visuellement des chatbots, agents AI et pipelines RAG avec des nodes drag-and-drop.`,
          `Ce node permet de ${description.toLowerCase()}.`,
          ``,
          `Outils compatibles : ${tools.join(', ')}.`,
          ``,
          `Idéal pour les équipes souhaitant créer des applications LLM sans code, basées sur LangChain et LlamaIndex.`,
        ].join('\n');

        results.push({
          url,
          title,
          rawContent,
          tool: 'flowise',
          sourceType: 'flowise-nodes',
          sourceStars: 0,
          sourceViews: 0,
          author: 'flowise-community',
          authorUrl: `https://github.com/${REPO}`,
          tags,
        });

        // Respect du rate limit GitHub
        await new Promise(r => setTimeout(r, process.env.GITHUB_TOKEN ? 200 : 2000));
      } catch (err) {
        console.warn(`[Flowise] Erreur node "${node.name}": ${err}`);
      }
    }

    console.log(`[Flowise] ${results.length} workflows générés`);
    return results;
  }
}
