import { test, expect } from '@playwright/test';

test.describe('Gestión de Mediciones', () => {

    test.beforeEach(async ({ page }) => {
        // Iniciar sesión usando variables de entorno
        await page.goto('/login');
        await page.locator('#login-email').fill(process.env.E2E_ADMIN_EMAIL || 'victorvidalv@gmail.com');
        await page.locator('#login-password').fill(process.env.E2E_ADMIN_PASSWORD || 'aveces123');
        await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('debe permitir crear, editar y eliminar una medición', async ({ page }) => {
        // Navegar a Mediciones
        await page.getByRole('link', { name: 'Mediciones' }).click();
        await expect(page).toHaveURL(/.*mediciones/);

        const valorInicial = '42.5';
        const valorEditado = '55.8';
        const notaUnica = `Test E2E ${Math.floor(Math.random() * 10000)}`;
        const fechaHoy = new Date().toISOString().split('T')[0];

        // 1. CREACIÓN
        await page.getByRole('button', { name: 'Nueva Medición' }).click();

        // Rellenar formulario
        await page.locator('#m-fecha').fill(fechaHoy);
        await page.locator('#m-valor').fill(valorInicial);

        // Seleccionables (estándar HTML selects según mediciones-form.tsx)
        await page.locator('select').nth(0).selectOption({ label: 'Centro de Pruebas' });
        // El segundo select es Ciclo (opcional, dejamos por defecto)
        await page.locator('select').nth(2).selectOption({ label: 'Estación de Campo' });
        await page.locator('select').nth(3).selectOption({ label: 'kg' });
        await page.locator('select').nth(4).selectOption({ label: 'REG' });

        await page.locator('#m-notas').fill(notaUnica);

        await page.getByRole('button', { name: 'Crear ahora' }).click();

        // Verificar que aparece (puede tardar un momento en recargar)
        await expect(page.getByText(notaUnica)).toBeVisible();

        // 2. EDICIÓN
        const row = page.locator('tr').filter({ hasText: notaUnica });
        // El primer botón en la columna de acciones es Edit
        await row.getByRole('button').first().click();

        await page.locator('#m-valor').fill(valorEditado);
        await page.locator('#m-notas').fill(`${notaUnica} - Editada`);

        await page.getByRole('button', { name: 'Actualizar ahora' }).click();

        // Esperar a que el modal se cierre
        await expect(page.getByRole('button', { name: 'Actualizar ahora' })).not.toBeVisible();

        // Verificar actualización en la tabla usando fila específica
        const updatedRowVerif = page.locator('tr').filter({ hasText: `${notaUnica} - Editada` });
        await expect(updatedRowVerif).toBeVisible();
        await expect(updatedRowVerif.getByText(valorEditado)).toBeVisible();

        // 3. ELIMINACIÓN
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        const updatedRow = page.locator('tr').filter({ hasText: `${notaUnica} - Editada` });
        // El segundo botón es Delete
        await updatedRow.getByRole('button').nth(1).click();

        // Verificar desaparición
        await expect(page.getByText(`${notaUnica} - Editada`)).not.toBeVisible();
    });
});
