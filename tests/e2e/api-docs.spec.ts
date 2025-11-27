import { test, expect, Page } from '@playwright/test';

/**
 * Función de login reutilizable que espera a que el botón esté habilitado (CSRF listo)
 */
async function loginAsAdmin(page: Page) {
    await page.goto('/login');

    // Esperar a que el formulario esté listo (CSRF token)
    const loginButton = page.getByRole('button', { name: 'Entrar al Sistema' });
    await expect(loginButton).toBeEnabled({ timeout: 10000 });

    await page.locator('#login-email').fill(process.env.E2E_ADMIN_EMAIL || 'victorvidalv@gmail.com');
    await page.locator('#login-password').fill(process.env.E2E_ADMIN_PASSWORD || 'aveces123');
    await loginButton.click();

    // Esperar redirección con timeout extendido
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
}

test.describe('Documentación API', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('debe cargar la documentación de la API para administradores', async ({ page }) => {
        await page.getByRole('link', { name: 'Documentación API' }).click();
        await expect(page).toHaveURL(/.*api-docs/);

        // Verificar secciones principales
        await expect(page.getByRole('heading', { name: 'Documentación de la API' })).toBeVisible();
        await expect(page.getByText('Inicio Rápido')).toBeVisible();
        await expect(page.getByText('Autenticación', { exact: true })).toBeVisible();
        await expect(page.getByText('Endpoints', { exact: true })).toBeVisible();

        // Verificar tabs de endpoints
        await page.getByRole('tab', { name: 'Ciclos' }).click();
        await expect(page.getByText('/api/v1/ciclos').first()).toBeVisible();

        await page.getByRole('tab', { name: 'Unidades' }).click();
        await expect(page.getByText('/api/v1/unidades').first()).toBeVisible();

        // Verificar ejemplos de código
        await expect(page.getByText('Ejemplos de Código')).toBeVisible();
        await page.getByRole('tab', { name: 'Python' }).click();
        await expect(page.getByText('import requests')).toBeVisible();
    });
});
