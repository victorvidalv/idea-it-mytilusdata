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

test.describe('Gestión de Ciclos de Cultivo', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('debe permitir crear, editar y eliminar un ciclo de cultivo', async ({ page }) => {
        // Navegar a la sección de Ciclos
        await page.getByRole('link', { name: 'Ciclos' }).click();
        await expect(page).toHaveURL(/.*ciclos/);

        const cicloName = `Ciclo Playwright ${Math.floor(Math.random() * 1000)}`;
        const notaInicial = 'Nota de prueba automatizada para el ciclo';
        const fechaHoy = new Date().toISOString().split('T')[0];

        // 1. CREACIÓN DE CICLO
        await page.getByRole('button', { name: 'Nuevo Ciclo' }).click();

        // Rellenar formulario
        await page.locator('#nombre').fill(cicloName);

        // Seleccionar Centro de Pruebas (asumiendo que existe por el seed)
        // El select es un componente de Radix, así que interactuamos con el trigger y luego la opción
        await page.locator('#lugar_id').click();
        await page.getByRole('option', { name: 'Centro de Pruebas' }).click();

        await page.locator('#fecha_siembra').fill(fechaHoy);
        await page.locator('#notas').fill(notaInicial);

        // Asegurarse de que esté activo (el switch suele estar activo por defecto o lo forzamos)
        const activeSwitch = page.locator('button#activo');
        const isChecked = await activeSwitch.getAttribute('aria-checked');
        if (isChecked !== 'true') {
            await activeSwitch.click();
        }

        // Guardar
        await page.getByRole('button', { name: 'Crear' }).click();

        // Verificar que aparezca en la lista
        await expect(page.getByText(cicloName)).toBeVisible();

        // 2. EDICIÓN DE CICLO
        // Localizar la fila y el botón de editar
        const row = page.locator('tr').filter({ hasText: cicloName });
        // En ciclos-table, el primer botón en la última celda es Edit
        await row.getByRole('button').first().click();

        const newCicloName = `${cicloName} (Editado)`;
        const newNota = 'Nota de ciclo actualizada por el test';

        await page.locator('#nombre').fill(newCicloName);
        await page.locator('#notas').fill(newNota);

        await page.getByRole('button', { name: 'Actualizar' }).click();

        // Esperar a que el modal se cierre
        await expect(page.getByRole('button', { name: 'Actualizar' })).not.toBeVisible();

        // Verificar actualización en la tabla (usando la fila específica para evitar ambigüedad)
        const updatedRowVerif = page.locator('tr').filter({ hasText: newCicloName });
        await expect(updatedRowVerif).toBeVisible();
        await expect(updatedRowVerif.getByText(newNota)).toBeVisible();

        // 3. ELIMINACIÓN DE CICLO
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        const updatedRow = page.locator('tr').filter({ hasText: newCicloName });
        // Usar aria-label para mayor precisión
        await updatedRow.getByLabel(/Eliminar|delete/i).click({ force: true });

        // Verificar que ya no esté (esperar a que el texto desaparezca de la tabla)
        await expect(page.locator('tbody')).not.toContainText(newCicloName, { timeout: 15000 });
        await expect(page.getByText(newCicloName)).not.toBeVisible({ timeout: 5000 });
    });
});
