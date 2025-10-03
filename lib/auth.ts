import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Clave secreta para JWT (en producción usar variable de entorno segura)
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_desarrollo_cambiar_en_produccion";
const JWT_EXPIRES_IN = "7d";

/**
 * Generar hash seguro de contraseña
 * @param password - Contraseña en texto plano
 * @returns Hash bcrypt de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

/**
 * Verificar contraseña contra hash almacenado
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado en base de datos
 * @returns true si coincide, false en caso contrario
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generar token JWT para usuario autenticado
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @param rol - Rol del usuario (ADMIN, INVESTIGADOR, PUBLICO)
 * @returns Token JWT firmado
 */
export function generateToken(userId: number, email: string, rol: string): string {
    return jwt.sign(
        { userId, email, rol },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verificar y decodificar token JWT
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export function verifyToken(token: string): { userId: number; email: string; rol: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; rol: string };
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Interfaz para respuestas de autenticación
 */
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: number;
        nombre: string;
        email: string;
        rol: string;
    };
}
