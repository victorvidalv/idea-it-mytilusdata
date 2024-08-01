# Simulador de Crecimiento

Aplicación web para el seguimiento y simulación del crecimiento de cultivos de mejillones en centros de cultivo.

## Características

- Registro y autenticación de usuarios
- Gestión de centros de cultivo
- Registro de mediciones de crecimiento
- Visualización de datos en gráficos
- Mapas interactivos con vista satelital
- Interfaz responsiva y moderna

## Requisitos

- Node.js 14.x o superior
- NPM 6.x o superior
- SQLite 3

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/simulador.git
cd simulador
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con tus configuraciones.

4. Iniciar la aplicación:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
simulador/
├── app.js              # Punto de entrada de la aplicación
├── models/             # Modelos de datos
├── routes/             # Rutas de la aplicación
├── middleware/         # Middleware personalizado
├── views/             # Vistas EJS
│   ├── auth/          # Vistas de autenticación
│   ├── centers/       # Vistas de centros
│   └── partials/      # Componentes reutilizables
├── public/            # Archivos estáticos
└── db/                # Base de datos SQLite
```

## Tecnologías Utilizadas

- Express.js - Framework web
- SQLite - Base de datos
- EJS - Motor de plantillas
- Tailwind CSS - Framework CSS
- Leaflet - Mapas interactivos
- Chart.js - Gráficos
- JWT - Autenticación

## Desarrollo

Para ejecutar la aplicación en modo desarrollo con recarga automática:

```bash
npm run dev
```

## Licencia

MIT 