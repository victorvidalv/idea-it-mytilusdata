# Preguntas Frecuentes - MytilusData

## Propósito

Este documento compila las preguntas más frecuentes sobre la plataforma MytilusData, organizadas por categoría para facilitar la búsqueda de respuestas.

---

## FAQs Generales

### ¿Qué es MytilusData?

MytilusData es una plataforma web especializada para la gestión de datos de mitilicultura (cultivo de mejillones). Permite registrar, visualizar y exportar datos de centros de cultivo, ciclos productivos y mediciones ambientales y biológicas.

### ¿Quién puede usar la plataforma?

La plataforma está dirigida a:
- Productores de mitílidos (centros de engorda)
- Investigadores acuícolas
- Técnicos de centros de cultivo
- Entes públicos relacionados con fiscalización

### ¿La plataforma es gratuita?

Sí, MytilusData ofrece funcionalidades básicas gratuitas para PYMES como parte del modelo Freemium, financiado principalmente por subsidio ANID.

### ¿Qué tipo de datos puedo registrar?

Puede registrar tres tipos principales de datos:

| Categoría      | Ejemplos                              |
| -------------- | ------------------------------------- |
| Centros        | Ubicación, nombre, coordenadas        |
| Ciclos         | Fecha siembra, fecha cosecha, estado  |
| Mediciones     | Talla, biomasa, temperatura, oxígeno  |

### ¿En qué región opera la plataforma?

La plataforma está diseñada para centros de cultivo de la Región de Los Lagos, Chile, calibrada específicamente para *Mytilus chilensis*.

---

## FAQs de Autenticación y Acceso

### ¿Cómo inicio sesión si no tengo contraseña?

MytilusData utiliza **Magic Links** para autenticación. No se requieren contraseñas:

1. Ingrese su correo electrónico en la página de login
2. Complete la verificación CAPTCHA
3. Reciba un enlace en su correo
4. Haga clic en el enlace para acceder

### ¿Cuánto tiempo es válido el Magic Link?

El Magic Link tiene una validez de **15 minutos** desde su envío. Una vez utilizado, no puede volver a usarse.

### ¿Qué hago si no recibo el correo con el Magic Link?

1. **Verifique el correo electrónico**: Asegúrese de haber ingresado la dirección correcta
2. **Revise la carpeta de spam**: El correo puede haber sido clasificado como correo no deseado
3. **Espere unos minutos**: En ocasiones puede haber demora en la entrega
4. **Solicite un nuevo enlace**: Vaya a la página de login y solicite otro Magic Link

### ¿Cuántos intentos de login tengo?

El sistema tiene límites de seguridad:

| Límite           | Restricción              |
| ---------------- | ------------------------ |
| Por IP           | 5 intentos cada 15 min   |
| Por email        | 3 intentos cada 1 hora   |
| Entre envíos     | 60 segundos de espera    |

Si excede los límites, el sistema le indicará cuánto tiempo debe esperar.

### ¿Puedo cambiar mi correo electrónico?

No directamente. El correo electrónico es el identificador único de su cuenta. Si necesita cambiarlo, contacte al administrador del sistema.

### ¿Cuánto tiempo dura mi sesión?

La sesión tiene una duración de **7 días**. Pasado ese período, deberá iniciar sesión nuevamente mediante un nuevo Magic Link.

### ¿Cómo cierro sesión?

1. Haga clic en su nombre de usuario en la barra superior
2. Seleccione **Cerrar Sesión** en el menú desplegable

---

## FAQs de Datos y Mediciones

### ¿Qué tipos de medición puedo registrar?

Los tipos de medición son configurados por el administrador. Los más comunes incluyen:

| Tipo        | Unidad Típica | Descripción                   |
| ----------- | ------------- | ----------------------------- |
| Talla       | mm            | Longitud del organismo        |
| Biomasa     | g             | Peso total o individual       |
| Densidad    | ind/m²        | Organismos por unidad de área |
| Temperatura | °C            | Temperatura del agua          |
| Oxígeno     | mg/L          | Oxígeno disuelto              |
| Clorofila   | µg/L          | Concentración de clorofila    |

### ¿Qué son los orígenes de datos?

El origen indica la fuente de la medición:

| Origen    | Descripción                              |
| --------- | ---------------------------------------- |
| Manual    | Medición tomada directamente en campo    |
| Satelital | Datos obtenidos de sensores remotos      |
| PSMB      | Programa de Sanidad de Moluscos Bivalvos |
| Otro      | Otras fuentes                            |

### ¿Puedo editar o eliminar registros?

Sí. Todos los registros pueden editarse o eliminarse:

1. Navegue a la sección **Registros**
2. Ubique el registro en la tabla
3. Use los botones de **Editar** o **Eliminar** según corresponda

**Nota:** La eliminación es permanente y no se puede deshacer.

### ¿Puedo ver los datos de otros usuarios?

Depende de su rol:

