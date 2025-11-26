import { test, expect } from '@playwright/test';

test.describe('Gestión de Unidades', () => {

    test.beforeEach(async ({ page }) => {
        // Iniciar sesión como administrador
        await page.goto('/login');
        await page.locator('#login-email').fill(process.env.E2E_ADMIN_EMAIL || 'victorvidalv@gmail.com');
        await page.locator('#login-password').fill(process.env.E2E_ADMIN_PASSWORD || 'aveces123');
        await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

        // Esperar a que el dashboard cargue
        await expect(page).toHaveURL(/.*dashboard/);
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
        // Los IDs son u-nombre y u-sigla según el código de la página
        await page.locator('#u-nombre').fill(unitName);
        await page.locator('#u-sigla').fill(symbol);

        // Guardar
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        // Verificar que aparezca en la lista
        await expect(page.getByText(unitName)).toBeVisible();
        await expect(page.getByText(symbol)).toBeVisible();

        // 2. EDICIÓN DE UNIDAD
        // Localizar la fila y el botón de editar
        const row = page.locator('tr').filter({ hasText: unitName });
        // El botón de editar es el primero en la fila de acciones
        await row.locator('button').first().click();

        const newUnitName = `${unitName} (Editada)`;
        const newSymbol = 'PX';

        await page.locator('#u-nombre').fill(newUnitName);
        await page.locator('#u-sigla').fill(newSymbol);

        // Actualizar
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        // Verificar actualización en la tabla
        await expect(page.getByText(newUnitName)).toBeVisible();
        await expect(page.getByText(newSymbol)).toBeVisible();

        // 3. ELIMINACIÓN DE UNIDAD
        // Preparar el manejo del diálogo de confirmación nativo (confirmatión del navegador)
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('¿Estás seguro');
            await dialog.accept();
        });

        const updatedRow = page.locator('tr').filter({ hasText: newUnitName });
        // El segundo botón de la fila es el de eliminar
        await updatedRow.locator('button').nth(1).click();

        // Verificar que la unidad ya no esté en la tabla
        await expect(page.getByText(newUnitName)).not.toBeVisible();
    });
});
