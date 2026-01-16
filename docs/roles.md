# Sistema de Roles y Permisos — Plataforma Idea 2025

## 1. Descripción General

La plataforma implementa un sistema de **Control de Acceso Basado en Roles (RBAC)** con tres niveles jerárquicos. Todo usuario nuevo que se registre obtiene automáticamente el rol más básico. Los roles superiores solo pueden ser asignados por un Administrador.

---

## 2. Definición de Roles

### 2.1 Usuario (`USUARIO`)

El rol predeterminado para **cualquier persona que se registra** en la plataforma.

| Capacidad               | Descripción                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| Agregar datos           | Registrar centros de cultivo, ciclos productivos y mediciones propias        |
| Ver datos propios       | Acceder **únicamente** a sus propios registros (centros, ciclos, mediciones) |
| Modificar datos propios | Editar o eliminar sus propios registros                                      |

> **Restricción:** No puede ver datos de otros usuarios ni acceder a información general consolidada de centros.

---

### 2.2 Investigador (`INVESTIGADOR`)

Usuario con privilegios extendidos, pensado para **investigadores del equipo** que necesitan una vista panorámica de los datos.

| Capacidad                   | Descripción                                                                   |
| --------------------------- | ----------------------------------------------------------------------------- |
| Todo lo de Usuario          | Conserva todas las capacidades del rol Usuario                                |
| Vista general de centros    | Acceder a información general de **todos** los centros de cultivo registrados |
| Datos de múltiples usuarios | Consultar mediciones, ciclos y registros de cualquier usuario del sistema     |
| Análisis comparativo        | Comparar datos entre centros y ciclos de distintos productores                |

> **Restricción:** No puede modificar datos de otros usuarios ni administrar cuentas.

---

### 2.3 Administrador (`ADMIN`)

Rol de gestión total del sistema, reservado para **administradores de la plataforma**.

| Capacidad                  | Descripción                                     |
| -------------------------- | ----------------------------------------------- |
| Todo lo de Investigador    | Conserva todas las capacidades de Investigador  |
| Administrar usuarios       | Acceder al panel de administración de usuarios  |
| Cambiar roles              | Promover o degradar el rol de cualquier usuario |
| Activar/desactivar cuentas | Habilitar o deshabilitar el acceso de usuarios  |

> **Nota:** El administrador por defecto es el correo definido en la variable de entorno `ADMIN_EMAIL`. Este usuario obtiene rol `ADMIN` automáticamente al registrarse.

---

## 3. Flujo de Asignación de Roles

```
┌─────────────────────────────────────────────┐
│               Registro Nuevo                │
│    (Magic Link → correo electrónico)        │
└─────────────┬───────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  ¿Email == ADMIN_   │──── Sí ──▶  Rol: ADMIN
    │     EMAIL?          │
    └─────────┬───────────┘
              │ No
              ▼
        Rol: USUARIO
```

### Promoción de Roles

1. Un **Administrador** accede al panel de administración (`/admin/usuarios`)
2. Busca al usuario deseado
3. Cambia su rol a `INVESTIGADOR` o `ADMIN`
4. El cambio se refleja inmediatamente en la siguiente sesión del usuario

---

## 4. Matriz de Permisos por Ruta

| Recurso / Acción          |      USUARIO       |     INVESTIGADOR     | ADMIN |
| ------------------------- | :----------------: | :------------------: | :---: |
| `/dashboard`              | ✅ (datos propios) | ✅ (datos generales) |  ✅   |
| `/centros` — ver propios  |         ✅         |          ✅          |  ✅   |
| `/centros` — ver de otros |         ❌         |          ✅          |  ✅   |
| `/ciclos` — ver propios   |         ✅         |          ✅          |  ✅   |
| `/ciclos` — ver de otros  |         ❌         |          ✅          |  ✅   |
| Agregar registros propios |         ✅         |          ✅          |  ✅   |
| `/admin/usuarios`         |         ❌         |          ❌          |  ✅   |
| Cambiar roles             |         ❌         |          ❌          |  ✅   |

---

## 5. Implementación Técnica

### 5.1 Base de Datos

La tabla `usuarios` contiene un campo `rol` con los valores posibles:

- `USUARIO` (valor por defecto)
- `INVESTIGADOR`
- `ADMIN`

### 5.2 Autenticación

- El rol se incluye en el **JWT** al momento de generar la sesión
- El middleware (`hooks.server.ts`) verifica el token y expone `locals.user.rol`

### 5.3 Autorización en Servidor

- Las rutas de `/admin/*` verifican que `locals.user.rol === 'ADMIN'`
- Las consultas a base de datos filtran por `userId` para el rol `USUARIO`
- Los roles `INVESTIGADOR` y `ADMIN` omiten el filtro por usuario

### 5.4 Variable de Entorno

| Variable      | Ejemplo                  | Descripción                          |
| ------------- | ------------------------ | ------------------------------------ |
| `ADMIN_EMAIL` | `victorvidalv@gmail.com` | Correo del administrador por defecto |
