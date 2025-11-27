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

test.describe('Gestión de Lugares', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('debe permitir crear, editar y eliminar un lugar con coordenadas y nombres distintos', async ({ page }) => {
        // Navegar a la sección de Lugares
        await page.getByRole('link', { name: 'Lugares' }).click();
        await expect(page).toHaveURL(/.*lugares/);

        const lugarName = `Centro de Cultivo Playwright ${Math.floor(Math.random() * 1000)}`;
        const notaInicial = 'Ubicación de prueba automatizada';

        // 1. CREACIÓN DE LUGAR
        await page.getByRole('button', { name: 'Nuevo Lugar' }).click();

        // Rellenar formulario
        await page.locator('#nombre').fill(lugarName);
        await page.locator('#nota').fill(notaInicial);

        // Interactuar con el mapa para fijar una coordenada
        // Hacemos clic en una posición específica del contenedor de Leaflet
        await page.locator('.leaflet-container').click({ position: { x: 200, y: 150 } });

        // Verificar que las coordenadas ya no digan "Pendiente..." 
        // (Nota: En el código dice t('pendingCoordinates') que es "Pendiente...")
        const latText = page.locator('p.text-sm.font-mono').first();
        await expect(latText).not.toHaveText('Pendiente...');

        // Guardar el lugar
        await page.getByRole('button', { name: 'Confirmar' }).click();

        // Verificar que aparezca en la lista
        await expect(page.getByText(lugarName)).toBeVisible();

        // 2. EDICIÓN DE LUGAR
        // Localizar la fila y el botón de editar
        const row = page.locator('tr').filter({ hasText: lugarName });
        // El primer botón de la fila es el de editar (Edit2 icon)
        await row.locator('button').first().click();

        const newLugarName = `${lugarName} (Editado)`;
        const newNota = 'Nota actualizada por el test';

        await page.locator('#nombre').fill(newLugarName);
        await page.locator('#nota').fill(newNota);

        // Cambiar la posición en el mapa para tener coordenadas distintas
        await page.locator('.leaflet-container').click({ position: { x: 100, y: 100 } });

        await page.getByRole('button', { name: 'Confirmar' }).click();

        // Verificar actualización en la tabla
        await expect(page.getByText(newLugarName)).toBeVisible();
        await expect(page.getByText(newNota)).toBeVisible();

        // 3. ELIMINACIÓN DE LUGAR
        // Preparar el manejo del diálogo de confirmación nativo de la edición/eliminación
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('¿Estás seguro');
            await dialog.accept();
        });

        const updatedRow = page.locator('tr').filter({ hasText: newLugarName });
        // El segundo botón de la fila es el de eliminar (Trash2 icon)
        await updatedRow.locator('button').nth(1).click();

        // Verificar que el lugar ya no esté en la tabla
        await expect(page.getByText(newLugarName)).not.toBeVisible();
    });
});
