import { redirect } from '@/i18n/navigation';

// L'inscription et la connexion sont fusionnées en un seul flux sans friction.
// On redirige vers /connexion qui gère les deux cas (OAuth + Magic Link).
export default function InscriptionRedirect() {
  redirect('/connexion');
}