| Rol          | Acceso a datos                           |
| ------------ | ---------------------------------------- |
| USUARIO      | Solo sus propios datos                   |
| INVESTIGADOR | Todos los datos de la plataforma         |
| ADMIN        | Todos los datos de la plataforma         |

### ¿Cómo asocio una medición a un centro y ciclo?

Al crear un registro:

1. Seleccione el **Centro** de cultivo
2. Seleccione el **Ciclo** (se filtra automáticamente según el centro)
3. Complete los demás campos

El centro y ciclo quedan asociados permanentemente al registro.

### ¿Qué pasa si elimino un centro?

**Advertencia:** Eliminar un centro elimina también:
- Todos los ciclos asociados a ese centro
- Todos los registros asociados a esos ciclos

Esta acción no se puede deshacer. Asegúrese de exportar los datos antes de eliminar.

---

## FAQs de Exportación

### ¿Cómo exporto mis datos?

1. Navegue a **Perfil** en el menú lateral
2. En la sección **Exportar Datos**, haga clic en **Descargar Excel**
3. El archivo se descarga automáticamente

### ¿Qué formato tiene el archivo exportado?

- **Formato**: Microsoft Excel (.xlsx)
- **Nombre**: `mytilusdata_export_YYYY-MM-DD.xlsx`
- **Hojas**: Centros, Ciclos, Registros

### ¿Qué contiene cada hoja del archivo Excel?

| Hoja      | Columnas principales                              |
| --------- | ------------------------------------------------- |
| Centros   | Nombre, Latitud, Longitud, Fecha creación         |
| Ciclos    | Nombre, Centro, Fecha siembra, Fecha fin, Estado  |
| Registros | Tipo, Valor, Fecha, Centro, Ciclo, Origen, Notas  |

### ¿Puedo exportar datos de un período específico?

Actualmente la exportación descarga todos los datos del usuario. Para filtrar por período, use la sección de **Gráficos** y luego exporte.

### ¿Con qué frecuencia puedo exportar datos?

No hay límite de exportaciones desde la interfaz web. Sin embargo, la API REST tiene un límite de 10 exportaciones por minuto.

---

## FAQs Técnicas

### ¿Qué navegadores son compatibles?

| Navegador | Versión Mínima |
| --------- | -------------- |
| Chrome    | 90+            |
| Firefox   | 88+            |
| Safari    | 14+            |
| Edge      | 90+            |

**Internet Explorer no es compatible.**

### ¿Necesito instalar algo?

No. MytilusData es una aplicación web que funciona completamente en el navegador. Solo necesita:
- Un navegador compatible actualizado
- Conexión a internet estable
- JavaScript habilitado

### ¿Puedo acceder desde dispositivos móviles?

Sí. La plataforma tiene diseño responsivo y funciona en tablets y smartphones. Sin embargo, para una mejor experiencia de visualización de gráficos y mapas, se recomienda usar una pantalla de al menos 7 pulgadas.

### ¿Qué tecnología usa la plataforma?

- **Frontend**: Svelte 5, SvelteKit, TailwindCSS
- **Backend**: Node.js, SvelteKit Server
- **Base de datos**: PostgreSQL (Neon)
- **Mapas**: MapLibre GL
- **Gráficos**: LayerChart

### ¿La plataforma funciona sin conexión?

No. MytilusData requiere conexión a internet para:
- Autenticación
- Sincronización de datos
- Visualización de mapas
- Exportación de datos

---

## FAQs de Seguridad

### ¿Cómo protegen mis datos?

La plataforma implementa múltiples capas de seguridad:

| Medida              | Descripción                                    |
| ------------------- | ---------------------------------------------- |
| Autenticación       | Magic Links con hash SHA-256                   |
| Sesiones            | Tokens hasheados en base de datos              |
| Rate Limiting       | Protección contra ataques de fuerza bruta      |
| CAPTCHA             | Verificación con Cloudflare Turnstile          |
| HTTPS               | Encriptación de todas las comunicaciones       |
| Multi-tenancy       | Aislamiento de datos por usuario               |

### ¿Dónde se almacenan mis datos?

Los datos se almacenan en **PostgreSQL** sobre **Neon Database**, un servicio de base de datos serverless con:
- Encriptación en reposo
- Backups automáticos
- Certificaciones de seguridad

### ¿Quién puede ver mis datos?

- **Usted**: Siempre tiene acceso a sus propios datos
- **Administradores**: Pueden ver todos los datos para gestión del sistema
- **Investigadores**: Pueden ver datos agregados para análisis (solo si tiene ese rol)
- **Otros usuarios**: No pueden ver sus datos

### ¿Qué es una API Key y para qué sirve?

Una API Key es una clave de acceso que permite integrar sistemas externos con MytilusData de forma programática. Se usa para:
- Automatizar carga de datos
- Integrar con sistemas de monitoreo
- Desarrollar aplicaciones personalizadas

### ¿Cómo genero una API Key?

1. Navegue a **Perfil** → **API Keys**
2. Haga clic en **Generar Nueva API Key**
3. Ingrese un nombre descriptivo
4. Guarde la clave mostrada en un lugar seguro

