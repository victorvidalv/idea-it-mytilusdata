# Guía de Usuario - MytilusData

## Propósito

Esta guía proporciona instrucciones para utilizar la plataforma MytilusData, orientada a usuarios que gestionan datos de mitilicultura (cultivo de mejillones).

## Audiencia

- Productores de mitílidos
- Investigadores acuícolas
- Técnicos de centros de cultivo
- Administradores de datos

---

## Introducción a la Plataforma

MytilusData es una plataforma web para la gestión de datos de centros de cultivo de mitílidos. Permite registrar, visualizar y exportar información relacionada con:

- **Centros de cultivo**: Ubicaciones geográficas de producción
- **Ciclos productivos**: Períodos desde siembra hasta cosecha
- **Mediciones**: Datos biológicos y ambientales

### Casos de Uso Principales

| Usuario           | Actividad Principal                        |
| ----------------- | ------------------------------------------ |
| Productor         | Registrar mediciones de sus centros        |
| Investigador      | Analizar datos históricos y tendencias     |
| Administrador     | Gestionar usuarios y configuración global  |

---

## Requisitos

### Navegadores Soportados

| Navegador | Versión Mínima |
| --------- | -------------- |
| Chrome    | 90+            |
| Firefox   | 88+            |
| Safari    | 14+            |
| Edge      | 90+            |

**Nota:** Internet Explorer no es compatible.

### Conexión

- Conexión a internet estable
- JavaScript habilitado en el navegador

---

## Primeros Pasos

### Registro

La plataforma utiliza **Magic Links** para autenticación. No requiere contraseña.

1. Acceder a la URL de la plataforma
2. En la página de inicio, hacer clic en **Iniciar Sesión**
3. Ingresar el correo electrónico institucional
4. Completar la verificación CAPTCHA (checkbox "No soy un robot")
5. Hacer clic en **Enviar Magic Link**
6. Revisar la bandeja de entrada del correo electrónico
7. Hacer clic en el enlace recibido (válido por 15 minutos)

**Importante:** El enlace solo puede usarse una vez. Si expira, solicitar uno nuevo.

### Primer Ingreso

Al ingresar por primera vez:

1. El sistema solicita completar el nombre de usuario
2. Ingresar nombre y apellido
3. Guardar cambios

El usuario queda registrado con rol **USUARIO** por defecto.

---

## Navegación Principal

### Estructura del Menú

Una vez autenticado, el menú lateral muestra las secciones disponibles:

| Sección      | Descripción                                    | Disponibilidad           |
| ------------ | ---------------------------------------------- | ------------------------ |
| Dashboard    | Resumen de datos y actividad                   | Todos los roles          |
| Centros      | Gestión de centros de cultivo                  | Todos los roles          |
| Ciclos       | Gestión de ciclos productivos                  | Todos los roles          |
| Registros    | Ingreso de mediciones                          | Todos los roles          |
| Gráficos     | Visualización de datos                         | Todos los roles          |
| Perfil       | Configuración de cuenta y API Keys             | Todos los roles          |
| Investigador | Dashboard y herramientas de investigación      | INVESTIGADOR, ADMIN      |
| Admin        | Panel de administración                        | Solo ADMIN               |

### Header

La barra superior contiene:

- **Logo y nombre** de la plataforma
- **Indicador de rol** actual
- **Toggle de tema** (claro/oscuro)
- **Menú de usuario** (nombre, email, cerrar sesión)

---

## Gestión de Centros de Cultivo

### Acceso

Navegar a **Centros** en el menú lateral.

### Listado de Centros

La página muestra una tabla con los centros registrados:

| Columna    | Contenido                      |
| ---------- | ------------------------------ |
| Nombre     | Identificación del centro      |
| Ubicación  | Coordenadas (latitud, longitud)|
| Ciclos     | Cantidad de ciclos asociados   |
| Acciones   | Editar, eliminar               |

### Crear un Centro

