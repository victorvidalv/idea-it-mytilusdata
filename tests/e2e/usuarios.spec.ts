import { test, expect } from '@playwright/test';

test.describe('Gestión de Usuarios', () => {

    test.beforeEach(async ({ page }) => {
        // Iniciar sesión usando variables de entorno
        await page.goto('/login');
        await page.locator('#login-email').fill(process.env.E2E_ADMIN_EMAIL || 'victorvidalv@gmail.com');
        await page.locator('#login-password').fill(process.env.E2E_ADMIN_PASSWORD || 'aveces123');
        await page.getByRole('button', { name: 'Entrar al Sistema' }).click();

        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('debe permitir crear, cambiar rol y desactivar/activar un usuario', async ({ page }) => {
        // Navegar a Usuarios
        await page.getByRole('link', { name: 'Usuarios' }).click();
        await expect(page).toHaveURL(/.*usuarios/);

        const userName = `Usuario Test ${Math.floor(Math.random() * 1000)}`;
        const userEmail = `test.user.${Date.now()}@example.com`;
        const userPass = 'Playwright123!';

        // 1. CREACIÓN
        await page.getByRole('button', { name: 'Nuevo Usuario' }).click();

        await page.locator('#nombre').fill(userName);
        await page.locator('#email').fill(userEmail);
        await page.locator('#password').fill(userPass);
        await page.locator('#rol').selectOption('EQUIPO');

        await page.getByRole('button', { name: 'Crear' }).click();

        // Verificar visibilidad
        await expect(page.getByText(userName)).toBeVisible();
        await expect(page.getByText(userEmail)).toBeVisible();

        // 2. EDICIÓN (Cambio de Rol)
        const row = page.locator('tr').filter({ hasText: userEmail });
        // Cambiar rol de EQUIPO a ADMIN
        await row.locator('select').selectOption('ADMIN');

        // El cambio de rol es automático en la UI al cambiar el select
        // Verificamos el badge o simplemente que el select mantenga el valor
        await expect(row.locator('select')).toHaveValue('ADMIN');

        // 3. DESACTIVACIÓN / ACTIVACIÓN
        // Desactivar
        await row.getByRole('button', { name: 'Desactivar' }).click();
        await expect(row.getByText('INACTIVO')).toBeVisible({ timeout: 10000 });
        await expect(row.getByRole('button', { name: 'Activar' })).toBeVisible();

        // Reactivar
        await row.getByRole('button', { name: 'Activar' }).click();
        await expect(row.getByText('ACTIVO')).toBeVisible({ timeout: 10000 });
        await expect(row.getByRole('button', { name: 'Desactivar' })).toBeVisible();
    });
});
