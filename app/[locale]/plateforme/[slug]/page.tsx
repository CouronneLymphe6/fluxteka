import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ExternalLink, Zap, Users, Star, Shield } from 'lucide-react';

// ── Platform data ────────────────────────────────────────────────────────────

const PLATFORMS = {
  n8n: {
    name: 'n8n',
    tagline: 'L\'automatisation open-source pour les développeurs et les équipes tech',
    description: 'n8n est une plateforme d\'automatisation de workflow open-source, puissante et flexible. Idéale pour les équipes tech qui veulent garder le contrôle de leurs données (self-hosted) tout en bénéficiant d\'un écosystème de 400+ intégrations.',
    affiliateUrl: 'https://n8n.io/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    emoji: '🔶',
    commission: '30% pendant 12 mois',
    freeTier: 'Gratuit en self-hosted',
    difficulty: 'Intermédiaire → Avancé',
    bestFor: ['Développeurs', 'Équipes DevOps', 'Startups tech', 'Self-hosted'],
    pros: [
      'Open-source et self-hostable (données 100% chez toi)',
      'Plus de 400 intégrations natives',
      'Agents IA natifs (LangChain, OpenAI, Gemini)',
      'Communauté très active — 7 000+ templates',
      'Programme affilié généreux (30%/12 mois)',
    ],
    cons: [
      'Courbe d\'apprentissage plus élevée que Zapier',
      'Interface parfois complexe pour les débutants',
      'Cloud payant si tu ne self-hostes pas',
    ],
    stats: [
      { label: 'Intégrations', value: '400+' },
      { label: 'Templates', value: '7 000+' },
      { label: 'Stars GitHub', value: '50k+' },
    ],
  },
  make: {
    name: 'Make',
    tagline: 'L\'automatisation visuelle la plus puissante pour les agences et freelances',
    description: 'Make (ex-Integromat) est la plateforme d\'automatisation visuelle préférée des agences et experts en automation. Son builder drag-and-drop est le plus puissant du marché pour créer des workflows complexes multi-étapes.',
    affiliateUrl: 'https://www.make.com/en/register?utm_source=fluxteka&utm_medium=referral',
    color: 'from-purple-600 to-violet-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-100',
    emoji: '🟣',
    commission: '35% pendant 12 mois',
    freeTier: '1 000 opérations/mois',
    difficulty: 'Débutant → Intermédiaire',
    bestFor: ['Agences', 'Freelances', 'PMEs', 'Non-développeurs'],
    pros: [
      'Interface visuelle la plus intuitive du marché',
      'Tarification prévisible par crédits',
      'Plus de 1 000 applications intégrées',
      'Meilleur programme affilié du secteur (35%/12 mois)',
      'Parfait pour les workflows complexes multi-étapes',
    ],
    cons: [
      'Pas open-source (données sur serveurs Make)',
      'Peut devenir coûteux à fort volume',
      'Moins de contrôle qu\'une solution self-hosted',
    ],
    stats: [
      { label: 'Intégrations', value: '1 000+' },
      { label: 'Templates', value: '2 000+' },
      { label: 'Utilisateurs', value: '500k+' },
    ],
  },
  zapier: {
    name: 'Zapier',
    tagline: 'Le leader mondial de l\'automatisation no-code pour non-techniciens',
    description: 'Zapier est la référence mondiale de l\'automatisation no-code. Avec 8 000+ applications intégrées et une UX pensée pour les débutants, c\'est le point d\'entrée idéal pour automatiser sans coder.',
    affiliateUrl: 'https://zapier.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    emoji: '⚡',
    commission: 'Pas de programme affilié public',
    freeTier: '100 tâches/mois (très limité)',
    difficulty: 'Débutant',
    bestFor: ['Débutants', 'PMEs non-tech', 'Marketing', 'RH'],
    pros: [
      'UX la plus simple et intuitive du marché',
      '8 000+ applications intégrées (le plus large)',
      'Templates organisés par rôle métier',
      'Zapier AI pour construire des workflows en langage naturel',
      'Support client réactif',
    ],
    cons: [
      'Très cher à l\'usage (100 tasks/mois en gratuit)',
      'Pas de programme affilié public',
      'Moins flexible que n8n ou Make pour les cas complexes',
      'Données uniquement sur les serveurs Zapier',
    ],
    stats: [
      { label: 'Intégrations', value: '8 000+' },
      { label: 'Templates', value: '10 000+' },
      { label: 'Utilisateurs', value: '2,2M+' },
    ],
  },
  langchain: {
    name: 'LangChain',
    tagline: 'Le framework open-source pour construire des agents IA autonomes',
    description: 'LangChain est le framework Python/JavaScript de référence pour construire des applications IA et des agents autonomes. Il permet de connecter des LLMs (GPT-4, Claude, Gemini) à des outils, bases de données et API externes.',
    affiliateUrl: 'https://www.langchain.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    emoji: '🦜',
    commission: 'Pas de programme affilié',
    freeTier: 'Open-source & gratuit',
    difficulty: 'Avancé (Python/JS requis)',
    bestFor: ['Développeurs', 'Data Scientists', 'Chercheurs IA', 'Startups IA'],
    pros: [
      'Open-source et gratuit à utiliser',
      'Écosystème le plus riche pour les agents IA',
      'Compatible avec tous les LLMs (OpenAI, Claude, Gemini, Mistral…)',
      'RAG, Agents multi-étapes, Memory, Tools natifs',
      'Communauté massive (GitHub, Discord)',
    ],
    cons: [
      'Requiert des compétences Python/JavaScript',
      'Plus complexe que les solutions no-code',
      'Évolution rapide — documentation parfois en retard',
    ],
    stats: [
      { label: 'Stars GitHub', value: '90k+' },
      { label: 'Intégrations LLM', value: '50+' },
      { label: 'Packages', value: '1 000+' },
    ],
  },
  // ── AUTOMATISATION ──────────────────────────────────────────────────────────
  pipedream: {
    name: 'Pipedream',
    tagline: 'L\'automatisation serverless pour développeurs — gratuit et puissant',
    description: 'Pipedream est la plateforme d\'automatisation serverless préférée des développeurs. Elle permet de connecter n\'importe quelle API en quelques minutes avec du code Node.js, Python ou no-code, avec un généreux plan gratuit.',
    affiliateUrl: 'https://pipedream.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-green-500 to-teal-600',
    lightBg: 'bg-green-50',
    border: 'border-green-200',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-100',
    emoji: '🟢',
    commission: 'Programme affilié disponible',
    freeTier: '10 000 événements/mois gratuits',
    difficulty: 'Intermédiaire',
    bestFor: ['Développeurs', 'Startups', 'Product Managers', 'DevOps'],
    pros: [
      'Plan gratuit très généreux (10k events/mois)',
      'Mix no-code + code (Node.js, Python, Bash)',
      'Déclenché par webhooks, cron, emails, API',
      '1 000+ composants prêts à l\'emploi',
      'Exécution serverless — aucune infrastructure à gérer',
    ],
    cons: [
      'Interface moins intuitive que Zapier pour les débutants',
      'Documentation parfois en retard sur les nouvelles fonctionnalités',
      'Moins de templates que Zapier ou Make',
    ],
    stats: [
      { label: 'Composants', value: '1 000+' },
      { label: 'Utilisateurs', value: '500k+' },
      { label: 'Stars GitHub', value: '9k+' },
    ],
  },
  activepieces: {
    name: 'Activepieces',
    tagline: 'L\'alternative open-source à Zapier — auto-hébergeable et gratuite',
    description: 'Activepieces est la plateforme d\'automatisation open-source qui monte. Alternative directe à Zapier, elle est auto-hébergeable, gratuite et dispose d\'une interface visuelle intuitive. Parfaite pour les PMEs européennes soucieuses de leur souveraineté des données.',
    affiliateUrl: 'https://www.activepieces.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    border: 'border-violet-200',
    textColor: 'text-violet-700',
    badgeBg: 'bg-violet-100',
    emoji: '🟪',
    commission: 'Programme affilié en développement',
    freeTier: 'Open-source — gratuit en self-hosted',
    difficulty: 'Débutant → Intermédiaire',
    bestFor: ['PMEs', 'Équipes souverainistes data', 'Développeurs', 'Startups EU'],
    pros: [
      'Open-source et 100% auto-hébergeable',
      'Interface visuelle simple proche de Zapier',
      '200+ intégrations disponibles',
      'Pas de limite d\'événements en self-hosted',
      'Conforme RGPD par design',
    ],
    cons: [
      'Moins d\'intégrations que Zapier ou Make',
      'Communauté encore jeune',
      'Nécessite un serveur pour le self-hosting',
    ],
    stats: [
      { label: 'Intégrations', value: '200+' },
      { label: 'Stars GitHub', value: '10k+' },
      { label: 'Contributeurs', value: '150+' },
    ],
  },
  // ── IA ──────────────────────────────────────────────────────────────────────
  openai: {
    name: 'OpenAI',
    tagline: 'L\'IA la plus puissante au monde — GPT-4, DALL-E et Whisper',
    description: 'OpenAI est le leader mondial de l\'intelligence artificielle. Ses modèles GPT-4, GPT-4o et GPT-4 Vision alimentent des milliers d\'applications. Via l\'API OpenAI, tu peux intégrer des capacités IA avancées dans n\'importe quel workflow d\'automatisation.',
    affiliateUrl: 'https://openai.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-gray-700 to-gray-900',
    lightBg: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-700',
    badgeBg: 'bg-gray-100',
    emoji: '🤖',
    commission: 'Pas de programme affilié public',
    freeTier: '5$ de crédits gratuits à l\'inscription',
    difficulty: 'Intermédiaire',
    bestFor: ['Développeurs', 'Agences IA', 'Startups', 'Entreprises'],
    pros: [
      'Modèles les plus performants du marché (GPT-4o)',
      'API robuste et bien documentée',
      'Compatible avec n8n, Make, Zapier natif',
      'Multimodal : texte, image, audio, vision',
      'Fine-tuning disponible pour cas spécifiques',
    ],
    cons: [
      'Coût par token — peut devenir élevé à fort volume',
      'Données envoyées aux serveurs US (sensible RGPD)',
      'Pas de plan gratuit permanent',
    ],
    stats: [
      { label: 'Modèles', value: '20+' },
      { label: 'Utilisateurs API', value: '2M+' },
      { label: 'Tokens contexte', value: '128k' },
    ],
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    tagline: 'L\'IA la plus sûre et la plus précise — Claude 3.5 Sonnet',
    description: 'Anthropic développe Claude, l\'assistant IA le plus précis et le plus sûr du marché. Claude 3.5 Sonnet surpasse GPT-4 sur la plupart des benchmarks de raisonnement et de code. Idéal pour automatiser des tâches complexes nécessitant nuance et précision.',
    affiliateUrl: 'https://www.anthropic.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-orange-400 to-amber-500',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    emoji: '🧠',
    commission: 'Pas de programme affilié public',
    freeTier: 'Plan gratuit limité sur Claude.ai',
    difficulty: 'Intermédiaire',
    bestFor: ['Développeurs', 'Chercheurs', 'Entreprises', 'Agences IA'],
    pros: [
      'Meilleure précision et raisonnement que GPT-4 sur la plupart des tâches',
      'Contexte 200k tokens (le plus long du marché)',
      'Sécurité et éthique IA comme priorité',
      'API intégrée nativement dans n8n et Make',
      'Excellent pour le code, l\'analyse et la rédaction longue',
    ],
    cons: [
      'Pas de génération d\'images',
      'Moins de plugins tiers que OpenAI',
      'Prix similaire à GPT-4',
    ],
    stats: [
      { label: 'Contexte max', value: '200k tokens' },
      { label: 'Modèles', value: '6+' },
      { label: 'Benchmark MMLU', value: '88.7%' },
    ],
  },
  gemini: {
    name: 'Google Gemini',
    tagline: 'L\'IA multimodale de Google — gratuite et intégrée à l\'écosystème Google',
    description: 'Google Gemini est l\'IA multimodale de Google, intégrée nativement dans Google Workspace (Docs, Sheets, Gmail). Gemini Pro est disponible gratuitement et s\'intègre parfaitement avec les workflows Google via Apps Script, n8n et Make.',
    affiliateUrl: 'https://gemini.google.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    emoji: '✨',
    commission: 'Pas de programme affilié',
    freeTier: 'Gemini 1.5 Flash gratuit via API',
    difficulty: 'Débutant → Intermédiaire',
    bestFor: ['Utilisateurs Google Workspace', 'Développeurs', 'Étudiants', 'PMEs'],
    pros: [
      'Intégration native avec Google Docs, Sheets, Gmail',
      'Gemini Flash gratuit via API Google AI Studio',
      'Multimodal : texte, image, vidéo, audio',
      'Excellent pour les workflows Google Workspace',
      'Modèle 1.5 Pro avec 1M tokens de contexte',
    ],
    cons: [
      'Moins précis que Claude sur les tâches complexes',
      'Données traitées par Google',
      'Intégration tiers moins mature qu\'OpenAI',
    ],
    stats: [
      { label: 'Contexte max', value: '1M tokens' },
      { label: 'Intégrations', value: '100+' },
      { label: 'Langues', value: '40+' },
    ],
  },
  mistral: {
    name: 'Mistral AI',
    tagline: 'L\'IA française open-source — performante, économique et souveraine',
    description: 'Mistral AI est la startup française qui révolutionne l\'IA open-source. Ses modèles (Mistral 7B, Mixtral, Mistral Large) offrent un excellent rapport qualité/prix. Hébergés en Europe, conformes RGPD, et disponibles en self-hosted ou via API.',
    affiliateUrl: 'https://mistral.ai/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-indigo-500 to-blue-600',
    lightBg: 'bg-indigo-50',
    border: 'border-indigo-200',
    textColor: 'text-indigo-700',
    badgeBg: 'bg-indigo-100',
    emoji: '🇫🇷',
    commission: 'Pas de programme affilié actuellement',
    freeTier: 'Mistral 7B en open-source',
    difficulty: 'Intermédiaire',
    bestFor: ['Entreprises RGPD', 'Développeurs EU', 'Startups françaises', 'Self-hosters'],
    pros: [
      'Open-source — Mistral 7B téléchargeable gratuitement',
      'Serveurs en Europe — conformité RGPD native',
      'Excellent rapport qualité/prix',
      'Compatible Ollama pour déploiement local',
      'API La Plateforme accessible à tous',
    ],
    cons: [
      'Moins de plugins et intégrations tiers',
      'Plus petit écosystème qu\'OpenAI',
      'Modèles moins puissants que GPT-4 sur les tâches complexes',
    ],
    stats: [
      { label: 'Modèles open-source', value: '5+' },
      { label: 'Valorisation', value: '6Md€' },
      { label: 'Headquarters', value: 'Paris, FR' },
    ],
  },
  // ── PRODUCTIVITÉ ────────────────────────────────────────────────────────────
  notion: {
    name: 'Notion',
    tagline: 'L\'espace de travail tout-en-un — notes, bases de données, IA',
    description: 'Notion est l\'outil de productivité le plus populaire du moment. Combinant notes, bases de données relationnelles, wikis et IA, Notion est devenu le cerveau numérique de millions d\'équipes. Son API permet d\'automatiser presque toutes ses fonctionnalités.',
    affiliateUrl: 'https://affiliate.notion.so/fluxteka',
    color: 'from-gray-800 to-gray-900',
    lightBg: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-700',
    badgeBg: 'bg-gray-100',
    emoji: '📓',
    commission: '50% de commission sur la 1ère année',
    freeTier: 'Plan gratuit complet (pages illimitées)',
    difficulty: 'Débutant',
    bestFor: ['Équipes', 'Freelances', 'Startups', 'Étudiants'],
    pros: [
      'Interface la plus flexible et personnalisable',
      'Bases de données relationnelles intégrées',
      'Notion AI pour rédiger, résumer, analyser',
      'Programme affilié exceptionnel (50%/an)',
      'API complète pour automatisations avancées',
    ],
    cons: [
      'Peut devenir lent avec de nombreuses pages',
      'Courbe d\'apprentissage pour les fonctionnalités avancées',
      'Pas de offline complet',
    ],
    stats: [
      { label: 'Utilisateurs', value: '30M+' },
      { label: 'Intégrations', value: '100+' },
      { label: 'Templates', value: '10 000+' },
    ],
  },
  airtable: {
    name: 'Airtable',
    tagline: 'La base de données no-code la plus puissante pour les équipes',
    description: 'Airtable combine la simplicité d\'un tableur avec la puissance d\'une base de données relationnelle. Idéal pour gérer des workflows, des CRM légers, des pipelines de contenu et des bases de connaissances. Son API permet des automatisations très avancées.',
    affiliateUrl: 'https://airtable.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-yellow-500 to-orange-500',
    lightBg: 'bg-yellow-50',
    border: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeBg: 'bg-yellow-100',
    emoji: '📊',
    commission: 'Programme affilié disponible (20%)',
    freeTier: '1 000 lignes par base — gratuit',
    difficulty: 'Débutant → Intermédiaire',
    bestFor: ['Marketing', 'Opérations', 'PMEs', 'Agences'],
    pros: [
      'Interface intuitive entre tableur et base de données',
      'Vues multiples : kanban, galerie, calendrier, Gantt',
      'Automatisations natives sans code',
      'API complète avec 5 niveaux de permission',
      'Intégration Make, Zapier, n8n native',
    ],
    cons: [
      'Devient cher rapidement avec de gros volumes',
      'Plan gratuit très limité (1 000 lignes)',
      'Moins puissant que de vraies bases SQL pour les cas complexes',
    ],
    stats: [
      { label: 'Utilisateurs', value: '500k+' },
      { label: 'Intégrations', value: '1 000+' },
      { label: 'Templates', value: '5 000+' },
    ],
  },
  clickup: {
    name: 'ClickUp',
    tagline: 'La plateforme de gestion de projet tout-en-un — tâches, docs, objectifs',
    description: 'ClickUp est la plateforme de productivité la plus complète du marché. Elle remplace Jira, Notion, Asana et Monday dans un seul outil. Avec plus de 1 000 intégrations et une API puissante, ClickUp est idéal pour automatiser les workflows d\'équipe.',
    affiliateUrl: 'https://clickup.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-pink-500 to-purple-600',
    lightBg: 'bg-pink-50',
    border: 'border-pink-200',
    textColor: 'text-pink-700',
    badgeBg: 'bg-pink-100',
    emoji: '✅',
    commission: '20% de commission récurrente',
    freeTier: 'Plan gratuit généreux (100MB stockage)',
    difficulty: 'Débutant',
    bestFor: ['Équipes projet', 'Agences', 'Startups', 'PMEs'],
    pros: [
      'Remplace jusqu\'à 10 outils différents',
      'Automatisations natives très puissantes',
      'Plus de 1 000 intégrations',
      'Plan gratuit permanent et généreux',
      'Programme affilié 20% récurrent',
    ],
    cons: [
      'Peut sembler écrasant avec autant de fonctionnalités',
      'Interface parfois lente sur les grands projets',
      'Courbe d\'apprentissage pour exploiter tout le potentiel',
    ],
    stats: [
      { label: 'Utilisateurs', value: '10M+' },
      { label: 'Intégrations', value: '1 000+' },
      { label: 'Automatisations', value: '100+' },
    ],
  },
  monday: {
    name: 'Monday.com',
    tagline: 'Le système de gestion du travail visuel pour les équipes modernes',
    description: 'Monday.com est la plateforme de Work OS (Work Operating System) la plus visuelle du marché. Elle permet de gérer des projets, des CRM, des pipelines RH et des opérations dans un seul outil. Son interface colorée et intuitive facilite l\'adoption en équipe.',
    affiliateUrl: 'https://monday.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-red-500 to-pink-600',
    lightBg: 'bg-red-50',
    border: 'border-red-200',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-100',
    emoji: '📅',
    commission: 'Programme affilié (15%)',
    freeTier: '2 membres — gratuit',
    difficulty: 'Débutant',
    bestFor: ['Équipes marketing', 'RH', 'PMEs', 'Grandes entreprises'],
    pros: [
      'Interface visuelle la plus intuitive du marché',
      'Automatisations no-code natives',
      'Templates par industrie et cas d\'usage',
      'Applications CRM, HR, Dev intégrées',
      'Excellent support client',
    ],
    cons: [
      'Prix élevé (à partir de 9€/membre/mois)',
      'Plan gratuit très limité (2 membres)',
      'Moins flexible que ClickUp pour les cas complexes',
    ],
    stats: [
      { label: 'Utilisateurs', value: '225k+ entreprises' },
      { label: 'Intégrations', value: '200+' },
      { label: 'Automatisations', value: '50+' },
    ],
  },
  // ── COMMUNICATION ────────────────────────────────────────────────────────────
  slack: {
    name: 'Slack',
    tagline: 'La messagerie d\'équipe la plus connectée — 2 600+ intégrations',
    description: 'Slack est la référence mondiale de la messagerie d\'équipe. Avec plus de 2 600 intégrations, Slack est le hub central de la plupart des workflows d\'automatisation : notifications, alertes, approbations, et bien plus. Automatiser Slack = automatiser la communication d\'équipe.',
    affiliateUrl: 'https://slack.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-purple-600 to-indigo-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-100',
    emoji: '💬',
    commission: 'Pas de programme affilié public',
    freeTier: '90 jours d\'historique — gratuit',
    difficulty: 'Débutant',
    bestFor: ['Équipes', 'Startups', 'Entreprises', 'Remote workers'],
    pros: [
      '2 600+ intégrations — le plus connecté du marché',
      'Workflows d\'automatisation natifs (no-code)',
      'Bots et slash commands personnalisables',
      'API robuste pour notifications automatiques',
      'Huddels vidéo et audio intégrés',
    ],
    cons: [
      'Plan gratuit : 90 jours d\'historique seulement',
      'Prix élevé en équipe (7,25$/mois/utilisateur)',
      'Peut devenir une source de distraction',
    ],
    stats: [
      { label: 'Utilisateurs actifs', value: '32M+' },
      { label: 'Intégrations', value: '2 600+' },
      { label: 'Messages/jour', value: '1,5Md+' },
    ],
  },
  // ── MARKETING ────────────────────────────────────────────────────────────────
  mailchimp: {
    name: 'Mailchimp',
    tagline: 'La plateforme d\'email marketing la plus utilisée au monde',
    description: 'Mailchimp est la référence mondiale de l\'email marketing. Avec des fonctionnalités de segmentation avancées, d\'A/B testing, d\'automation et de CRM léger, Mailchimp est l\'outil idéal pour automatiser ses campagnes email. Connectez-le à n8n, Make ou Zapier pour des workflows marketing puissants.',
    affiliateUrl: 'https://mailchimp.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-yellow-400 to-amber-500',
    lightBg: 'bg-yellow-50',
    border: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeBg: 'bg-yellow-100',
    emoji: '🐒',
    commission: 'Pas de programme affilié public',
    freeTier: '500 contacts — gratuit',
    difficulty: 'Débutant',
    bestFor: ['PMEs', 'E-commerce', 'Marketing', 'Blogueurs'],
    pros: [
      'Interface la plus intuitive pour l\'email marketing',
      '500 contacts gratuits avec envois illimités',
      'Templates d\'emails professionnels',
      'Automations email avancées (séquences, triggers)',
      'Intégration native avec 300+ outils',
    ],
    cons: [
      'Prix augmente vite avec la liste',
      'Délivrabilité moins bonne qu\'ActiveCampaign ou Brevo',
      'Fonctionnalités d\'automation limitées sur plan gratuit',
    ],
    stats: [
      { label: 'Utilisateurs', value: '13M+' },
      { label: 'Emails/mois', value: '1,5Md+' },
      { label: 'Intégrations', value: '300+' },
    ],
  },
  brevo: {
    name: 'Brevo (ex-Sendinblue)',
    tagline: 'La plateforme marketing française — email, SMS, CRM et automatisation',
    description: 'Brevo (ex-Sendinblue) est la plateforme marketing tout-en-un française. Email marketing, SMS, CRM, landing pages et automation dans un seul outil. Hébergée en Europe, conforme RGPD, et avec des tarifs bien plus compétitifs que Mailchimp. Le choix n°1 des PMEs françaises.',
    affiliateUrl: 'https://www.brevo.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-teal-500 to-cyan-600',
    lightBg: 'bg-teal-50',
    border: 'border-teal-200',
    textColor: 'text-teal-700',
    badgeBg: 'bg-teal-100',
    emoji: '📨',
    commission: 'Programme partenaire disponible',
    freeTier: '300 emails/jour gratuits (liste illimitée)',
    difficulty: 'Débutant',
    bestFor: ['PMEs françaises', 'E-commerce', 'Agences', 'B2B'],
    pros: [
      'Contacts illimités sur tous les plans (y compris gratuit)',
      'Hébergé en Europe — conformité RGPD native',
      'Prix bien inférieurs à Mailchimp',
      'SMS marketing intégré',
      'CRM léger inclus',
    ],
    cons: [
      'Limite de 300 emails/jour sur le plan gratuit',
      'Interface moins moderne que Mailchimp',
      'Templates moins nombreux',
    ],
    stats: [
      { label: 'Utilisateurs', value: '500k+' },
      { label: 'Emails/mois', value: '30Md+' },
      { label: 'Pays', value: '180+' },
    ],
  },
};