1. Hacer clic en el botón **Nuevo Centro**
2. Completar el formulario:
   - **Nombre**: Identificación única del centro (ej: "Centro Norte - Calbuco")
   - **Ubicación**: Seleccionar en el mapa interactivo o ingresar coordenadas manualmente
3. Hacer clic en **Guardar**

**Selección en mapa:**
- Navegar el mapa con el mouse (arrastrar para mover, scroll para zoom)
- Hacer clic en la ubicación deseada
- El marcador se posiciona automáticamente
- Las coordenadas se actualizan en el formulario

### Editar un Centro

1. En la tabla de centros, hacer clic en el ícono de **Editar** (lápiz)
2. Modificar los campos necesarios
3. Hacer clic en **Guardar**

### Eliminar un Centro

1. En la tabla de centros, hacer clic en el ícono de **Eliminar** (papelera)
2. Confirmar la eliminación en el diálogo emergente

**Advertencia:** Eliminar un centro elimina también todos los ciclos y registros asociados. Esta acción no se puede deshacer.

---

## Gestión de Ciclos Productivos

### Concepto

Un **ciclo productivo** representa el período desde la siembra hasta la cosecha de un lote de mitílidos en un centro específico.

### Acceso

Navegar a **Ciclos** en el menú lateral.

### Listado de Ciclos

La página muestra una grilla con los ciclos registrados:

| Campo           | Descripción                           |
| --------------- | ------------------------------------- |
| Nombre          | Identificación del ciclo              |
| Centro          | Centro de cultivo asociado            |
| Fecha Siembra   | Inicio del ciclo                      |
| Fecha Fin       | Finalización (si aplica)              |
| Estado          | Activo / Inactivo                     |

### Crear un Ciclo

1. Hacer clic en **Nuevo Ciclo**
2. Seleccionar el **Centro** de cultivo (debe existir previamente)
3. Ingresar el **Nombre** del ciclo (ej: "Ciclo 2024-A")
4. Seleccionar la **Fecha de Siembra**
5. Opcionalmente, ingresar **Fecha de Finalización**
6. Hacer clic en **Guardar**

**Nota:** Si no hay centros creados, el sistema mostrará una alerta indicando que debe crear uno primero.

### Estados del Ciclo

- **Activo**: Ciclo en curso, permite registrar mediciones
- **Inactivo**: Ciclo finalizado o pausado

### Editar un Ciclo

1. En la grilla de ciclos, hacer clic en **Editar**
2. Modificar los campos necesarios
3. Hacer clic en **Guardar**

---

## Registro de Mediciones

### Concepto

Una **medición** es un registro de datos tomado en un momento específico, asociado a un centro y ciclo.

### Tipos de Medición Disponibles

| Tipo         | Unidad Típica | Descripción                    |
| ------------ | ------------- | ------------------------------ |
| Talla        | mm            | Longitud del organismo         |
| Biomasa      | g             | Peso total o individual        |
| Densidad     | ind/m²        | Organismos por unidad de área  |
| Temperatura  | °C            | Temperatura del agua           |
| Oxígeno      | mg/L          | Oxígeno disuelto               |
| Clorofila    | µg/L          | Concentración de clorofila     |

**Nota:** Los tipos de medición son configurados por el administrador.

### Orígenes de Datos

| Origen       | Descripción                              |
| ------------ | ---------------------------------------- |
| Manual       | Medición tomada directamente en campo    |
| Satelital    | Datos obtenidos de sensores remotos      |
| PSMB         | Programa de Sanidad de Moluscos Bivalvos |
| Otro         | Otras fuentes                            |

### Acceso

Navegar a **Registros** en el menú lateral.

### Crear un Registro

1. Hacer clic en **Nuevo Registro**
2. Completar los campos:

   **Datos de Medición:**
   - **Tipo**: Seleccionar de la lista desplegable
   - **Valor**: Ingresar el valor numérico
   - **Origen**: Seleccionar la fuente del dato

   **Datos de Contexto:**
   - **Centro**: Seleccionar el centro de cultivo
   - **Ciclo**: Seleccionar el ciclo (se filtra según el centro)
   - **Fecha de Medición**: Seleccionar fecha y hora

   **Opcional:**
   - **Notas**: Observaciones o comentarios