**Importante:** La API Key solo se muestra una vez. Si la pierde, debe generar una nueva.

### ¿Qué hago si mi API Key se compromete?

Si sospecha que su API Key ha sido comprometida:

1. Navegue inmediatamente a **Perfil** → **API Keys**
2. Haga clic en **Revocar** junto a la clave comprometida
3. Genere una nueva API Key
4. Actualice sus sistemas con la nueva clave

### ¿Puedo eliminar mi cuenta?

Sí. En **Perfil** → **Zona de Peligro** encontrará la opción para eliminar su cuenta.

**Advertencia:** Esta acción elimina permanentemente:
- Su cuenta de usuario
- Todos sus centros de cultivo
- Todos sus ciclos y registros
- Sus API Keys

Esta acción no se puede deshacer.

---

## FAQs de Roles y Permisos

### ¿Qué roles existen en la plataforma?

| Rol          | Nivel | Acceso                                    |
| ------------ | ----- | ----------------------------------------- |
| USUARIO      | 0     | Funcionalidades básicas, solo sus datos   |
| INVESTIGADOR | 1     | Datos de todos los usuarios, análisis     |
| ADMIN        | 2     | Administración completa, gestión usuarios |

### ¿Cómo obtengo un rol diferente?

El rol se asigna al crear la cuenta (USUARIO por defecto). Para cambiarlo:

1. Contacte al administrador del sistema
2. Explique el motivo de la solicitud
3. El administrador evaluará y asignará el rol si corresponde

### ¿Qué puede hacer un Administrador?

- Ver y gestionar todos los usuarios
- Cambiar roles de usuarios
- Activar/desactivar cuentas
- Configurar tipos de medición
- Configurar orígenes de datos
- Poblar datos de ejemplo

### ¿Qué puede hacer un Investigador?

- Ver datos de todos los usuarios
- Acceder al dashboard de investigación
- Usar herramientas de análisis avanzado
- Exportar datos globales

---

## FAQs de Uso de la API

### ¿Cómo uso la API REST?

La API REST permite acceso programático a los datos. Consulte la documentación completa en [api.md](./api.md).

### ¿Qué endpoints están disponibles?

| Endpoint            | Descripción                    |
| ------------------- | ------------------------------ |
| `/api/centros`      | Gestión de centros de cultivo  |
| `/api/ciclos`       | Gestión de ciclos productivos  |
| `/api/registros`    | Gestión de registros           |
| `/api/export-data`  | Exportación de datos           |

### ¿Cómo autentico las solicitudes API?

Incluya la API Key en el header `Authorization`:

```
Authorization: Bearer su_api_key_aqui
```

### ¿Tiene límites la API?

Sí. La API tiene rate limiting:

| Tipo      | Límite            | Ventana  |
| --------- | ----------------- | -------- |
| DEFAULT   | 100 solicitudes   | 1 minuto |
| EXPORT    | 10 solicitudes    | 1 minuto |

Si excede el límite, recibirá un error 429 (Too Many Requests).

---

## Solución de Problemas Comunes

### El mapa no carga correctamente

**Posibles causas:**
1. Conexión a internet inestable
2. Bloqueador de contenido activo
3. Navegador desactualizado

**Solución:**
1. Verifique su conexión
2. Desactive temporalmente el bloqueador
3. Actualice el navegador

### No puedo crear un ciclo

**Causa probable:** No tiene centros de cultivo creados.

**Solución:**
1. Navegue a **Centros**
2. Cree al menos un centro de cultivo
3. Luego podrá crear ciclos asociados

### El gráfico no muestra datos

**Posibles causas:**
1. No hay registros para los filtros seleccionados
2. El rango de fechas es incorrecto
3. No hay datos en el centro/ciclo seleccionado

**Solución:**
1. Verifique que existan registros
2. Ajuste los filtros de fecha
3. Seleccione otro centro o ciclo

### Error al exportar datos

**Posibles causas:**
1. Conexión interrumpida
2. Demasiados datos (timeout)

**Solución:**
1. Intente nuevamente
2. Si el problema persiste, contacte al administrador

---

## Contacto y Soporte

### Soporte Técnico

Para problemas con la plataforma:
- **Email**: [Configurar según implementación]
- **Respuesta estimada**: 24-48 horas hábiles

### Consultas del Proyecto

Para consultas sobre el proyecto o colaboración:
- **Institución ejecutora**: Universidad Santo Tomás
- **Brazo tecnológico**: INTEMIT
- **Gremio mandante**: AmiChile

### Documentación Relacionada

| Documento      | Contenido                              |
| -------------- | -------------------------------------- |
| [user-guide.md](./user-guide.md) | Guía de usuario completa       |
| [api.md](./api.md) | Documentación de la API REST        |
| [architecture.md](./architecture.md) | Arquitectura del sistema    |
| [installation.md](./installation.md) | Guía de instalación          |