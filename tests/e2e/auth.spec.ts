import { test, expect, Page } from '@playwright/test';

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

        // Esperar a que el formulario esté listo (CSRF token)
        const loginButton = page.getByRole('button', { name: 'Entrar al Sistema' });
        await expect(loginButton).toBeEnabled({ timeout: 10000 });

        // Cambiar a la pestaña de registro
        await page.getByRole('tab', { name: 'Registrarse' }).click();

        // Llenar el formulario de registro
        await page.locator('#name').fill(testUser.name);
        await page.locator('#reg-email').fill(testUser.email);
        await page.locator('#reg-password').fill(testUser.password);

        // Click en crear cuenta
        await page.getByRole('button', { name: 'Crear mi Cuenta' }).click();

        // Debería redirigir al dashboard tras un registro exitoso
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    });

    test('debe permitir el inicio de sesión con el administrador del sistema', async ({ page }) => {
        // Datos del environment o fallback a los del seed si no existen
        const adminUser = {
            email: process.env.E2E_ADMIN_EMAIL || 'victorvidalv@gmail.com',
            password: process.env.E2E_ADMIN_PASSWORD || 'aveces123'
        };

        await page.goto('/login');

        // Esperar a que el formulario esté listo (CSRF token)
        const loginButton = page.getByRole('button', { name: 'Entrar al Sistema' });
        await expect(loginButton).toBeEnabled({ timeout: 10000 });

        // Llenar datos de login (pestaña por defecto)
        await page.locator('#login-email').fill(adminUser.email);
        await page.locator('#login-password').fill(adminUser.password);

        // Click en entrar al sistema
        await loginButton.click();

        // Verificar redirección
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    });

    test('debe mostrar error con credenciales inválidas', async ({ page }) => {
        await page.goto('/login');

        // Esperar a que el formulario esté listo (CSRF token)
        const loginButton = page.getByRole('button', { name: 'Entrar al Sistema' });
        await expect(loginButton).toBeEnabled({ timeout: 10000 });

        // Limpiar inputs si es necesario (en Playwright fresh context no es necesario)
        await page.locator('#login-email').fill('no-existe@ejemplo.com');
        await page.locator('#login-password').fill('PasswordIncorrecto123!');

        await loginButton.click();

        // Debería mostrar un mensaje de error
        const errorContainer = page.locator('.text-destructive');
        await expect(errorContainer).toBeVisible({ timeout: 10000 });
    });
});
