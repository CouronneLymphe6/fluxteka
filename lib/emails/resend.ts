/**
 * Resend Email Templates — Fluxteka
 *
 * Emails transactionnels : bienvenue, notification workflow approuvé, export données.
 * Utilise l'API Resend (pas React Email pour rester léger au MVP).
 */

import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not configured');
    resendClient = new Resend(key);
  }
  return resendClient;
}

const FROM = 'Fluxteka <noreply@fluxteka.com>';

// ── Email de bienvenue ──
export async function sendWelcomeEmail(to: string, name: string) {
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Bienvenue sur Fluxteka 📚⚡',
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px;">📚⚡</span>
        </div>
        <h1 style="font-size: 22px; color: #1a1a2e; text-align: center; margin-bottom: 8px;">
          Bienvenue ${name} !
        </h1>
        <p style="font-size: 14px; color: #64748b; text-align: center; line-height: 1.6;">
          Ton compte Fluxteka est prêt. Explore 24 000+ workflows d'automatisation gratuitement.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://fluxteka.com/recherche"
            style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Explorer les workflows
          </a>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-top: 20px;">
          <p style="font-size: 13px; color: #64748b; margin: 0;">
            💡 <strong>Astuce :</strong> Sauvegarde tes workflows favoris pour les retrouver dans ton espace <a href="https://fluxteka.com/compte/sauvegardes" style="color: #6366f1;">Mon Compte</a>.
          </p>
        </div>
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 28px;">
          Tu reçois cet email car tu as créé un compte sur <a href="https://fluxteka.com" style="color: #6366f1;">Fluxteka</a>.<br/>
          <a href="https://fluxteka.com/compte/donnees" style="color: #6366f1;">Gérer mes données</a>
        </p>
      </div>
    `,
  });
}

// ── Notification : workflow approuvé ──
export async function sendWorkflowApprovedEmail(to: string, name: string, workflowTitle: string, workflowSlug: string) {
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Ton workflow "${workflowTitle}" a été approuvé ✅`,
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px;">✅</span>
        </div>
        <h1 style="font-size: 20px; color: #1a1a2e; text-align: center; margin-bottom: 8px;">
          Workflow approuvé !
        </h1>
        <p style="font-size: 14px; color: #64748b; text-align: center; line-height: 1.6;">
          ${name}, ton workflow <strong>"${workflowTitle}"</strong> est maintenant visible par toute la communauté.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://fluxteka.com/workflow/${workflowSlug}"
            style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Voir mon workflow
          </a>
        </div>
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 28px;">
          <a href="https://fluxteka.com/compte/donnees" style="color: #6366f1;">Gérer mes données</a>
        </p>
      </div>
    `,
  });
}

// ── Notification : export de données RGPD ──
export async function sendDataExportEmail(to: string, name: string, downloadUrl: string) {
  const resend = getResend();

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Export de tes données — Fluxteka',
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="font-size: 20px; color: #1a1a2e; text-align: center; margin-bottom: 8px;">
          📦 Tes données sont prêtes
        </h1>
        <p style="font-size: 14px; color: #64748b; text-align: center; line-height: 1.6;">
          ${name}, voici l'export de toutes tes données personnelles Fluxteka au format JSON.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${downloadUrl}"
            style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Télécharger l'export
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          ⚠️ Ce lien expire dans 24 heures pour des raisons de sécurité.
        </p>
      </div>
    `,
  });
}
