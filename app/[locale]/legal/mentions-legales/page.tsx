import Link from 'next/link';
import { FileText, ArrowLeft, Mail } from 'lucide-react';

export const metadata = {
  title: 'Mentions légales — Fluxteka',
  description: 'Mentions légales de Fluxteka, bibliothèque européenne de l\'automatisation et de l\'IA.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-border bg-white">
        <div className="container-page py-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 mb-4">
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-text-primary">Mentions légales</h1>
              <p className="text-sm text-text-secondary">Conformément à la loi n°2004-575 du 21 juin 2004</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 shadow-sm space-y-8">

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Éditeur du site</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="font-medium text-text-primary">Société</dt>
              <dd className="text-text-secondary">Fluxteka</dd>
              <dt className="font-medium text-text-primary">Email</dt>
              <dd className="text-text-secondary">
                <a href="mailto:contact@fluxteka.com" className="text-primary-600 hover:underline flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> contact@fluxteka.com
                </a>
              </dd>
              <dt className="font-medium text-text-primary">Directeur publication</dt>
              <dd className="text-text-secondary">Équipe Fluxteka</dd>
            </dl>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Hébergement</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="font-medium text-text-primary">Hébergeur</dt>
              <dd className="text-text-secondary">Vercel Inc.</dd>
              <dt className="font-medium text-text-primary">Adresse</dt>
              <dd className="text-text-secondary">340 Pine Street, Suite 701 — San Francisco, CA 94104, USA</dd>
              <dt className="font-medium text-text-primary">Site</dt>
              <dd className="text-text-secondary">
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">vercel.com</a>
              </dd>
            </dl>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Propriété intellectuelle</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              L&apos;ensemble du contenu éditorial, du design, des composants logiciels et de la marque Fluxteka sont protégés par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable écrite de l&apos;éditeur.
            </p>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Les workflows indexés sur la plateforme proviennent de sources publiques et communautaires. Fluxteka respecte les licences associées et redirige vers les sources originales. Pour toute demande de retrait : <a href="mailto:contact@fluxteka.com" className="text-primary-600 hover:underline">contact@fluxteka.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Données personnelles</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Le traitement de vos données personnelles est décrit dans notre{' '}
              <Link href="/legal/confidentialite" className="text-primary-600 hover:underline">Politique de confidentialité</Link>.
              Conformément au RGPD, vous pouvez exercer vos droits à : <a href="mailto:contact@fluxteka.com" className="text-primary-600 hover:underline">contact@fluxteka.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Cookies</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Fluxteka utilise des cookies strictement nécessaires au fonctionnement du service (session). Des cookies analytiques peuvent être activés avec votre consentement. Pour en savoir plus, consultez notre politique de cookies intégrée à la{' '}
              <Link href="/legal/confidentialite" className="text-primary-600 hover:underline">Politique de confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Limitation de responsabilité</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Fluxteka s&apos;efforce de maintenir la Plateforme accessible et à jour. Cependant, nous ne pouvons garantir l&apos;exactitude ou l&apos;exhaustivité des informations publiées. L&apos;utilisation des workflows est sous la responsabilité de l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Droit applicable</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Les présentes mentions légales sont soumises au droit français. Les tribunaux de Paris sont compétents pour tout litige.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
