# Documentación de API REST - MytilusData

Esta documentación describe los endpoints de la API REST disponibles en MytilusData para acceso programático a los datos.

## Información General

### URL Base

```
https://tu-dominio.com/api
```

Para desarrollo local:
```
http://localhost:5173/api
```

### Autenticación

Todos los endpoints de API requieren autenticación mediante **API Key** pasada en el header `Authorization`:

```
Authorization: Bearer tu-api-key-aqui
```

> **Nota**: El endpoint de exportación requiere sesión de usuario autenticado (no API Key).

### Formato de Respuesta

- **Content-Type**: `application/json`
- **Codificación**: UTF-8

### Headers de Rate Limiting

Todas las respuestas incluyen headers informativos sobre el estado del rate limiting:

| Header | Descripción |
|--------|-------------|
| `X-RateLimit-Limit` | Límite máximo de solicitudes en la ventana |
| `X-RateLimit-Remaining` | Solicitudes restantes en la ventana actual |
| `X-RateLimit-Reset` | Timestamp Unix cuando se reinicia el límite |

### Headers de Seguridad

| Header | Valor |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cache-Control` | `no-store, no-cache, must-revalidate` |

---

## Endpoints Disponibles

| Endpoint | Método | Descripción | Rate Limit |
|----------|--------|-------------|------------|
| `/api/centros` | GET | Obtener centros de cultivo | DEFAULT (100/min) |
| `/api/ciclos` | GET | Obtener ciclos productivos | DEFAULT (100/min) |
| `/api/registros` | GET | Obtener registros/mediciones | DEFAULT (100/min) |
| `/api/export-data` | GET | Exportar datos a Excel | EXPORT (10/min) |

---

## GET /api/centros

Obtiene la lista de centros de cultivo (lugares) del usuario autenticado.

### Solicitud

```http
GET /api/centros HTTP/1.1
Host: tu-dominio.com
Authorization: Bearer tu-api-key
```

### Parámetros

No acepta parámetros.

### Respuesta Exitosa (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Centro de Cultivo Norte",
      "latitud": -41.123456,
      "longitud": -73.654321,
      "userId": 5,
      "createdAt": "2026-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "nombre": "Centro de Cultivo Sur",
      "latitud": -42.234567,
      "longitud": -74.765432,
      "userId": 5,
      "createdAt": "2026-02-01T14:20:00.000Z"
    }
  ]
}
```

### Estructura de Datos - Centro

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | Identificador único del centro |
| `nombre` | string | Nombre del centro de cultivo |
| `latitud` | float | Latitud geográfica (puede ser null) |
| `longitud` | float | Longitud geográfica (puede ser null) |
| `userId` | integer | ID del usuario propietario |
| `createdAt` | string | Fecha de creación (ISO 8601) |

### Errores

| Código | Descripción |
|--------|-------------|
| 401 | Falta API Key o API Key inválida |
| 429 | Límite de solicitudes excedido |
| 500 | Error interno del servidor |

### Ejemplo de Error 401

```json
{
  "error": "Falta la API Key en el header Authorization"
}
```

### Ejemplo de Error 429

```json
{
  "error": "Límite de solicitudes excedido",
  "retryAfter": 45000
}
```

### Ejemplo de Uso - cURL

```bash
curl -X GET "https://tu-dominio.com/api/centros" \
  -H "Authorization: Bearer tu-api-key" \
  -H "Content-Type: application/json"
```

### Ejemplo de Uso - JavaScript

```javascript
const response = await fetch('https://tu-dominio.com/api/centros', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer tu-api-key',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data);
```

### Ejemplo de Uso - Python

```python
import requests

headers = {
    'Authorization': 'Bearer tu-api-key',
    'Content-Type': 'application/json'
}

response = requests.get('https://tu-dominio.com/api/centros', headers=headers)
data = response.json()
print(data['data'])
```

---

## GET /api/ciclos