3. Hacer clic en **Guardar**

### Editar un Registro

1. En la tabla de registros, hacer clic en **Editar**
2. Modificar los campos necesarios
3. Hacer clic en **Guardar**

### Eliminar un Registro

1. En la tabla de registros, hacer clic en **Eliminar**
2. Confirmar la eliminación

---

## Visualización de Gráficos

### Acceso

Navegar a **Gráficos** en el menú lateral.

### Filtros Disponibles

| Filtro       | Descripción                              |
| ------------ | ---------------------------------------- |
| Centro       | Filtrar por centro de cultivo            |
| Ciclo        | Filtrar por ciclo productivo             |
| Tipo Medición| Filtrar por tipo de dato                 |
| Fecha Desde  | Fecha inicial del rango                  |
| Fecha Hasta  | Fecha final del rango                    |

### Tipos de Visualización

**Gráfico de Evolución:**
- Muestra la variación de un tipo de medición a lo largo del tiempo
- Eje X: Fecha
- Eje Y: Valor de la medición

**Panel de Estadísticas:**
- Resumen de datos filtrados
- Valores mínimo, máximo, promedio
- Cantidad de registros

### Uso de los Gráficos

1. Seleccionar filtros deseados
2. Hacer clic en **Aplicar Filtros**
3. El gráfico se actualiza automáticamente
4. Pase el mouse sobre los puntos para ver valores detallados

**Nota:** Si no hay datos para los filtros seleccionados, se mostrará un mensaje indicando que no hay registros.

---

## Exportación de Datos

### Desde la Interfaz Web

1. Navegar a **Perfil** en el menú lateral
2. En la sección **Exportar Datos**, hacer clic en **Descargar Excel**
3. El archivo se descarga automáticamente

### Contenido del Archivo Excel

El archivo contiene tres hojas:

| Hoja      | Contenido                                |
| --------- | ---------------------------------------- |
| Centros   | Listado de centros de cultivo            |
| Ciclos    | Ciclos productivos con fechas            |
| Registros | Todas las mediciones registradas         |

### Formato del Archivo

- **Nombre**: `mytilusdata_export_YYYY-MM-DD.xlsx`
- **Codificación**: UTF-8
- **Estilos**: Encabezados con formato, columnas ajustadas

---

## Gestión de Perfil

### Acceso

Navegar a **Perfil** en el menú lateral.

### Información Personal

La sección muestra:
- Nombre de usuario
- Correo electrónico
- Rol asignado

Para modificar el nombre:
1. Hacer clic en **Editar**
2. Ingresar el nuevo nombre
3. Hacer clic en **Guardar**

### API Keys

Las API Keys permiten acceso programático a los datos mediante la API REST.

#### Generar una API Key

1. Navegar a **Perfil** → **API Keys**
2. Hacer clic en **Generar Nueva API Key**
3. Ingresar un nombre descriptivo (ej: "Script de análisis")
4. Hacer clic en **Generar**
5. **Importante:** Copiar la API Key mostrada. No se volverá a mostrar.

**Advertencia:** Trate la API Key como una contraseña. No la comparta ni la exponga en código público.

#### Revocar una API Key

1. En la lista de API Keys, hacer clic en **Revocar**
2. Confirmar la acción

Una vez revocada, la API Key deja de funcionar inmediatamente.

### Zona de Peligro

La sección **Zona de Peligro** contiene acciones irreversibles:

- **Eliminar cuenta**: Elimina permanentemente la cuenta y todos los datos asociados

**Advertencia:** Esta acción no se puede deshacer.

---

## Panel de Investigador

### Acceso

Disponible solo para usuarios con rol **INVESTIGADOR** o **ADMIN**.

Navegar a **Investigador** en el menú lateral.

### Funcionalidades

