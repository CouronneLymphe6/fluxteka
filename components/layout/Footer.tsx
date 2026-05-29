'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useTranslations, useLocale } from 'next-intl';

// Removed static footerLinks and legalLinks to move them inside the component

function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;

  const switchLocale = (locale: Locale) => {
    if (locale === currentLocale) return;
    router.push(pathname, { locale });
  };

  return (
    <div className="mt-4 flex items-center gap-3" aria-label="Sélecteur de langue">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;
        return (
          <button
            key={locale}
            onClick={() => switchLocale(locale)}
            disabled={isActive}
            title={isActive ? localeNames[locale] : `${localeNames[locale]} — Changer de langue`}
            className={`text-xl transition-all duration-200 ${
              isActive
                ? 'cursor-default scale-110'
                : 'opacity-50 grayscale cursor-pointer hover:opacity-100 hover:grayscale-0 hover:scale-110'
            }`}
            aria-label={`Changer la langue en ${localeNames[locale]}`}
            aria-current={isActive ? 'true' : undefined}
          >
            {localeFlags[locale]}
          </button>
        );
      })}
    </div>
  );
}

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  
  const footerLinks = [
    { href: '/recherche', label: tNav('search') },
    { href: '/partenaires', label: tNav('partners') },
    { href: '/premium', label: tNav('premium') },
    { href: '/mission', label: tNav('mission') },
    { href: '/soumettre', label: tNav('submit') },
  ];

  const legalLinks = [
    { href: '/legal/confidentialite', label: t('privacy') },
    { href: '/legal/cgu', label: t('terms') },
    { href: '/legal/mentions-legales', label: t('legalNotices') },
    { href: 'mailto:contact@fluxteka.com', label: t('contact') },
  ];

  return (
    <>
      {/* ── Separator wave between content and footer ── */}
      <div className="h-16 bg-gradient-to-b from-gray-50 to-white" aria-hidden="true" />

      <footer className="border-t border-border bg-white">
        <div className="container-page pt-10 pb-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 font-heading font-bold tracking-tight">
                <svg width="30" height="30" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="34" height="34" rx="8" fill="#4338CA"/>
                  <rect x="9" y="8" width="4" height="18" rx="1.5" fill="white"/>
                  <rect x="9" y="8" width="14" height="4" rx="1.5" fill="white"/>
                  <rect x="9" y="15" width="11" height="3.5" rx="1.5" fill="white"/>
                  <polygon points="9,26 13,26 9,22" fill="#4338CA"/>
                </svg>
                <span><span className="text-[#4338CA]">Flux</span><span className="text-[#374151] font-normal">teka</span></span>
              </Link>
              <p className="mt-3 max-w-sm text-sm text-text-secondary leading-relaxed">
                {t('description')}
              </p>

              {/* Language switcher — now functional */}
              <LanguageSwitcher />
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">
                {t('navigation')}
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-primary-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">
                {t('legal')}
              </h3>
              <ul className="space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-primary-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
            <p className="text-xs text-text-secondary">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-text-secondary">
              {t('madeWith')}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
