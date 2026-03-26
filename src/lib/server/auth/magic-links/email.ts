import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import type { MagicLinkResult } from './types';

/** Construir el HTML del email de Magic Link */
export function buildMagicLinkEmailHtml(nombre: string, magicUrl: string): string {
	return `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; border-radius: 12px; overflow: hidden;">
		<div style="background: #075E54; padding: 28px 24px; text-align: center;">
			<h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em;">MytilusData</h1>
			<p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Mitilicultura</p>
		</div>
		<div style="padding: 32px 24px;">
			<h2 style="color: #111B21; margin: 0 0 8px; font-size: 18px; font-weight: 600;">Hola ${nombre},</h2>
			<p style="color: #54656F; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Haz clic en el siguiente botón para acceder a la plataforma de forma segura:</p>
			<a href="${magicUrl}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.01em;">Acceder a la Plataforma</a>
			<p style="color: #8696A0; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">Este enlace expirará en 15 minutos.</p>
			<p style="color: #8696A0; font-size: 12px; margin: 8px 0 0;">Si no solicitaste este acceso, puedes ignorar este correo.</p>
		</div>
		<div style="border-top: 1px solid #E9EDEF; padding: 16px 24px; text-align: center;">
			<p style="color: #8696A0; font-size: 11px; margin: 0;">© 2026 MytilusData · Mitilicultura</p>
		</div>
	</div>`;
}

/**
 * Enviar email de Magic Link usando Resend.
 */
export async function sendMagicLinkEmail(
	email: string,
	nombre: string,
	magicUrl: string
): Promise<MagicLinkResult> {
	const resend = new Resend(env.RESEND_API_KEY);
	
	const result = await resend.emails.send({
		from: env.EMAIL_FROM || 'MytilusData <onboarding@resend.dev>',
		to: email,
		subject: 'Tu enlace de acceso a la Plataforma',
		html: buildMagicLinkEmailHtml(nombre, magicUrl)
	});

	if (result.error) {
		console.error('Error de Resend:', JSON.stringify(result.error));
		return { 
			success: false, 
			error: `Error de email: ${result.error.message}`, 
			status: 500 
		};
	}

	return { success: true };
}