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

test.describe('Configuración Avanzada', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('Gestión de Tipos de Registro', async ({ page }) => {
        await page.getByRole('link', { name: 'Configuración' }).click();
        await page.getByRole('tab', { name: 'Tipos de Registro' }).click();

        const codigo = `TEST${Math.floor(Math.random() * 1000)}`;
        const descripcion = 'Tipo de registro de prueba E2E';

        // 1. Crear
        await page.getByRole('button', { name: 'Nuevo Tipo de Registro' }).click();
        await page.locator('#t-codigo').fill(codigo);
        await page.locator('#t-descripcion').fill(descripcion);
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        await expect(page.getByText(codigo)).toBeVisible();

        // 2. Editar
        const row = page.locator('tr').filter({ hasText: codigo });
        await row.locator('button').first().click();

        const newDesc = `${descripcion} (Editado)`;
        await page.locator('#t-descripcion').fill(newDesc);
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        await expect(page.getByText(newDesc)).toBeVisible();

        // 3. Eliminar
        page.on('dialog', async dialog => {
            await dialog.accept();
        });
        const updatedRow = page.locator('tr').filter({ hasText: codigo });
        await updatedRow.locator('button').nth(1).click();
        await expect(page.getByText(codigo)).not.toBeVisible();
    });

    test('Gestión de Orígenes de Datos', async ({ page }) => {
        await page.getByRole('link', { name: 'Configuración' }).click();
        await page.getByRole('tab', { name: 'Orígenes' }).click();

        const nombre = `Origen ${Math.floor(Math.random() * 1000)}`;
        const descripcion = 'Origen de datos de prueba E2E';

        // 1. Crear
        await page.getByRole('button', { name: 'Nuevo Origen' }).click();
        await page.locator('#o-nombre').fill(nombre);
        await page.locator('#o-descripcion').fill(descripcion);
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        await expect(page.getByText(nombre)).toBeVisible();

        // 2. Editar
        const row = page.locator('tr').filter({ hasText: nombre });
        await row.locator('button').first().click();

        const newDesc = `${descripcion} (Editado)`;
        await page.locator('#o-descripcion').fill(newDesc);
        await page.getByRole('button', { name: 'Guardar', exact: true }).click();

        await expect(page.getByText(newDesc)).toBeVisible();

        // 3. Eliminar
        page.on('dialog', async dialog => {
            await dialog.accept();
        });
        const updatedRow = page.locator('tr').filter({ hasText: nombre });
        await updatedRow.locator('button').nth(1).click();
        await expect(page.getByText(nombre)).not.toBeVisible();
    });

    test('Gestión de API Keys', async ({ page }) => {
        await page.getByRole('link', { name: 'Configuración' }).click();
        await page.getByRole('tab', { name: 'API Keys' }).click();

        const nombreKey = `Key Playwright ${Math.floor(Math.random() * 1000)}`;

        // 1. Crear
        await page.getByRole('button', { name: 'Nueva API Key' }).click();
        await page.locator('#ak-nombre').fill(nombreKey);

        // Seleccionar algunos permisos (clic en la etiqueta que contiene el checkbox)
        await page.getByText('Lugares - Leer').click();
        await page.getByText('Mediciones - Escribir').click();

        await page.getByRole('button', { name: 'Crear API Key' }).click();

        // Verificar que se muestre la clave generada
        await expect(page.getByText('¡API Key Creada!')).toBeVisible();
        await expect(page.getByText(/myt_/i).first()).toBeVisible();

        await page.getByRole('button', { name: 'Entendido' }).click();

        // 2. Verificar en la lista
        await expect(page.getByText(nombreKey)).toBeVisible();

        // Verificar que la clave esté marcada como ACTIVA
        await expect(page.getByText('ACTIVA').first()).toBeVisible();
    });
});
