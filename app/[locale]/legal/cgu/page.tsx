import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation — Fluxteka',
  description: 'Les conditions générales d\'utilisation de Fluxteka, bibliothèque européenne de l\'automatisation et de l\'IA.',
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="container-page py-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 mb-4">
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Shield className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-text-primary">Conditions Générales d&apos;Utilisation</h1>
              <p className="text-sm text-text-secondary">Dernière mise à jour : mai 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 shadow-sm space-y-8">

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">1. Objet</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>Fluxteka</strong> (ci-après &quot;la Plateforme&quot;), bibliothèque européenne de workflows d&apos;automatisation et d&apos;intelligence artificielle, accessible à l&apos;adresse fluxteka.com.
            </p>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              En accédant à la Plateforme, vous acceptez sans réserve les présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous devez cesser d&apos;utiliser la Plateforme.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">2. Description du service</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Fluxteka est une bibliothèque en ligne permettant aux utilisateurs de :
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Consulter des workflows d&apos;automatisation (N8N, Make, Zapier, LangChain, etc.)</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Sauvegarder des workflows dans leur espace personnel</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Soumettre leurs propres workflows à la communauté</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span> Laisser des avis et noter les workflows</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">3. Accès au service</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              L&apos;accès à la Plateforme est gratuit pour la consultation. Certaines fonctionnalités (sauvegarde, soumission) nécessitent la création d&apos;un compte via authentification par lien magique ou OAuth (Google, GitHub).
            </p>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Fluxteka se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment, sans préavis, notamment pour des raisons de maintenance ou d&apos;évolution technique.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">4. Contenu et propriété intellectuelle</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Les workflows indexés sur Fluxteka proviennent de sources publiques (communautés N8N, Make, Zapier). Fluxteka respecte les licences de chaque workflow et redirige vers la source originale. Toute demande de retrait peut être adressée à contact@fluxteka.com.
            </p>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Le design, le code source, la marque et les contenus éditoriaux de Fluxteka sont protégés par le droit de la propriété intellectuelle et appartiennent à leurs auteurs respectifs.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">5. Responsabilités</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Fluxteka met à disposition une bibliothèque de référence à titre informatif. L&apos;utilisation des workflows est sous la responsabilité exclusive de l&apos;utilisateur. Fluxteka ne garantit pas l&apos;exactitude, la complétude ou la compatibilité des workflows avec votre environnement technique.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">6. Comportement des utilisateurs</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Il est interdit d&apos;utiliser la Plateforme pour :
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><span className="text-danger-500 mt-0.5">•</span> Soumettre du contenu illégal, frauduleux ou malveillant</li>
              <li className="flex items-start gap-2"><span className="text-danger-500 mt-0.5">•</span> Scraper ou reproduire massivement le contenu sans autorisation</li>
              <li className="flex items-start gap-2"><span className="text-danger-500 mt-0.5">•</span> Usurper l&apos;identité d&apos;un autre utilisateur</li>
              <li className="flex items-start gap-2"><span className="text-danger-500 mt-0.5">•</span> Tenter de compromettre la sécurité de la Plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">7. Données personnelles</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Le traitement de vos données personnelles est décrit dans notre{' '}
              <Link href="/legal/confidentialite" className="text-primary-600 hover:underline">Politique de confidentialité</Link>.
              Conformément au RGPD, vous disposez de droits d&apos;accès, de rectification, de portabilité et de suppression de vos données.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">8. Droit applicable</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Les présentes CGU sont régies par le droit français. En cas de litige, les parties s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux compétents de Paris seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">9. Contact</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Pour toute question relative aux présentes CGU : <a href="mailto:contact@fluxteka.com" className="text-primary-600 hover:underline">contact@fluxteka.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
