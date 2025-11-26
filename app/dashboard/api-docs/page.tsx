"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    Book, Key, Code, Copy, Check, Server, Shield, FileJson,
    ChevronRight, ExternalLink, Zap, Lock
} from "lucide-react"

// ================================
// COMPONENTES AUXILIARES
// ================================
function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
    const [copied, setCopied] = useState(false)

    const copyCode = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative group">
            <pre className={`bg-zinc-900 text-zinc-100 rounded-lg p-4 overflow-x-auto text-sm font-mono`}>
                <code>{code}</code>
            </pre>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700"
                onClick={copyCode}
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            </Button>
        </div>
    )
}

function EndpointCard({
    method,
    path,
    description,
    permission,
    params,
    response
}: {
    method: "GET" | "POST" | "PUT" | "DELETE"
    path: string
    description: string
    permission: string
    params?: { name: string; type: string; required: boolean; description: string }[]
    response: string
}) {
    const methodColors = {
        GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        POST: "bg-blue-500/10 text-blue-500 border-blue-500/30",
        PUT: "bg-amber-500/10 text-amber-500 border-amber-500/30",
        DELETE: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    }

    return (
        <div className="border border-border/50 rounded-lg overflow-hidden">
            <div className="bg-muted/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${methodColors[method]}`}>
                        {method}
                    </span>
                    <code className="text-sm font-mono">{path}</code>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex items-center gap-1">
                    <Lock className="w-3 h-3" /> {permission}
                </span>
            </div>
            <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">{description}</p>

                {params && params.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Parámetros</h4>
                        <div className="space-y-1">
                            {params.map(p => (
                                <div key={p.name} className="flex items-start gap-2 text-sm">
                                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{p.name}</code>
                                    <span className="text-muted-foreground text-xs">{p.type}</span>
                                    {p.required && <span className="text-rose-500 text-xs">requerido</span>}
                                    <span className="text-xs text-muted-foreground">— {p.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Respuesta</h4>
                    <CodeBlock code={response} language="json" />
                </div>
            </div>
        </div>
    )
}

// ================================
// DATOS DE ENDPOINTS
// ================================
const ENDPOINTS = {
    lugares: [
        {
            method: "GET" as const,
            path: "/api/v1/lugares",
            description: "Obtiene una lista paginada de lugares.",
            permission: "lugares:read",
            params: [
                { name: "page", type: "number", required: false, description: "Número de página (default: 1)" },
                { name: "limit", type: "number", required: false, description: "Registros por página (max: 100)" },
                { name: "q", type: "string", required: false, description: "Búsqueda por nombre" },
            ],
            response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Centro Marítimo A1",
      "latitud": "-41.469358",
      "longitud": "-72.942352"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "totalPages": 1
  }
}`
        },
        {
            method: "POST" as const,
            path: "/api/v1/lugares",
            description: "Crea un nuevo lugar.",
            permission: "lugares:write",
            params: [
                { name: "nombre", type: "string", required: true, description: "Nombre del lugar" },
                { name: "latitud", type: "string", required: true, description: "Latitud (decimal)" },
                { name: "longitud", type: "string", required: true, description: "Longitud (decimal)" },
                { name: "nota", type: "string", required: false, description: "Nota opcional" },
            ],
            response: `{
  "success": true,
  "message": "Lugar creado exitosamente",
  "data": { "id": 5, "nombre": "Nuevo Centro" }
}`
        },
    ],
    ciclos: [
        {
            method: "GET" as const,
            path: "/api/v1/ciclos",
            description: "Obtiene una lista de ciclos productivos.",
            permission: "ciclos:read",
            params: [
                { name: "lugar_id", type: "number", required: false, description: "Filtrar por lugar" },
                { name: "activo", type: "boolean", required: false, description: "Solo ciclos activos" },
            ],
            response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Ciclo 2025-A",
      "fecha_inicio": "2025-01-15",
      "lugar": { "id": 1, "nombre": "Centro A1" }
    }
  ]
}`
        },
        {
            method: "POST" as const,
            path: "/api/v1/ciclos",
            description: "Crea un nuevo ciclo productivo.",
            permission: "ciclos:write",
            params: [
                { name: "nombre", type: "string", required: true, description: "Nombre del ciclo" },
                { name: "lugar_id", type: "number", required: true, description: "ID del lugar asociado" },
                { name: "fecha_inicio", type: "string", required: true, description: "Fecha de inicio (ISO 8601)" },
            ],
            response: `{
  "success": true,
  "data": { "id": 2, "nombre": "Ciclo 2025-B" }
}`
        },
    ],
    mediciones: [
        {
            method: "GET" as const,
            path: "/api/v1/mediciones",
            description: "Obtiene mediciones con filtros avanzados.",
            permission: "mediciones:read",
            params: [
                { name: "lugar_id", type: "number", required: false, description: "Filtrar por lugar" },
                { name: "ciclo_id", type: "number", required: false, description: "Filtrar por ciclo" },
                { name: "fecha_desde", type: "string", required: false, description: "Desde fecha (ISO 8601)" },
                { name: "fecha_hasta", type: "string", required: false, description: "Hasta fecha (ISO 8601)" },
            ],
            response: `{
  "success": true,
  "data": [
    {
      "id": 100,
      "valor": 15.5,
      "fecha_medicion": "2025-01-10T10:30:00Z",
      "unidad": { "sigla": "°C" },
      "tipo": { "codigo": "TEMP" }
    }
  ]
}`
        },
        {
            method: "POST" as const,
            path: "/api/v1/mediciones",
            description: "Registra una nueva medición.",
            permission: "mediciones:write",
            params: [
                { name: "valor", type: "number", required: true, description: "Valor de la medición" },
                { name: "fecha_medicion", type: "string", required: true, description: "Fecha/hora (ISO 8601)" },
                { name: "lugar_id", type: "number", required: true, description: "ID del lugar" },
                { name: "unidad_id", type: "number", required: true, description: "ID de la unidad" },
                { name: "tipo_id", type: "number", required: true, description: "ID del tipo de registro" },
                { name: "origen_id", type: "number", required: true, description: "ID del origen de datos" },
            ],
            response: `{
  "success": true,
  "data": { "id": 101, "valor": 16.2 }
}`
        },
    ],
    unidades: [
        {
            method: "GET" as const,
            path: "/api/v1/unidades",
            description: "Obtiene todas las unidades de medida disponibles.",
            permission: "unidades:read",
            params: [
                { name: "q", type: "string", required: false, description: "Búsqueda por nombre" },
            ],
            response: `{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Grados Celsius", "sigla": "°C" },
    { "id": 2, "nombre": "Miligramos por litro", "sigla": "mg/L" }
  ]
}`
        },
    ],
}

// ================================
// PÁGINA PRINCIPAL
// ================================
export default function ApiDocsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-outfit flex items-center gap-3">
                    <Book className="w-8 h-8 text-primary" />
                    Documentación de la API
                </h2>
                <p className="text-muted-foreground mt-1">
                    Guía completa para integrar aplicaciones externas con la plataforma MytilusData.
                </p>
            </div>

            {/* Quick Start */}
            <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-primary" />
                        Inicio Rápido
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                        <div>
                            <p className="font-medium">Genera una API Key</p>
                            <p className="text-sm text-muted-foreground">Ve a <a href="/dashboard/configuracion" className="text-primary underline">Configuración → API Keys</a> y crea una nueva clave con los permisos necesarios.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                        <div>
                            <p className="font-medium">Incluye el header de autenticación</p>
                            <p className="text-sm text-muted-foreground mb-2">Todas las peticiones deben incluir tu API Key:</p>
                            <CodeBlock code={`curl -H "X-API-Key: myt_tu_clave_secreta" \\
  https://mytilusdata.cl/api/v1/lugares`} />
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                        <div>
                            <p className="font-medium">Procesa la respuesta JSON</p>
                            <p className="text-sm text-muted-foreground">Todas las respuestas siguen el formato estándar con <code className="bg-muted px-1 rounded">success</code> y <code className="bg-muted px-1 rounded">data</code>.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Authentication */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Autenticación
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        La API utiliza claves API (API Keys) para autenticar peticiones. Cada clave tiene permisos granulares que determinan qué operaciones puede realizar.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Key className="w-4 h-4 text-primary" /> Header requerido
                            </h4>
                            <CodeBlock code="X-API-Key: myt_xxxxxxxxxxxxx" />
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <FileJson className="w-4 h-4 text-primary" /> Content-Type
                            </h4>
                            <CodeBlock code="Content-Type: application/json" />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Permisos disponibles</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {["lugares:read", "lugares:write", "ciclos:read", "ciclos:write", "mediciones:read", "mediciones:write", "unidades:read", "unidades:write"].map(p => (
                                <code key={p} className="bg-muted px-2 py-1 rounded text-xs">{p}</code>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Endpoints */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-primary" />
                        Endpoints
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="lugares" className="space-y-4">
                        <TabsList className="bg-muted/50">
                            <TabsTrigger value="lugares">Lugares</TabsTrigger>
                            <TabsTrigger value="ciclos">Ciclos</TabsTrigger>
                            <TabsTrigger value="mediciones">Mediciones</TabsTrigger>
                            <TabsTrigger value="unidades">Unidades</TabsTrigger>
                        </TabsList>

                        <TabsContent value="lugares" className="space-y-4">
                            {ENDPOINTS.lugares.map((e, i) => <EndpointCard key={i} {...e} />)}
                        </TabsContent>
                        <TabsContent value="ciclos" className="space-y-4">
                            {ENDPOINTS.ciclos.map((e, i) => <EndpointCard key={i} {...e} />)}
                        </TabsContent>
                        <TabsContent value="mediciones" className="space-y-4">
                            {ENDPOINTS.mediciones.map((e, i) => <EndpointCard key={i} {...e} />)}
                        </TabsContent>
                        <TabsContent value="unidades" className="space-y-4">
                            {ENDPOINTS.unidades.map((e, i) => <EndpointCard key={i} {...e} />)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Errors */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        Códigos de Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-3">Código</th>
                                    <th className="text-left py-2 px-3">Descripción</th>
                                    <th className="text-left py-2 px-3">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="py-2 px-3"><code className="bg-amber-500/10 text-amber-600 px-1 rounded">400</code></td>
                                    <td className="py-2 px-3 text-muted-foreground">Bad Request</td>
                                    <td className="py-2 px-3 text-muted-foreground">Revisa los parámetros enviados</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3"><code className="bg-rose-500/10 text-rose-600 px-1 rounded">401</code></td>
                                    <td className="py-2 px-3 text-muted-foreground">Unauthorized</td>
                                    <td className="py-2 px-3 text-muted-foreground">API Key inválida o faltante</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3"><code className="bg-rose-500/10 text-rose-600 px-1 rounded">403</code></td>
                                    <td className="py-2 px-3 text-muted-foreground">Forbidden</td>
                                    <td className="py-2 px-3 text-muted-foreground">Sin permisos para esta operación</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3"><code className="bg-blue-500/10 text-blue-600 px-1 rounded">404</code></td>
                                    <td className="py-2 px-3 text-muted-foreground">Not Found</td>
                                    <td className="py-2 px-3 text-muted-foreground">Recurso no encontrado</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3"><code className="bg-rose-500/10 text-rose-600 px-1 rounded">500</code></td>
                                    <td className="py-2 px-3 text-muted-foreground">Internal Error</td>
                                    <td className="py-2 px-3 text-muted-foreground">Error del servidor, contacta soporte</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Examples */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        Ejemplos de Código
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="curl" className="space-y-4">
                        <TabsList className="bg-muted/50">
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                            <TabsTrigger value="python">Python</TabsTrigger>
                            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        </TabsList>

                        <TabsContent value="curl">
                            <CodeBlock code={`# Listar lugares
curl -H "X-API-Key: myt_tu_clave" \\
  https://mytilusdata.cl/api/v1/lugares

# Crear medición
curl -X POST \\
  -H "X-API-Key: myt_tu_clave" \\
  -H "Content-Type: application/json" \\
  -d '{"valor": 15.5, "lugar_id": 1, "unidad_id": 1, "tipo_id": 1, "origen_id": 1, "fecha_medicion": "2025-01-14T10:00:00Z"}' \\
  https://mytilusdata.cl/api/v1/mediciones`} />
                        </TabsContent>

                        <TabsContent value="python">
                            <CodeBlock code={`import requests

API_KEY = "myt_tu_clave_secreta"
BASE_URL = "https://mytilusdata.cl/api/v1"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Listar lugares
response = requests.get(f"{BASE_URL}/lugares", headers=headers)
lugares = response.json()["data"]

# Crear medición
nueva_medicion = {
    "valor": 15.5,
    "lugar_id": 1,
    "unidad_id": 1,
    "tipo_id": 1,
    "origen_id": 1,
    "fecha_medicion": "2025-01-14T10:00:00Z"
}
response = requests.post(f"{BASE_URL}/mediciones", json=nueva_medicion, headers=headers)
print(response.json())`} />
                        </TabsContent>

                        <TabsContent value="javascript">
                            <CodeBlock code={`const API_KEY = "myt_tu_clave_secreta";
const BASE_URL = "https://mytilusdata.cl/api/v1";

const headers = {
  "X-API-Key": API_KEY,
  "Content-Type": "application/json"
};

// Listar lugares
const lugares = await fetch(\`\${BASE_URL}/lugares\`, { headers })
  .then(res => res.json());

// Crear medición  
const nuevaMedicion = await fetch(\`\${BASE_URL}/mediciones\`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    valor: 15.5,
    lugar_id: 1,
    unidad_id: 1,
    tipo_id: 1,
    origen_id: 1,
    fecha_medicion: "2025-01-14T10:00:00Z"
  })
}).then(res => res.json());`} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
