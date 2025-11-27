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

test.describe('Análisis de Datos', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('Carga de página y configuración de series', async ({ page }) => {
        await page.getByRole('link', { name: 'Análisis' }).click();
        await expect(page).toHaveURL(/.*analisis/);

        // Verificar título
        await expect(page.getByRole('heading', { name: 'Análisis' })).toBeVisible();

        // Verificar componentes base
        await expect(page.getByText(/Analiza los datos de mediciones/i)).toBeVisible();

        // Verificar que exista la sección de configuración
        await expect(page.getByText('Configurar Gráfico')).toBeVisible();
    });
});
