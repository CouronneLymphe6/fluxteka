import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Politique de confidentialité — Fluxteka',
  description: 'Comment Fluxteka collecte, utilise et protège vos données personnelles, conformément au RGPD.',
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container-page py-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 mb-4">
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Lock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-text-primary">Politique de confidentialité</h1>
              <p className="text-sm text-text-secondary">Dernière mise à jour : mai 2026 — Conforme RGPD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 shadow-sm space-y-8">

          {/* Intro RGPD */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 leading-relaxed">
            🇪🇺 Fluxteka est une entreprise européenne. Nous respectons le Règlement Général sur la Protection des Données (RGPD — Règlement EU 2016/679). Vos données ne sont jamais vendues à des tiers.
          </div>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">1. Responsable du traitement</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Le responsable du traitement des données est <strong>Fluxteka</strong>, joignable à l&apos;adresse : <a href="mailto:contact@fluxteka.com" className="text-primary-600 hover:underline">contact@fluxteka.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">2. Données collectées</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Données de compte (si vous créez un compte)</h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Adresse email (obligatoire)</li>
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Nom / pseudo (facultatif)</li>
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Bio, URL GitHub, site web (facultatifs)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Données d&apos;utilisation</h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Workflows sauvegardés</li>
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Avis et notes soumis</li>
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Workflows soumis à la bibliothèque</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Données techniques (automatiques)</h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Adresse IP (anonymisée)</li>
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Type de navigateur et appareil</li>
                  <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Pages visitées et durée (analytics agrégés)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">3. Finalités et bases légales</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary border border-border">Finalité</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary border border-border">Base légale</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr>
                    <td className="px-3 py-2 border border-border">Gestion du compte utilisateur</td>
                    <td className="px-3 py-2 border border-border">Exécution du contrat</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 border border-border">Amélioration du service</td>
                    <td className="px-3 py-2 border border-border">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-border">Analytics agrégés</td>
                    <td className="px-3 py-2 border border-border">Intérêt légitime</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 border border-border">Cookies non-essentiels</td>
                    <td className="px-3 py-2 border border-border">Consentement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">4. Conservation des données</h2>
            <ul className="space-y-1.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Données de compte : conservées jusqu&apos;à suppression du compte</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Données d&apos;utilisation : 24 mois glissants</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Logs techniques : 30 jours</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">5. Partage des données</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Nous ne vendons jamais vos données. Vos données peuvent être partagées avec nos sous-traitants techniques uniquement :
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> <strong>Supabase</strong> — authentification et base de données (EU)</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> <strong>Vercel</strong> — hébergement (US, clause contractuelles types)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">6. Vos droits RGPD</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Conformément au RGPD, vous disposez des droits suivants que vous pouvez exercer depuis votre espace{' '}
              <Link href="/compte/donnees" className="text-primary-600 hover:underline">Mon compte → Mes données</Link> ou par email à <a href="mailto:contact@fluxteka.com" className="text-primary-600 hover:underline">contact@fluxteka.com</a> :
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { right: '📋 Accès', desc: 'Obtenir une copie de vos données' },
                { right: '✏️ Rectification', desc: 'Corriger des données inexactes' },
                { right: '🗑️ Suppression', desc: 'Effacer votre compte et données' },
                { right: '📦 Portabilité', desc: 'Exporter vos données en JSON' },
                { right: '🚫 Opposition', desc: 'Vous opposer à certains traitements' },
                { right: '⏸️ Limitation', desc: 'Limiter le traitement de vos données' },
              ].map(({ right, desc }) => (
                <div key={right} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-text-primary">{right}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">7. Cookies</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Fluxteka utilise des cookies essentiels au fonctionnement du service (session d&apos;authentification). Des cookies analytiques peuvent être utilisés avec votre consentement explicite, géré via la bannière de cookies.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">8. Sécurité</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Vos données sont protégées par des mesures techniques appropriées : chiffrement HTTPS, authentification sécurisée via Supabase, accès restreint aux données sensibles par rôle.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">9. Modifications</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Nous nous réservons le droit de modifier cette politique. En cas de modification substantielle, vous serez informé par email. La date de dernière mise à jour est indiquée en en-tête.
            </p>
          </section>

          <div className="rounded-xl bg-gray-50 border border-border p-4 text-center">
            <p className="text-sm text-text-secondary">
              Questions ? Contactez-nous à{' '}
              <a href="mailto:contact@fluxteka.com" className="text-primary-600 hover:underline font-medium">contact@fluxteka.com</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
