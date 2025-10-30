# Despliegue y CI/CD

Este proyecto está configurado para un despliegue continuo y automatizado utilizando la infraestructura de Vercel.

## Entorno de Producción

- **Dominio Oficial**: [https://www.mytilusdata.cl](https://www.mytilusdata.cl)
- **Plataforma**: [Vercel](https://vercel.com)
- **Base de Datos**: [Neon](https://neon.tech) (PostgreSQL Serverless) integrada a través del marketplace de Vercel.

## Flujo de CI/CD

El sistema utiliza **GitHub** como repositorio central y motor de integración continua:

1.  **Pull Requests**: Cada vez que se abre un PR hacia la rama `main`, Vercel genera un *Preview Deployment* único para validar los cambios.
2.  **Merge a Main**: Al realizar el merge a la rama principal, se dispara automáticamente el flujo de producción.
3.  **Build Automático**: Vercel ejecuta `npm run build`, optimizando los Server Components y generando los recursos estáticos.
4.  **Despliegue Inmediato**: Una vez finalizado el build de forma exitosa, el nuevo código se propaga a la red global de Vercel.

## Configuración de la Base de Datos

La base de datos reside en **Neon**, lo que permite una escalabilidad elástica:
- **Conectividad**: Se utiliza el pooler de conexiones de Neon para manejar fluctuaciones de tráfico.
- **Variables de Entorno**: Las credenciales se gestionan de forma segura en el panel de control de Vercel (`DATABASE_URL`, `DIRECT_URL`).
- **Prisma**: Se ejecutan las migraciones automáticamente durante el proceso de build remoto.

## Instrucciones para Mantenimiento

Para realizar cambios en la infraestructura o el dominio:
- Acceder al dashboard de Vercel asociado al proyecto.
- Los registros DNS para `www.mytilusdata.cl` están gestionados para apuntar automáticamente a los servidores de Vercel.
- Cualquier cambio en las variables de entorno requiere un *Redeploy* manual para que surtan efecto.
