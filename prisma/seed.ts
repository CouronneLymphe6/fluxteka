import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

// Load env for seed script
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Fluxteka database...\n');

  // ── Pipeline User ──
  const pipelineUser = await prisma.user.upsert({
    where: { email: 'pipeline@fluxteka.com' },
    update: {},
    create: {
      email: 'pipeline@fluxteka.com',
      name: 'Fluxteka Pipeline',
      role: 'seller',
      email_verified: true,
    },
  });
  console.log('  ✅ Utilisateur pipeline créé');

  // ── Community Users ──
  const communityUsers = [
    { email: 'community-n8n@fluxteka.com', name: 'Communauté N8N', role: 'seller' },
    { email: 'community-make@fluxteka.com', name: 'Communauté Make', role: 'seller' },
    { email: 'community-zapier@fluxteka.com', name: 'Communauté Zapier', role: 'seller' },
    { email: 'community-langchain@fluxteka.com', name: 'Communauté LangChain', role: 'seller' },
    { email: 'community-crewai@fluxteka.com', name: 'Communauté CrewAI', role: 'seller' },
  ];

  const users: Record<string, string> = {};
  for (const u of communityUsers) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, email_verified: true },
    });
    users[u.name] = created.id;
  }
  console.log(`  ✅ ${communityUsers.length} utilisateurs communauté créés`);

  // ── Settings ──
  const settings = [
    { key: 'monetization_phase', value: '1', description: 'Phase actuelle de monétisation (1=affiliés, 2=Stripe)' },
    { key: 'stripe_active', value: 'false', description: 'Paiements Stripe activés' },
    { key: 'adsense_active', value: 'false', description: 'Google AdSense activé' },
    { key: 'affiliate_active', value: 'true', description: 'Liens affiliés activés' },
    { key: 'commission_rate', value: '0.05', description: 'Taux de commission sur les ventes (5%)' },
    { key: 'agency_badge_price', value: '19', description: 'Prix mensuel du badge agence (€)' },
    { key: 'site_name', value: 'Fluxteka', description: 'Nom du site' },
    { key: 'maintenance_mode', value: 'false', description: 'Mode maintenance activé' },
    { key: 'pipeline_github_active', value: 'true', description: 'Source GitHub activée dans le pipeline' },
    { key: 'pipeline_reddit_active', value: 'true', description: 'Source Reddit activée dans le pipeline' },
    { key: 'pipeline_n8n_active', value: 'true', description: 'Source N8N Community activée dans le pipeline' },
    { key: 'pipeline_make_active', value: 'true', description: 'Source Make Community activée dans le pipeline' },
    { key: 'pipeline_youtube_active', value: 'true', description: 'Source YouTube activée dans le pipeline' },
    { key: 'pipeline_max_per_run', value: '200', description: 'Nombre max de workflows à traiter par exécution' },
    { key: 'pipeline_cost_alert_usd', value: '30', description: 'Seuil alerte coût mensuel IA ($)' },
    { key: 'pipeline_quality_threshold', value: '5', description: 'Score qualité minimum pour indexer un workflow' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }
  console.log(`  ✅ ${settings.length} settings créés`);

  // ── Affiliate Links ──
  const affiliateLinks = [
    { tool: 'n8n', url: 'https://n8n.io/?ref=fluxteka', label: 'Essayer N8N gratuitement' },
    { tool: 'make', url: 'https://make.com/?ref=fluxteka', label: 'Essayer Make gratuitement' },
    { tool: 'zapier', url: 'https://zapier.com/?ref=fluxteka', label: 'Essayer Zapier gratuitement' },
    { tool: 'langchain', url: 'https://langchain.com/?ref=fluxteka', label: 'Découvrir LangChain' },
  ];

  for (const link of affiliateLinks) {
    await prisma.affiliateLink.upsert({
      where: { tool: link.tool },
      update: { url: link.url, label: link.label },
      create: link,
    });
  }
  console.log(`  ✅ ${affiliateLinks.length} liens affiliés créés`);

  // ── Workflows ──
  const workflows = [
    // === EMAIL & COMMUNICATION ===
    {
      slug: 'email-stripe-echec-paiement',
      title: 'Notifier par email les paiements Stripe échoués',
      description_fr: 'Surveille les événements Stripe via webhook et envoie automatiquement un email de relance au client contenant un lien de mise à jour de sa carte bancaire. Inclut un modèle d\'email personnalisable et un suivi des relances dans un Google Sheet.',
      tool: 'n8n', category: 'email',
      tools_connected: JSON.stringify(['Stripe', 'Gmail', 'Google Sheets']),
      tags: JSON.stringify(['stripe', 'email', 'paiement', 'relance', 'webhook']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/stripe-failed-payments',
      source_type: 'github', source_stars: 342,
      score_total: 9.2, score_users: 9.0, score_popularity: 9.5, score_freshness: 9.0, score_reports: 9.5,
      views: 1847, downloads: 312, status: 'active',
      author_id: users['Communauté N8N'],
    },
    {
      slug: 'email-bienvenue-sequence-3j',
      title: 'Séquence de bienvenue email en 3 jours',
      description_fr: 'Envoie une série de 3 emails de bienvenue automatiquement après l\'inscription d\'un nouvel utilisateur. Jour 1 : Bienvenue et premier pas. Jour 2 : Présentation des fonctionnalités. Jour 3 : Offre spéciale de bienvenue.',
      tool: 'make', category: 'email',
      tools_connected: JSON.stringify(['Mailchimp', 'Airtable', 'Webhook']),
      tags: JSON.stringify(['email', 'onboarding', 'bienvenue', 'séquence', 'marketing']),
      source_url: 'https://community.make.com/t/welcome-email-sequence',
      source_type: 'make-community',
      score_total: 8.4, score_users: 8.0, score_popularity: 8.5, score_freshness: 8.8, score_reports: 8.5,
      views: 1234, downloads: 256, status: 'active',
      author_id: users['Communauté Make'],
    },
    // === CONTENU & SEO ===
    {
      slug: 'linkedin-publication-ia',
      title: 'Publier automatiquement sur LinkedIn avec l\'IA',
      description_fr: 'Génère du contenu LinkedIn professionnel avec Claude, programme les publications et suit les performances. Le workflow prend un sujet, génère un post optimisé avec hashtags, et le publie au meilleur moment.',
      tool: 'make', category: 'content',
      tools_connected: JSON.stringify(['Claude AI', 'LinkedIn', 'Google Sheets']),
      tags: JSON.stringify(['linkedin', 'ia', 'contenu', 'réseaux sociaux', 'publication']),
      source_url: 'https://community.make.com/t/ai-linkedin-publisher',
      source_type: 'make-community',
      score_total: 8.7, score_users: 8.5, score_popularity: 9.0, score_freshness: 8.5, score_reports: 9.0,
      views: 2103, downloads: 445, status: 'active',
      author_id: users['Communauté Make'],
    },
    {
      slug: 'blog-seo-generateur-articles',
      title: 'Générateur d\'articles de blog optimisés SEO',
      description_fr: 'Pipeline complet de création d\'articles de blog. Prend un mot-clé, analyse la SERP, génère un article structuré avec H2/H3, méta-description, et le publie sur WordPress.',
      tool: 'n8n', category: 'content',
      tools_connected: JSON.stringify(['OpenAI', 'WordPress', 'Google Search Console']),
      tags: JSON.stringify(['seo', 'blog', 'article', 'wordpress', 'ia', 'contenu']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/seo-blog-generator',
      source_type: 'github', source_stars: 567,
      score_total: 8.9, score_users: 8.5, score_popularity: 9.2, score_freshness: 9.0, score_reports: 9.0,
      views: 2890, downloads: 534, status: 'active',
      author_id: users['Communauté N8N'],
    },
    // === VENTES & CRM ===
    {
      slug: 'crm-hubspot-sync-contacts',
      title: 'Synchroniser les contacts HubSpot avec Google Sheets',
      description_fr: 'Synchronisation bidirectionnelle entre HubSpot CRM et Google Sheets. Les modifications dans l\'un se propagent automatiquement dans l\'autre en temps réel via webhooks.',
      tool: 'zapier', category: 'crm',
      tools_connected: JSON.stringify(['HubSpot', 'Google Sheets', 'Webhooks']),
      tags: JSON.stringify(['hubspot', 'google sheets', 'crm', 'synchronisation', 'contacts']),
      source_url: 'https://zapier.com/apps/hubspot/integrations/google-sheets',
      source_type: 'zapier-template',
      score_total: 8.5, score_users: 8.0, score_popularity: 8.8, score_freshness: 8.5, score_reports: 9.0,
      views: 1523, downloads: 287, status: 'active',
      author_id: users['Communauté Zapier'],
    },
    {
      slug: 'crm-lead-scoring-ia',
      title: 'Lead scoring automatique avec l\'IA',
      description_fr: 'Analyse chaque nouveau lead entrant avec un modèle IA pour attribuer un score de 0 à 100. Les leads chauds (score > 70) déclenchent une notification Slack et un email au commercial.',
      tool: 'n8n', category: 'crm',
      tools_connected: JSON.stringify(['HubSpot', 'OpenAI', 'Slack', 'Gmail']),
      tags: JSON.stringify(['lead', 'scoring', 'ia', 'crm', 'commercial', 'notification']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/lead-scoring-ai',
      source_type: 'github', source_stars: 234,
      score_total: 9.1, score_users: 9.0, score_popularity: 9.0, score_freshness: 9.5, score_reports: 9.0,
      views: 1876, downloads: 398, status: 'active',
      author_id: users['Communauté N8N'],
    },
    // === AGENTS IA ===
    {
      slug: 'agent-ia-analyse-pdf',
      title: 'Agent IA pour analyser et résumer des PDF',
      description_fr: 'Upload un document PDF, l\'agent IA extrait les informations clés, génère un résumé structuré et répond aux questions posées sur le document. Utilise le RAG (Retrieval Augmented Generation) pour des réponses précises.',
      tool: 'langchain', category: 'ai-agents',
      tools_connected: JSON.stringify(['Claude', 'Pinecone', 'FastAPI']),
      tags: JSON.stringify(['ia', 'pdf', 'rag', 'résumé', 'agent', 'document']),
      source_url: 'https://github.com/langchain-ai/langchain/tree/main/templates/rag-conversation',
      source_type: 'github', source_stars: 1234,
      score_total: 9.0, score_users: 9.0, score_popularity: 9.0, score_freshness: 9.0, score_reports: 9.0,
      views: 3201, downloads: 621, status: 'active',
      author_id: users['Communauté LangChain'],
    },
    {
      slug: 'agent-support-client-autonome',
      title: 'Agent de support client autonome',
      description_fr: 'Chatbot intelligent qui répond aux questions des clients en se basant sur votre base de connaissances. Escalade automatiquement vers un humain quand il ne sait pas répondre. Supporte le français et l\'anglais.',
      tool: 'langchain', category: 'ai-agents',
      tools_connected: JSON.stringify(['OpenAI', 'Supabase', 'Intercom']),
      tags: JSON.stringify(['chatbot', 'support', 'client', 'ia', 'agent', 'rag']),
      source_url: 'https://github.com/langchain-ai/langchain/tree/main/templates/customer-support',
      source_type: 'github', source_stars: 876,
      score_total: 8.6, score_users: 8.5, score_popularity: 8.8, score_freshness: 8.5, score_reports: 8.5,
      views: 1654, downloads: 342, status: 'active',
      author_id: users['Communauté LangChain'],
    },
    {
      slug: 'agent-multi-outils-crewai',
      title: 'Équipe d\'agents IA multi-tâches avec CrewAI',
      description_fr: 'Orchestration de plusieurs agents IA spécialisés qui collaborent pour accomplir des tâches complexes : recherche web, analyse de données, rédaction de rapport. Chaque agent a son rôle et ses outils.',
      tool: 'langchain', category: 'ai-agents',
      tools_connected: JSON.stringify(['CrewAI', 'Tavily', 'OpenAI']),
      tags: JSON.stringify(['crewai', 'multi-agent', 'orchestration', 'ia', 'recherche']),
      source_url: 'https://github.com/crewAIInc/crewAI-examples',
      source_type: 'github', source_stars: 2345,
      score_total: 9.3, score_users: 9.5, score_popularity: 9.0, score_freshness: 9.5, score_reports: 9.0,
      views: 4521, downloads: 890, status: 'active',
      author_id: users['Communauté CrewAI'],
    },
    // === FINANCE & FACTURATION ===
    {
      slug: 'factures-automatiques-notion',
      title: 'Générer des factures PDF depuis Notion',
      description_fr: 'Transforme les entrées d\'une base Notion en factures PDF professionnelles, numérotées et envoyées automatiquement par email au client. Inclut le calcul de TVA et un suivi des paiements.',
      tool: 'n8n', category: 'finance',
      tools_connected: JSON.stringify(['Notion', 'PDF Generator', 'Gmail']),
      tags: JSON.stringify(['notion', 'facture', 'pdf', 'comptabilité', 'tva']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/notion-invoice-generator',
      source_type: 'github', source_stars: 189,
      score_total: 8.3, score_users: 8.0, score_popularity: 8.5, score_freshness: 8.0, score_reports: 9.0,
      views: 987, downloads: 198, status: 'active',
      author_id: users['Communauté N8N'],
    },
    {
      slug: 'rapprochement-bancaire-auto',
      title: 'Rapprochement bancaire automatique avec l\'IA',
      description_fr: 'Compare les transactions bancaires avec les factures émises et reçues. L\'IA identifie les correspondances, signale les écarts et génère un rapport de rapprochement mensuel.',
      tool: 'make', category: 'finance',
      tools_connected: JSON.stringify(['Qonto', 'Google Sheets', 'Claude AI']),
      tags: JSON.stringify(['banque', 'rapprochement', 'comptabilité', 'ia', 'qonto']),
      source_url: 'https://community.make.com/t/bank-reconciliation-ai',
      source_type: 'make-community',
      score_total: 7.8, score_users: 7.5, score_popularity: 8.0, score_freshness: 8.0, score_reports: 8.0,
      views: 654, downloads: 123, status: 'active',
      author_id: users['Communauté Make'],
    },
    // === E-COMMERCE ===
    {
      slug: 'ecommerce-abandon-panier',
      title: 'Relance automatique d\'abandon de panier Shopify',
      description_fr: 'Détecte les paniers abandonnés sur Shopify et envoie une séquence de 3 emails de relance avec code promo personnalisé. Délais configurables (1h, 24h, 72h).',
      tool: 'make', category: 'ecommerce',
      tools_connected: JSON.stringify(['Shopify', 'Sendinblue', 'Webhook']),
      tags: JSON.stringify(['shopify', 'email', 'abandon', 'ecommerce', 'relance', 'panier']),
      source_url: 'https://community.make.com/t/shopify-cart-abandonment',
      source_type: 'make-community',
      score_total: 8.8, score_users: 8.5, score_popularity: 9.0, score_freshness: 8.8, score_reports: 9.0,
      views: 1456, downloads: 367, status: 'active',
      author_id: users['Communauté Make'],
    },
    {
      slug: 'ecommerce-suivi-avis-clients',
      title: 'Collecter et analyser les avis clients automatiquement',
      description_fr: 'Envoie un email de demande d\'avis 7 jours après livraison. L\'IA analyse le sentiment de chaque avis, alerte l\'équipe sur les avis négatifs et compile un rapport hebdomadaire.',
      tool: 'zapier', category: 'ecommerce',
      tools_connected: JSON.stringify(['Shopify', 'Typeform', 'OpenAI', 'Slack']),
      tags: JSON.stringify(['avis', 'clients', 'shopify', 'sentiment', 'ia', 'feedback']),
      source_url: 'https://zapier.com/apps/shopify/integrations/typeform',
      source_type: 'zapier-template',
      score_total: 8.1, score_users: 7.5, score_popularity: 8.5, score_freshness: 8.0, score_reports: 8.5,
      views: 876, downloads: 187, status: 'active',
      author_id: users['Communauté Zapier'],
    },
    // === DATA & RAPPORTS ===
    {
      slug: 'data-dashboard-kpi-auto',
      title: 'Dashboard KPI automatique depuis Google Analytics',
      description_fr: 'Extrait les métriques clés de Google Analytics 4 et génère un dashboard mis à jour automatiquement dans Google Sheets. Inclut les tendances, comparaisons et alertes en cas d\'anomalie.',
      tool: 'n8n', category: 'data',
      tools_connected: JSON.stringify(['Google Analytics', 'Google Sheets', 'Slack']),
      tags: JSON.stringify(['analytics', 'kpi', 'dashboard', 'google', 'rapport']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/ga4-dashboard',
      source_type: 'github', source_stars: 456,
      score_total: 8.6, score_users: 8.0, score_popularity: 9.0, score_freshness: 8.5, score_reports: 9.0,
      views: 2134, downloads: 476, status: 'active',
      author_id: users['Communauté N8N'],
    },
    {
      slug: 'data-scraping-concurrent-ia',
      title: 'Scraping web intelligent avec enrichissement IA',
      description_fr: 'Extrait des données de sites web de manière structurée. L\'IA nettoie et enrichit les données extraites, détecte les doublons et exporte le tout en CSV ou directement dans Airtable.',
      tool: 'n8n', category: 'data',
      tools_connected: JSON.stringify(['HTTP Request', 'OpenAI', 'Airtable']),
      tags: JSON.stringify(['scraping', 'données', 'ia', 'airtable', 'extraction']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/web-scraper-ai',
      source_type: 'github', source_stars: 789,
      score_total: 8.4, score_users: 8.0, score_popularity: 8.8, score_freshness: 8.5, score_reports: 8.5,
      views: 1567, downloads: 345, status: 'active',
      author_id: users['Communauté N8N'],
    },
    // === RH & RECRUTEMENT ===
    {
      slug: 'rh-tri-cv-automatique-ia',
      title: 'Tri automatique de CV avec scoring IA',
      description_fr: 'Analyse les CV reçus par email avec l\'IA. Attribue un score de pertinence par rapport à l\'offre d\'emploi, classe les candidats et envoie une notification Slack pour les profils les mieux classés.',
      tool: 'make', category: 'hr',
      tools_connected: JSON.stringify(['Gmail', 'Claude AI', 'Airtable', 'Slack']),
      tags: JSON.stringify(['cv', 'recrutement', 'rh', 'ia', 'tri', 'candidat']),
      source_url: 'https://community.make.com/t/cv-screening-ai',
      source_type: 'make-community',
      score_total: 8.5, score_users: 8.0, score_popularity: 9.0, score_freshness: 8.5, score_reports: 8.5,
      views: 1345, downloads: 278, status: 'active',
      author_id: users['Communauté Make'],
    },
    {
      slug: 'rh-onboarding-nouvel-employe',
      title: 'Onboarding automatisé des nouveaux employés',
      description_fr: 'Quand un nouveau collaborateur est ajouté dans le SIRH, crée automatiquement ses comptes (Google Workspace, Slack, Notion), envoie le kit de bienvenue et programme les réunions d\'intégration.',
      tool: 'zapier', category: 'hr',
      tools_connected: JSON.stringify(['BambooHR', 'Google Admin', 'Slack', 'Notion']),
      tags: JSON.stringify(['onboarding', 'rh', 'employé', 'intégration', 'comptes']),
      source_url: 'https://zapier.com/apps/bamboohr/integrations',
      source_type: 'zapier-template',
      score_total: 8.2, score_users: 8.0, score_popularity: 8.5, score_freshness: 8.0, score_reports: 8.5,
      views: 1098, downloads: 234, status: 'active',
      author_id: users['Communauté Zapier'],
    },
    // === BONUS: WORKFLOWS POPULAIRES ===
    {
      slug: 'slack-resume-reunions-ia',
      title: 'Résumé automatique de réunions dans Slack',
      description_fr: 'Transcrit les réunions Google Meet ou Zoom, génère un résumé avec les points clés et actions à mener, puis le poste dans le channel Slack approprié. Parfait pour les absents.',
      tool: 'n8n', category: 'email',
      tools_connected: JSON.stringify(['Google Meet', 'OpenAI', 'Slack']),
      tags: JSON.stringify(['réunion', 'résumé', 'slack', 'ia', 'transcription', 'google meet']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/meeting-summarizer',
      source_type: 'github', source_stars: 1567,
      score_total: 9.4, score_users: 9.5, score_popularity: 9.5, score_freshness: 9.0, score_reports: 9.5,
      views: 5432, downloads: 1023, status: 'active',
      author_id: users['Communauté N8N'],
    },
    {
      slug: 'notion-to-twitter-auto',
      title: 'Publier sur Twitter/X depuis une base Notion',
      description_fr: 'Transforme les entrées d\'une base Notion marquées "Prêt" en tweets automatiquement. Supporte les threads, les images et la programmation horaire. Idéal pour les créateurs de contenu.',
      tool: 'make', category: 'content',
      tools_connected: JSON.stringify(['Notion', 'Twitter/X', 'Buffer']),
      tags: JSON.stringify(['twitter', 'notion', 'contenu', 'réseaux sociaux', 'thread']),
      source_url: 'https://community.make.com/t/notion-to-twitter',
      source_type: 'make-community',
      score_total: 8.0, score_users: 7.5, score_popularity: 8.5, score_freshness: 8.0, score_reports: 8.0,
      views: 1234, downloads: 267, status: 'active',
      author_id: users['Communauté Make'],
    },
    {
      slug: 'veille-concurrentielle-ia',
      title: 'Veille concurrentielle automatique avec alertes IA',
      description_fr: 'Surveille les sites web de vos concurrents, détecte les changements de prix, nouveaux produits et articles de blog. L\'IA analyse les évolutions et envoie un rapport hebdomadaire.',
      tool: 'n8n', category: 'data',
      tools_connected: JSON.stringify(['HTTP Request', 'Claude AI', 'Gmail', 'Google Sheets']),
      tags: JSON.stringify(['veille', 'concurrence', 'ia', 'monitoring', 'prix', 'alerte']),
      source_url: 'https://github.com/n8n-io/n8n-workflows/tree/main/competitive-intelligence',
      source_type: 'github', source_stars: 432,
      score_total: 8.7, score_users: 8.5, score_popularity: 9.0, score_freshness: 8.5, score_reports: 9.0,
      views: 1987, downloads: 412, status: 'active',
      author_id: users['Communauté N8N'],
    },
  ];

  for (const wf of workflows) {
    await prisma.workflow.upsert({
      where: { slug: wf.slug },
      update: {},
      create: wf,
    });
  }
  console.log(`  ✅ ${workflows.length} workflows créés`);

  console.log('\n🎉 Seeding terminé !');
  console.log(`   📊 Total: ${workflows.length} workflows, ${communityUsers.length + 1} utilisateurs, ${settings.length} settings, ${affiliateLinks.length} liens affiliés`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
