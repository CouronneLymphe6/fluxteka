// i18n configuration for Fluxteka
// Supported European locales with French as default

export const locales = ['fr', 'en', 'es', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

// Locale labels for the language switcher
export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
};

// Localized route slugs per locale
// French routes stay the same; other locales use translated path segments
export const localizedRoutes: Record<Locale, Record<string, string>> = {
  fr: {
    recherche: 'recherche',
    connexion: 'connexion',
    inscription: 'inscription',
    compte: 'compte',
    soumettre: 'soumettre',
    carte: 'carte',
    partenaires: 'partenaires',
    premium: 'premium',
    mission: 'mission',
    plateforme: 'plateforme',
    workflow: 'workflow',
  },
  en: {
    recherche: 'search',
    connexion: 'login',
    inscription: 'signup',
    compte: 'account',
    soumettre: 'submit',
    carte: 'map',
    partenaires: 'partners',
    premium: 'premium',
    mission: 'mission',
    plateforme: 'platform',
    workflow: 'workflow',
  },
  es: {
    recherche: 'buscar',
    connexion: 'iniciar-sesion',
    inscription: 'registro',
    compte: 'cuenta',
    soumettre: 'enviar',
    carte: 'mapa',
    partenaires: 'socios',
    premium: 'premium',
    mission: 'mision',
    plateforme: 'plataforma',
    workflow: 'workflow',
  },
  de: {
    recherche: 'suche',
    connexion: 'anmelden',
    inscription: 'registrieren',
    compte: 'konto',
    soumettre: 'einreichen',
    carte: 'karte',
    partenaires: 'partner',
    premium: 'premium',
    mission: 'auftrag',
    plateforme: 'plattform',
    workflow: 'workflow',
  },
};
