import { db } from './db';
import { usuarios, magicLinkTokens } from './db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import pkg from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Acceder correctamente a sign/verify desde el paquete CJS
const { sign, verify } = pkg;

export async function createMagicLink(email: string, nombre: string, origin: string) {
    const resend = new Resend(env.RESEND_API_KEY);
    console.log('Iniciando creación de Magic Link para:', email);

    // Verificar si el usuario existe, si no, crear
    let user = await db.select().from(usuarios).where(eq(usuarios.email, email)).get();
    console.log('Usuario encontrado:', user);

    if (!user) {
        console.log('Creando nuevo usuario...');
        const newUser = await db
            .insert(usuarios)
            .values({
                email,
                nombre,
                rol: 'PUBLICO',
                activo: true
            })
            .returning()
            .get();
        user = newUser;
        console.log('Nuevo usuario creado:', user);
    }

    if (!user) throw new Error('No se pudo crear el usuario');

    // Generar un token único
    const token = randomBytes(32).toString('hex');
    const tokenHash = token;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    console.log('Insertando token en DB...');
    await db.insert(magicLinkTokens).values({
        tokenHash,
        userId: user.id,
        expiresAt
    });

    const magicUrl = `${origin}/auth/callback?token=${token}`;
    console.log('Enviando email vía Resend a:', email);

    // Enviar correo con Resend
    const resendResult = await resend.emails.send({
        from: 'Plataforma Idea <onboarding@resend.dev>',
        to: email,
        subject: 'Tu enlace de acceso a la Plataforma',
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
			<h2>Hola ${user.nombre},</h2>
			<p>Haz clic en el siguiente enlace para acceder a la plataforma:</p>
			<a href="${magicUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">Acceder a la Plataforma</a>
			<p style="color: #64748b; font-size: 14px;">Este enlace expirará en 15 minutos.</p>
			<p style="color: #94a3b8; font-size: 12px;">Si no solicitaste este acceso, ignora este correo.</p>
		</div>`
    });

    if (resendResult.error) {
        console.error('Error de Resend:', JSON.stringify(resendResult.error));
        throw new Error(`Error de email: ${resendResult.error.message}`);
    }

    console.log('Magic Link enviado exitosamente. ID:', resendResult.data?.id);
    return true;
}

export async function verifyTokenAndGetSession(token: string) {
    const result = await db
        .select({ token: magicLinkTokens, user: usuarios })
        .from(magicLinkTokens)
        .innerJoin(usuarios, eq(magicLinkTokens.userId, usuarios.id))
        .where(eq(magicLinkTokens.tokenHash, token))
        .get();

    if (!result) return null;

    const { token: dbToken, user } = result;

    // Verificar expiración
    if (dbToken.expiresAt < new Date()) {
        return null;
    }

    // Verificar si ya se usó
    if (dbToken.usedAt) {
        return null;
    }

    // Marcar como usado
    await db
        .update(magicLinkTokens)
        .set({ usedAt: new Date() })
        .where(eq(magicLinkTokens.id, dbToken.id));

    // Generar JWT
    const sessionToken = sign(
        { userId: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
        env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return sessionToken;
}

export function authGuard(cookies: any) {
    const token = cookies.get('session');
    if (!token) return null;

    try {
        return verify(token, env.JWT_SECRET) as any;
    } catch {
        return null;
    }
}
