// --- MIDDLEWARE DE AUTENTICACIÓN VIA API KEY ---
// Valida claves API para acceso programático a endpoints públicos

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";

/**
 * Tipos de permisos disponibles para API Keys
 */
export type ApiPermission =
    | "lugares:read"
    | "lugares:write"
    | "ciclos:read"
    | "ciclos:write"
    | "mediciones:read"
    | "mediciones:write"
    | "unidades:read"
    | "unidades:write";

/**
 * Datos de la API Key autenticada
 */
export interface AuthenticatedApiKey {
    id: number;
    nombre: string;
    permisos: string[];
    creado_por_id: number;
}

/**
 * Respuesta de error estándar
 */
interface ErrorResponse {
    success: false;
    message: string;
}

/**
 * Generar hash SHA-256 de una clave API
 * @param key - Clave API en texto plano
 * @returns Hash SHA-256 de la clave
 */
export function hashApiKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
}

/**
 * Generar una nueva clave API segura
 * @returns Objeto con la clave completa y su prefijo
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
    // Generar bytes aleatorios y convertir a base64url
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const base64 = Buffer.from(randomBytes).toString("base64url");

    // Agregar prefijo identificable
    const key = `myt_${base64}`;
    const prefix = key.substring(0, 12); // "myt_" + 8 caracteres
    const hash = hashApiKey(key);

    return { key, prefix, hash };
}

/**
 * Verificar autenticación de API Key desde header
 * @param request - Request de Next.js
 * @returns API Key autenticada o respuesta de error
 */
export async function verifyApiKey(
    request: NextRequest
): Promise<AuthenticatedApiKey | NextResponse<ErrorResponse>> {
    // Obtener clave del header X-API-Key
    const apiKey = request.headers.get("X-API-Key");

    if (!apiKey) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "API Key requerida. Incluir header X-API-Key",
            },
            { status: 401 }
        );
    }

    // Validar formato básico
    if (!apiKey.startsWith("myt_")) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "Formato de API Key inválido",
            },
            { status: 401 }
        );
    }

    // Hashear la clave para buscar en BD
    const keyHash = hashApiKey(apiKey);

    // Buscar la clave en base de datos
    const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { key_hash: keyHash },
        select: {
            id: true,
            nombre: true,
            permisos: true,
            activa: true,
            creado_por_id: true,
            revocada_at: true,
        },
    });

    if (!apiKeyRecord) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "API Key inválida",
            },
            { status: 401 }
        );
    }

    if (!apiKeyRecord.activa || apiKeyRecord.revocada_at) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "API Key revocada o inactiva",
            },
            { status: 401 }
        );
    }

    // Actualizar último uso de forma asíncrona (no bloquear respuesta)
    prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { ultimo_uso: new Date() },
    }).catch((err) => {
        console.error("Error al actualizar último uso de API Key:", err);
    });

    return {
        id: apiKeyRecord.id,
        nombre: apiKeyRecord.nombre,
        permisos: apiKeyRecord.permisos,
        creado_por_id: apiKeyRecord.creado_por_id,
    };
}

/**
 * Verificar si el resultado es una API Key o una respuesta de error
 */
export function isApiKeyError(
    result: AuthenticatedApiKey | NextResponse<ErrorResponse>
): result is NextResponse<ErrorResponse> {
    return result instanceof NextResponse;
}

/**
 * Middleware para restringir acceso con API Key y permisos específicos
 * @param handler - Handler del endpoint
 * @param permisosRequeridos - Lista de permisos necesarios (al menos uno)
 * @returns Middleware de Next.js
 */
export function withApiKey(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
    permisosRequeridos: ApiPermission[]
) {
    return async (request: NextRequest, context?: any) => {
        try {
            const auth = await verifyApiKey(request);
            if (isApiKeyError(auth)) return auth;

            // Verificar que tenga al menos uno de los permisos requeridos
            const tienePermiso = permisosRequeridos.some((permiso) =>
                auth.permisos.includes(permiso)
            );

            if (!tienePermiso) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Permisos insuficientes. Requiere: ${permisosRequeridos.join(" o ")}`,
                    },
                    { status: 403 }
                );
            }

            // Adjuntar datos de la API Key al request
            (request as any).apiKey = auth;

            return handler(request, context);
        } catch (error) {
            console.error("Error en middleware de API Key:", error);
            return NextResponse.json(
                { success: false, message: "Error interno del servidor" },
                { status: 500 }
            );
        }
    };
}