| Sección      | Descripción                                    |
| ------------ | ---------------------------------------------- |
| Dashboard    | Métricas globales de todos los usuarios        |
| Centros      | Vista de todos los centros de la plataforma    |
| Ciclos       | Vista de todos los ciclos                      |
| Registros    | Vista de todos los registros                   |
| Gráficos     | Visualización con datos agregados              |

**Diferencia con la vista normal:** El investigador ve datos de todos los usuarios, no solo los propios.

---

## Panel de Administración

### Acceso

Disponible solo para usuarios con rol **ADMIN**.

Navegar a **Admin** en el menú lateral.

### Gestión de Usuarios

1. Navegar a **Admin** → **Usuarios**
2. Se muestra la lista de usuarios registrados
3. Para cada usuario se puede:
   - Ver información (nombre, email, rol, estado)
   - Cambiar el rol (USUARIO, INVESTIGADOR, ADMIN)
   - Activar/desactivar la cuenta

### Gestión de Tipos de Medición

1. Navegar a **Admin** → **Tipos de Medición**
2. Crear, editar o eliminar tipos de medición
3. Cada tipo tiene:
   - Nombre
   - Unidad de medida
   - Descripción

### Gestión de Orígenes de Datos

1. Navegar a **Admin** → **Orígenes**
2. Crear, editar o eliminar orígenes de datos
3. Cada origen tiene:
   - Nombre
   - Descripción

### Biblioteca (Datos de Ejemplo)

1. Navegar a **Admin** → **Biblioteca**
2. Permite poblar la base de datos con datos de ejemplo
3. Útil para pruebas y demostraciones

---

## Preguntas Frecuentes

### ¿Cuánto tiempo es válida la sesión?

La sesión tiene una duración de **7 días**. Después de ese período, debe iniciar sesión nuevamente.

### ¿Puedo cambiar mi correo electrónico?

No. El correo electrónico es el identificador único de la cuenta. Si necesita cambiarlo, contacte al administrador.

### ¿Qué hago si no recibo el Magic Link?

1. Verificar que el correo electrónico sea correcto
2. Revisar la carpeta de **spam** o **correo no deseado**
3. Esperar unos minutos (puede haber demora en el envío)
4. Si el problema persiste, contactar al administrador

### ¿Cuántos intentos de login tengo?

- **Por IP**: 5 intentos cada 15 minutos
- **Por email**: 3 intentos cada 1 hora
- **Cooldown entre envíos**: 60 segundos

Si excede los límites, debe esperar antes de intentar nuevamente.

### ¿Puedo exportar datos de otros usuarios?

No. Los usuarios con rol **USUARIO** solo pueden exportar sus propios datos. Los usuarios con rol **INVESTIGADOR** o **ADMIN** pueden exportar datos de todos los usuarios.

### ¿Cómo obtengo permisos de investigador o administrador?

Contacte al administrador del sistema para solicitar un cambio de rol.

---

## Glosario de Términos

| Término         | Definición                                           |
| --------------- | ---------------------------------------------------- |
| Centro de cultivo | Ubicación geográfica donde se cultivan mitílidos   |
| Ciclo productivo | Período desde siembra hasta cosecha                 |
| Medición        | Dato registrado en un momento específico             |
| Magic Link      | Enlace de acceso único enviado por correo            |
| API Key         | Clave de acceso para integración programática        |
| Mitilicultura   | Cultivo de moluscos bivalvos (mejillones)            |
| PSMB            | Programa de Sanidad de Moluscos Bivalvos             |
| Talla           | Longitud del organismo (generalmente en mm)          |
| Biomasa         | Peso de los organismos (individual o total)          |
| Densidad        | Cantidad de organismos por unidad de área o volumen  |

---

## Contacto y Soporte

Para consultas técnicas o problemas con la plataforma:

- **Email de soporte**: [Configurar según implementación]
- **Documentación técnica**: Ver [docs/](./)

Para consultas sobre el proyecto o colaboración:

- **Institución ejecutora**: Universidad Santo Tomás
- **Brazo tecnológico**: INTEMIT