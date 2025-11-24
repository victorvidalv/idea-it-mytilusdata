import { test, expect } from '@playwright/test';

test.describe('Flujo de Autenticación', () => {

    test('debe permitir el registro de un nuevo usuario y entrar al dashboard', async ({ page }) => {
        const randomSuffix = Math.floor(Math.random() * 1000000);
        const testUser = {
            name: 'Usuario de Prueba',
            email: `test-${randomSuffix}@example.com`,
            password: 'Password123!'
        };

        // Navegar a la página de login
        await page.goto('/login');

        // Cambiar a la pestaña de registro
        await page.getByRole('tab', { name: 'Registrarse' }).click();

        // Llenar el formulario de registro
        await page.locator('#name').fill(testUser.name);
        await page.locator('#reg-email').fill(testUser.email);
        await page.locator('#reg-password').fill(testUser.password);

        // Click en crear cuenta
        await page.getByRole('button', { name: 'Crear mi Cuenta' }).click();

        // Debería redirigir al dashboard tras un registro exitoso
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('debe permitir el inicio de sesión con el administrador del sistema', async ({ page }) => {
        // Datos del environment o fallback a los del seed si no existen
        const adminUser = {
            email: process.env.E2E_ADMIN_EMAIL || 'victorvidalv@gmail.com',
            password: process.env.E2E_ADMIN_PASSWORD || 'aveces123'
        };

        await page.goto('/login');

        // Llenar datos de login (pestaña por defecto)
        await page.locator('#login-email').fill(adminUser.email);
        await page.locator('#login-password').fill(adminUser.password);

        // Click en entrar al sistema
        await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

        // Verificar redirección
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('debe mostrar error con credenciales inválidas', async ({ page }) => {
        await page.goto('/login');

        // Limpiar inputs si es necesario (en Playwright fresh context no es necesario)
        await page.locator('#login-email').fill('no-existe@ejemplo.com');
        await page.locator('#login-password').fill('PasswordIncorrecto123!');

        await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

        // Debería mostrar un mensaje de error según el JSON de traducciones
        const errorMsg = page.getByText('Email o contraseña inválidos');
        await expect(errorMsg).toBeVisible();
    });
});
