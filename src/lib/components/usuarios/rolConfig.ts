export type RolKey = 'ADMIN' | 'INVESTIGADOR' | 'USUARIO';

export interface RolConfig {
	color: string;
	bg: string;
	label: string;
	dot: string;
}

export const rolConfig: Record<RolKey, RolConfig> = {
	ADMIN: {
		color: 'text-red-700 dark:text-red-400',
		bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30',
		label: 'Administrador',
		dot: 'bg-red-500'
	},
	INVESTIGADOR: {
		color: 'text-ocean-light',
		bg: 'bg-ocean-light/[0.08] border-ocean-light/15',
		label: 'Investigador',
		dot: 'bg-ocean-light'
	},
	USUARIO: {
		color: 'text-muted-foreground',
		bg: 'bg-secondary/50 border-border/50',
		label: 'Usuario',
		dot: 'bg-muted-foreground/50'
	}
};

export function getRolConfig(rol: string | null | undefined): RolConfig {
	return rolConfig[rol as RolKey] ?? rolConfig.USUARIO;
}