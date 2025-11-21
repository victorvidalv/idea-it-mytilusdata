import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Obtener JWT_SECRET de forma segura
 * Valida en el primer acceso, no al cargar el módulo (permite build)
 */
let _jwtSecretCache: string | null = null;

function getJwtSecret(): string {
    if (_jwtSecretCache) return _jwtSecretCache;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error(
            "[SEGURIDAD CRÍTICA] JWT_SECRET no está definido. " +
            "Configure la variable de entorno antes de iniciar el servidor."
        );
    }
    if (secret.length < 32) {
        throw new Error(
            "[SEGURIDAD] JWT_SECRET debe tener al menos 32 caracteres para seguridad adecuada."
        );
    }
    _jwtSecretCache = secret;
    return secret;
}
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
 * @param rol - Rol del usuario (ADMIN, EQUIPO, PUBLICO)
 * @returns Token JWT firmado
 */
export function generateToken(userId: number, email: string, rol: string): string {
    return jwt.sign(
        { userId, email, rol },
        getJwtSecret(),
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
        const decoded = jwt.verify(token, getJwtSecret()) as { userId: number; email: string; rol: string };
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
