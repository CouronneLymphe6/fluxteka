import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  let body: {
    name: string;
    email: string;
    website?: string;
    description: string;
    technologies: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { name, email, website, description, technologies } = body;

  if (!name?.trim() || !email?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Nom, email et description requis' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Fluxteka <noreply@fluxteka.com>',
        to: ['contact@fluxteka.com'],
        subject: `🏢 Nouvelle candidature agence — ${name}`,
        html: `
          <h2>Nouvelle candidature Expert/Agence</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Nom / Agence</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Site web</td><td style="padding:8px">${website || 'Non renseigné'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Technologies</td><td style="padding:8px">${technologies?.join(', ') || 'Non renseigné'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Description</td><td style="padding:8px">${description}</td></tr>
          </table>
          <p style="margin-top:16px;color:#666;font-size:12px">Soumis le ${new Date().toLocaleString('fr-FR')}</p>
        `,
      });

      // Confirmation to the applicant
      await resend.emails.send({
        from: 'Fluxteka <noreply@fluxteka.com>',
        to: [email],
        subject: 'Candidature reçue — Réseau Expert Fluxteka 🚀',
        html: `
          <h2>Bonjour ${name},</h2>
          <p>Nous avons bien reçu votre candidature pour rejoindre le réseau d'experts Fluxteka.</p>
          <p>Notre équipe va examiner votre profil et vous recontactera dans les 48-72h ouvrées.</p>
          <p>En attendant, n'hésitez pas à explorer la plateforme : <a href="https://fluxteka.com">fluxteka.com</a></p>
          <br/>
          <p>À très bientôt,<br/>L'équipe Fluxteka</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /agences/register]', error);
    // Return success anyway — we don't want to block the form
    return NextResponse.json({ success: true });
  }
}