Obtiene la lista de ciclos productivos del usuario autenticado.

### Solicitud

```http
GET /api/ciclos HTTP/1.1
Host: tu-dominio.com
Authorization: Bearer tu-api-key
```

### Parámetros

No acepta parámetros.

### Respuesta Exitosa (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Ciclo Verano 2026",
      "fechaSiembra": "2026-01-15T00:00:00.000Z",
      "fechaFinalizacion": null,
      "lugarId": 1,
      "userId": 5,
      "activo": true
    },
    {
      "id": 2,
      "nombre": "Ciclo Invierno 2025",
      "fechaSiembra": "2025-06-01T00:00:00.000Z",
      "fechaFinalizacion": "2025-09-30T00:00:00.000Z",
      "lugarId": 1,
      "userId": 5,
      "activo": false
    }
  ]
}
```

### Estructura de Datos - Ciclo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | Identificador único del ciclo |
| `nombre` | string | Nombre descriptivo del ciclo |
| `fechaSiembra` | string | Fecha de inicio del ciclo (ISO 8601) |
| `fechaFinalizacion` | string | Fecha de fin del ciclo (puede ser null) |
| `lugarId` | integer | ID del centro de cultivo asociado |
| `userId` | integer | ID del usuario propietario |
| `activo` | boolean | Si el ciclo está activo |

### Errores

| Código | Descripción |
|--------|-------------|
| 401 | Falta API Key o API Key inválida |
| 429 | Límite de solicitudes excedido |
| 500 | Error interno del servidor |

### Ejemplo de Uso - cURL

```bash
curl -X GET "https://tu-dominio.com/api/ciclos" \
  -H "Authorization: Bearer tu-api-key" \
  -H "Content-Type: application/json"
```

---

## GET /api/registros

Obtiene la lista de registros (mediciones) del usuario autenticado.

### Solicitud

```http
GET /api/registros HTTP/1.1
Host: tu-dominio.com
Authorization: Bearer tu-api-key
```

### Parámetros

No acepta parámetros.

### Respuesta Exitosa (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "valor": 45.5,
      "fecha": "2026-02-15T00:00:00.000Z",
      "notas": "Muestreo semanal",
      "cicloId": 1,
      "lugarId": 1,
      "tipoId": 1,
      "origenId": 1
    },
    {
      "id": 2,
      "valor": 12.3,
      "fecha": "2026-02-15T00:00:00.000Z",
      "notas": null,
      "cicloId": 1,
      "lugarId": 1,
      "tipoId": 2,
      "origenId": 1
    }
  ]
}
```

### Estructura de Datos - Registro

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | Identificador único del registro |
| `valor` | float | Valor numérico de la medición |
| `fecha` | string | Fecha de la medición (ISO 8601) |
| `notas` | string | Notas u observaciones (puede ser null) |
| `cicloId` | integer | ID del ciclo asociado (puede ser null) |
| `lugarId` | integer | ID del centro de cultivo |
| `tipoId` | integer | ID del tipo de registro |
| `origenId` | integer | ID del origen de datos |

### Notas Importantes

- Los valores están en la **unidad base** del tipo de registro
- `cicloId` puede ser null para mediciones ambientales de centro
- Los IDs de tipo y origen deben consultarse desde el panel de administración

### Errores

| Código | Descripción |
|--------|-------------|
| 401 | Falta API Key o API Key inválida |
| 429 | Límite de solicitudes excedido |
| 500 | Error interno del servidor |

### Ejemplo de Uso - cURL

```bash
curl -X GET "https://tu-dominio.com/api/registros" \
  -H "Authorization: Bearer tu-api-key" \
  -H "Content-Type: application/json"
```

---

## GET /api/export-data

Exporta todos los datos del usuario a un archivo Excel (XLSX).

> **Importante**: Este endpoint requiere **sesión de usuario activa** (cookie de sesión), no API Key.

