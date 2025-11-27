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

test.describe('Gestión de Unidades', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('debe permitir crear, editar y eliminar una unidad de medida', async ({ page }) => {
        // Navegar a la sección de Configuración
        await page.getByRole('link', { name: 'Configuración' }).click();
        await expect(page).toHaveURL(/.*configuracion/);

        // Asegurarse de que la pestaña de Unidades esté activa
        await page.getByRole('tab', { name: 'Unidades' }).click();

        const unitName = `Unidad Playwright ${Math.floor(Math.random() * 1000)}`;
        const symbol = 'PW';

        // 1. CREACIÓN DE UNIDAD
        await page.getByRole('button', { name: 'Nueva Unidad' }).click();

        // Rellenar formulario 
        await page.locator('#u-nombre').fill(unitName);
        await page.locator('#u-sigla').fill(symbol);

        // Guardar
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        // Verificar que aparezca en la lista
        await expect(page.getByText(unitName)).toBeVisible();

        // 2. EDICIÓN DE UNIDAD
        const row = page.locator('tr').filter({ hasText: unitName });
        await row.locator('button').first().click();

        const newUnitName = `${unitName} (Editado)`;
        const newSymbol = 'PE';

        await page.locator('#u-nombre').fill(newUnitName);
        await page.locator('#u-sigla').fill(newSymbol);

        // Actualizar
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        // Verificar actualización en la tabla
        await expect(page.getByText(newUnitName)).toBeVisible();
        await expect(page.getByText(newSymbol)).toBeVisible();

        // 3. ELIMINACIÓN DE UNIDAD
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        const updatedRow = page.locator('tr').filter({ hasText: newUnitName });
        await updatedRow.locator('button').nth(1).click();

        // Verificar que la unidad ya no esté en la tabla
        await expect(page.getByText(newUnitName)).not.toBeVisible();
    });
});
