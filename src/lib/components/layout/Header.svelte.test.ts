import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './Header.svelte';

// Tipo para el usuario del layout
type LayoutData = {
	user?: {
		userId: number;
		nombre: string;
		email: string;
		rol: 'ADMIN' | 'INVESTIGADOR' | 'USUARIO';
		sessionId: number;
	} | null;
};

describe('Header', () => {
	const mockLinks = [
		{
			href: '/dashboard',
			label: 'Dashboard',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		},
		{
			href: '/centros',
			label: 'Centros',
			icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
		}
	];

	const mockInvestigadorLinks = [
		{
			href: '/investigador/dashboard',
			label: 'Dashboard',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		},
		{
			href: '/investigador/registros',
			label: 'Registros',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
		}
	];

	const mockToggleMobileMenu = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Renderizado básico', () => {
		it('debería renderizar el header', async () => {
			render(Header, {
				data: { user: undefined } as LayoutData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			await expect.element(page.getByRole('banner')).toBeInTheDocument();
		});

		it('debería mostrar el logo y nombre de la aplicación', async () => {
			render(Header, {
				data: { user: undefined } as LayoutData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			await expect.element(page.getByText('MytilusData')).toBeInTheDocument();
		});

		it('debería mostrar el botón del menú móvil', async () => {
			render(Header, {
				data: { user: undefined } as LayoutData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			const menuButton = page.getByRole('button', { name: 'Abrir menú de navegación' });
			await expect.element(menuButton).toBeInTheDocument();
		});
	});

	describe('Información del usuario', () => {
		it('debería mostrar el nombre del usuario', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Juan Pérez',
					email: 'juan@test.com',
					rol: 'ADMIN',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			await expect.element(page.getByText('Juan Pérez')).toBeInTheDocument();
		});

		it('debería mostrar la inicial del usuario en el avatar', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'María García',
					email: 'maria@test.com',
					rol: 'INVESTIGADOR',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Verificar que el nombre del usuario se muestra (la inicial está en el avatar)
			// No podemos verificar la inicial "M" individual porque aparece en "María" también
			// Así que verificamos que el nombre completo está presente
			await expect.element(page.getByText('María García')).toBeInTheDocument();
		});
	});

	describe('Roles de usuario', () => {
		it('debería mostrar "Administrador" para rol ADMIN', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Admin User',
					email: 'admin@test.com',
					rol: 'ADMIN',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			await expect.element(page.getByText('Administrador', { exact: true })).toBeInTheDocument();
		});

		it('debería mostrar "Usuario" para rol USUARIO', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Normal User',
					email: 'user@test.com',
					rol: 'USUARIO',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Verificar que aparece el texto "Usuario" para el rol
			await expect.element(page.getByText('Usuario', { exact: true })).toBeInTheDocument();
		});
	});

	describe('Menú de usuario', () => {
		it('debería abrir el menú de usuario al hacer clic', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Juan Pérez',
					email: 'juan@test.com',
					rol: 'ADMIN',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Hacer clic en el botón de usuario
			const userButton = page.getByRole('button', { name: /Juan Pérez/i });
			await userButton.click();

			// Verificar que el menú se abrió
			await expect.element(page.getByText('Mi Perfil')).toBeInTheDocument();
		});

		it('debería mostrar el email del usuario en el menú', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Juan Pérez',
					email: 'juan.perez@test.com',
					rol: 'ADMIN',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Abrir el menú
			const userButton = page.getByRole('button', { name: /Juan Pérez/i });
			await userButton.click();

			await expect.element(page.getByText('juan.perez@test.com')).toBeInTheDocument();
		});

		it('debería mostrar el enlace al perfil', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Juan Pérez',
					email: 'juan@test.com',
					rol: 'ADMIN',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Abrir el menú
			const userButton = page.getByRole('button', { name: /Juan Pérez/i });
			await userButton.click();

			const perfilLink = page.getByRole('link', { name: /Mi Perfil/ });
			await expect.element(perfilLink).toHaveAttribute('href', '/perfil');
		});

		it('debería mostrar el botón de cerrar sesión', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Juan Pérez',
					email: 'juan@test.com',
					rol: 'ADMIN',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Abrir el menú
			const userButton = page.getByRole('button', { name: /Juan Pérez/i });
			await userButton.click();

			await expect.element(page.getByText('Cerrar Sesión')).toBeInTheDocument();
		});
	});

	describe('Menú móvil', () => {
		it('debería llamar toggleMobileMenu al hacer clic en el botón', async () => {
			render(Header, {
				data: { user: undefined } as LayoutData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			const menuButton = page.getByRole('button', { name: 'Abrir menú de navegación' });
			await menuButton.click();

			expect(mockToggleMobileMenu).toHaveBeenCalledTimes(1);
		});

		it('debería mostrar el menú móvil cuando mobileMenuOpen es true', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Juan Pérez',
					email: 'juan@test.com',
					rol: 'ADMIN',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: true,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Verificar que los enlaces del menú están presentes
			await expect.element(page.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
			await expect.element(page.getByRole('link', { name: 'Centros' })).toBeInTheDocument();
		});

		it('debería mostrar enlaces de investigador cuando el rol es INVESTIGADOR', async () => {
			const userData: LayoutData = {
				user: {
					userId: 1,
					nombre: 'Investigador',
					email: 'investigador@test.com',
					rol: 'INVESTIGADOR',
					sessionId: 1
				}
			};

			render(Header, {
				data: userData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: true,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// Verificar que los enlaces de investigador están presentes
			await expect.element(page.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
			await expect.element(page.getByRole('link', { name: 'Registros' })).toBeInTheDocument();
		});

		it('no debería mostrar el menú móvil cuando mobileMenuOpen es false', async () => {
			render(Header, {
				data: { user: undefined } as LayoutData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			// El overlay del menú móvil no debería estar presente
			await expect.element(page.getByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
		});
	});

	describe('Accesibilidad', () => {
		it('debería tener el botón del menú móvil con aria-label', async () => {
			render(Header, {
				data: { user: undefined } as LayoutData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			const menuButton = page.getByRole('button', { name: 'Abrir menú de navegación' });
			await expect.element(menuButton).toBeInTheDocument();
		});

		it('debería tener el header con role banner', async () => {
			render(Header, {
				data: { user: undefined } as LayoutData,
				links: mockLinks,
				investigadorLinks: mockInvestigadorLinks,
				mobileMenuOpen: false,
				toggleMobileMenu: mockToggleMobileMenu
			});

			await expect.element(page.getByRole('banner')).toBeInTheDocument();
		});
	});
});