type PlatformSlug = keyof typeof PLATFORMS;

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const platform = PLATFORMS[slug as PlatformSlug];
  if (!platform) return { title: 'Plateforme non trouvée — Fluxteka' };
  return {
    title: `Workflows ${platform.name} — Fluxteka`,
    description: platform.description,
  };
}

export function generateStaticParams() {
  return Object.keys(PLATFORMS).map((slug) => ({ slug }));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = PLATFORMS[slug as PlatformSlug];
  if (!platform) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={`relative overflow-hidden ${platform.lightBg} border-b ${platform.border}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br ${platform.color} opacity-10 blur-3xl`} />
          <div className={`absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr ${platform.color} opacity-10 blur-3xl`} />
        </div>

        <div className="container-page relative py-12 md:py-20">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary-600">Accueil</Link>
            <span>›</span>
            <Link href="/recherche" className="hover:text-primary-600">Plateformes</Link>
            <span>›</span>
            <span className={platform.textColor}>{platform.name}</span>
          </nav>

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              {/* Badge */}
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${platform.badgeBg} ${platform.textColor} ${platform.border}`}>
                <span className="text-lg">{platform.emoji}</span>
                {platform.name}
              </span>

              <h1 className="mt-4 font-heading text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
                Workflows {platform.name}
              </h1>
              <p className="mt-3 text-lg text-text-secondary leading-relaxed">
                {platform.tagline}
              </p>

              {/* Quick stats */}
              <div className="mt-6 flex flex-wrap gap-4">
                {platform.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className={`text-2xl font-bold font-heading ${platform.textColor}`}>{stat.value}</span>
                    <span className="text-xs text-text-secondary">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="w-full rounded-2xl border bg-white p-6 shadow-lg md:w-80">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${platform.badgeBg}`}>
                  {platform.emoji}
                </div>
                <div>
                  <div className="font-heading font-semibold text-text-primary">{platform.name}</div>
                  <div className="text-xs text-text-secondary">{platform.freeTier}</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary-500" />
                  <span className="text-text-secondary">Difficulté : <span className="font-medium text-text-primary">{platform.difficulty}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-text-secondary">Idéal pour : <span className="font-medium text-text-primary">{platform.bestFor.slice(0, 2).join(', ')}</span></span>
                </div>
              </div>
              <a
                href={platform.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${platform.color} px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]`}
              >
                <ExternalLink className="h-4 w-4" />
                Essayer {platform.name}
              </a>
              {platform.commission !== 'Pas de programme affilié public' && platform.commission !== 'Pas de programme affilié' && (
                <p className="mt-2 text-center text-xs text-text-secondary">
                  🤝 Lien partenaire — commission : {platform.commission}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pros & Cons ──────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container-page">
          <h2 className="text-2xl font-heading font-bold text-text-primary text-center mb-10">
            Pourquoi choisir {platform.name} ?
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pros */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="font-heading font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                <span>✅</span> Points forts
              </h3>
              <ul className="space-y-3">
                {platform.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm text-emerald-900">
                    <span className="mt-0.5 text-emerald-500 flex-shrink-0">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            {/* Cons */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-heading font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <span>⚠️</span> Points à considérer
              </h3>
              <ul className="space-y-3">
                {platform.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="mt-0.5 text-amber-500 flex-shrink-0">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best for */}
          <div className={`mt-8 rounded-2xl border ${platform.border} ${platform.lightBg} p-6`}>
            <h3 className={`font-heading font-semibold ${platform.textColor} mb-4 flex items-center gap-2`}>
              <Users className="h-5 w-5" />
              {platform.name} est fait pour toi si tu es…
            </h3>
            <div className="flex flex-wrap gap-2">
              {platform.bestFor.map((profile) => (
                <span key={profile} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${platform.badgeBg} ${platform.textColor} ${platform.border}`}>
                  {profile}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Explore workflows ────────────────────────────────── */}
      <section className="border-t border-border bg-gray-50 py-12 md:py-16">
        <div className="container-page text-center">
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Explorer les workflows {platform.name}
          </h2>
          <p className="mt-2 text-text-secondary">
            Découvre les meilleures recettes d&apos;automatisation indexées par Fluxteka
          </p>
          <Link
            href={`/recherche?tool=${slug}`}
            className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${platform.color} px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]`}
          >
            Voir tous les workflows {platform.name}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* All platforms */}
          <div className="mt-12">
            <p className="text-sm text-text-secondary mb-4">Comparer avec d&apos;autres plateformes</p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(PLATFORMS).filter(([s]) => s !== slug).map(([s, p]) => (
                <Link
                  key={s}
                  href={`/plateforme/${s}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-primary-300 hover:text-primary-600 hover:shadow-sm"
                >
                  <span>{p.emoji}</span>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Security / RGPD ──────────────────────────────────── */}
      <section className="py-10 border-t border-border">
        <div className="container-page flex flex-col items-center gap-2 text-center">
          <Shield className="h-6 w-6 text-primary-400" />
          <p className="text-sm text-text-secondary max-w-lg">
            Fluxteka est une bibliothèque européenne indépendante. Nos liens partenaires nous permettent de maintenir ce service <strong>100% gratuit</strong> pour les utilisateurs.
          </p>
        </div>
      </section>
    </div>
  );
}