### Solicitud

```http
GET /api/export-data HTTP/1.1
Host: tu-dominio.com
Cookie: session=jwt-token
```

### Autenticación

Este endpoint requiere que el usuario esté autenticado en la aplicación web. La sesión se pasa automáticamente mediante cookie.

### Parámetros

No acepta parámetros.

### Respuesta Exitosa (200 OK)

**Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Content-Disposition**: `attachment; filename="Mis_Datos_MytilusData.xlsx"`

El archivo Excel contiene tres hojas:

#### Hoja 1: Centros de Cultivo

| Columna | Descripción |
|---------|-------------|
| ID | Identificador del centro |
| Nombre | Nombre del centro |
| Latitud | Coordenada latitud |
| Longitud | Coordenada longitud |
| Creado el | Fecha de creación |

#### Hoja 2: Ciclos Productivos

| Columna | Descripción |
|---------|-------------|
| ID | Identificador del ciclo |
| Nombre | Nombre del ciclo |
| Centro de Cultivo | Nombre del centro asociado |
| Fecha Inicio | Fecha de siembra |
| Fecha Fin Estimada | Fecha de finalización |
| Activo | Estado del ciclo |

#### Hoja 3: Registros

| Columna | Descripción |
|---------|-------------|
| ID | Identificador del registro |
| Centro de Cultivo | Nombre del centro |
| Ciclo Productivo | Nombre del ciclo |
| Tipo | Código del tipo de medición |
| Origen | Nombre del origen de datos |
| Valor | Valor numérico |
| Unidad | Unidad de medida |
| Texto | Notas u observaciones |
| Fecha Registro | Fecha de la medición |
| Creado el | Fecha de creación del registro |

### Errores

| Código | Descripción |
|--------|-------------|
| 401 | Usuario no autenticado |
| 429 | Límite de exportaciones excedido |
| 500 | Error al generar el archivo |

### Ejemplo de Uso - JavaScript (desde la aplicación)

```javascript
// Este endpoint se usa típicamente desde la interfaz web
const downloadExcel = async () => {
  const response = await fetch('/api/export-data');
  
  if (!response.ok) {
    throw new Error('Error al exportar datos');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Mis_Datos_MytilusData.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
```

---

## Rate Limiting

### Configuración de Límites

| Tipo | Límite | Ventana | Aplicación |
|------|--------|---------|------------|
| DEFAULT | 100 solicitudes | 1 minuto | `/api/centros`, `/api/ciclos`, `/api/registros` |
| EXPORT | 10 solicitudes | 1 minuto | `/api/export-data` |

### Identificación para Rate Limiting

El sistema usa el siguiente orden de precedencia para identificar solicitudes:

1. **API Key**: Si se proporciona, se usa como identificador principal
2. **Dirección IP**: Si no hay API Key, se usa la IP del cliente

### Formato del Identificador

```
apikey:abc123def456...  # Para solicitudes con API Key
ip:192.168.1.1          # Para solicitudes sin API Key
```

### Manejo de Límite Excedido

Cuando se excede el límite, la API retorna:

```json
{
  "error": "Límite de solicitudes excedido",
  "retryAfter": 45000
}
```

Con headers:
```
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1709012345678
```

---

## Gestión de API Keys

### Obtener una API Key

1. Iniciar sesión en la aplicación web
2. Navegar a **Perfil** → **API Keys**
3. Hacer clic en **Generar nueva API Key**
4. Guardar la API Key de forma segura (no se vuelve a mostrar)

### Revocar una API Key

1. Navegar a **Perfil** → **API Keys**
2. Hacer clic en **Revocar** junto a la API Key

### Consideraciones de Seguridad

- **Nunca** compartir la API Key públicamente
- **Nunca** incluir la API Key en código del cliente (JavaScript del navegador)
- Usar variables de entorno en el servidor
- Rotar las API Keys periódicamente
- Revocar API Keys que no se usen

