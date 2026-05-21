import Link from 'next/link';

const footerLinks = [
  { href: '/recherche', label: 'Explorer' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/premium', label: 'Premium' },
  { href: '/mission', label: 'Notre mission' },
  { href: '/soumettre', label: 'Soumettre' },
];

const legalLinks = [
  { href: '/legal/confidentialite', label: 'Politique de confidentialité' },
  { href: '/legal/cgu', label: 'CGU' },
  { href: '/legal/mentions-legales', label: 'Mentions légales' },
  { href: 'mailto:contact@fluxteka.com', label: 'Contact' },
];

const languages = [
  { flag: '🇫🇷', label: 'Français', active: true },
  { flag: '🇪🇸', label: 'Español', active: false },
  { flag: '🇩🇪', label: 'Deutsch', active: false },
  { flag: '🇮🇹', label: 'Italiano', active: false },
];

export default function Footer() {
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
                La bibliothèque européenne de l&apos;automatisation et de l&apos;IA. Trouvez et appliquez des workflows N8N, Make, Zapier et LangChain.
              </p>

              {/* Language flags */}
              <div className="mt-4 flex items-center gap-3">
                {languages.map((lang) => (
                  <span
                    key={lang.label}
                    className={`text-xl transition-all ${
                      lang.active
                        ? 'cursor-default'
                        : 'opacity-40 grayscale cursor-not-allowed'
                    }`}
                    title={lang.active ? lang.label : `${lang.label} — Bientôt disponible`}
                  >
                    {lang.flag}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">
                Navigation
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
                Légal
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
              © {new Date().getFullYear()} Fluxteka. Tous droits réservés.
            </p>
            <p className="text-xs text-text-secondary">
              Fait avec ❤️ en Europe
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