---

## Códigos de Error HTTP

### Resumen de Códigos

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 200 | OK | Solicitud exitosa |
| 401 | Unauthorized | Falta autenticación o credenciales inválidas |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

### Formato de Error

```json
{
  "error": "Descripción del error",
  "retryAfter": 45000  // Solo para errores 429
}
```

---

## Ejemplos de Integración

### Aplicación Node.js

```javascript
// api-client.js
class MytilusDataAPI {
  constructor(apiKey, baseUrl = 'https://tu-dominio.com/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async request(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getCentros() {
    return this.request('/centros');
  }

  async getCiclos() {
    return this.request('/ciclos');
  }

  async getRegistros() {
    return this.request('/registros');
  }
}

// Uso
const api = new MytilusDataAPI('tu-api-key');

async function main() {
  try {
    const centros = await api.getCentros();
    console.log('Centros:', centros.data);

    const ciclos = await api.getCiclos();
    console.log('Ciclos:', ciclos.data);

    const registros = await api.getRegistros();
    console.log('Registros:', registros.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

### Script Python

```python
# api_client.py
import requests
from typing import Dict, List, Optional

class MytilusDataAPI:
    def __init__(self, api_key: str, base_url: str = 'https://tu-dominio.com/api'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def _request(self, endpoint: str) -> Dict:
        response = requests.get(
            f'{self.base_url}{endpoint}',
            headers=self.headers
        )
        
        if response.status_code == 429:
            retry_after = response.json().get('retryAfter', 60)
            raise Exception(f'Rate limit excedido. Intenta en {retry_after} segundos.')
        
        response.raise_for_status()
        return response.json()

    def get_centros(self) -> List[Dict]:
        return self._request('/centros')['data']

    def get_ciclos(self) -> List[Dict]:
        return self._request('/ciclos')['data']

    def get_registros(self) -> List[Dict]:
        return self._request('/registros')['data']


# Uso
if __name__ == '__main__':
    api = MytilusDataAPI('tu-api-key')
    
    try:
        centros = api.get_centros()
        print(f'Centros encontrados: {len(centros)}')
        
        for centro in centros:
            print(f"  - {centro['nombre']} ({centro['latitud']}, {centro['longitud']})")
        
    except Exception as e:
        print(f'Error: {e}')
```

### Integración con Pandas

```python
# analysis.py
import pandas as pd
from api_client import MytilusDataAPI

api = MytilusDataAPI('tu-api-key')

# Obtener datos
centros = pd.DataFrame(api.get_centros())
ciclos = pd.DataFrame(api.get_ciclos())
registros = pd.DataFrame(api.get_registros())

# Análisis básico
if not registros.empty:
    # Unir con información de centros
    registros_completos = registros.merge(
        centros[['id', 'nombre']], 
        left_on='lugarId', 
        right_on='id', 
        suffixes=('', '_centro')
    )
    
    # Estadísticas por centro
    stats = registros_completos.groupby('nombre_centro')['valor'].agg(['mean', 'std', 'count'])
    print(stats)
```

---

## Changelog de API

### Versión Actual: v1

| Fecha | Cambio | Descripción |
|-------|--------|-------------|
| 2026-01 | Inicial | Lanzamiento de API REST con endpoints básicos |
| 2026-02 | Rate Limiting | Implementación de rate limiting diferenciado |

### Notas de Versionamiento

- La API no incluye versión en la URL actualmente
- Cambios breaking serán comunicados con anticipación
- Se mantendrá retrocompatibilidad cuando sea posible

---

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades en la API:

1. Revisar esta documentación
2. Verificar que la API Key esté configurada correctamente
3. Contactar al equipo de desarrollo

---

## Referencias Adicionales

- [Visión General del Proyecto](./overview.md)
- [Guía de Instalación](./installation.md)
- [Arquitectura del Sistema](./architecture.md)
