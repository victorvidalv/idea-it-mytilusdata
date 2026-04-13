// Componentes del dashboard
export { default as DashboardStatCard } from './DashboardStatCard.svelte';
export { default as DashboardChartPlaceholder } from './DashboardChartPlaceholder.svelte';
export { default as DashboardActivityAlerts } from './DashboardActivityAlerts.svelte';

// Configuración de tarjetas de estadísticas
export const STAT_CARDS_CONFIG = [
	{
		label: 'Centros Activos',
		valueKey: 'centros' as const,
		empty: 'Sin centros registrados',
		icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
		accent: 'from-ocean-light to-teal-glow',
		iconBg: 'bg-ocean-light/10 text-ocean-light'
	},
	{
		label: 'Ciclos en Curso',
		valueKey: 'ciclosActivos' as const,
		empty: 'Ningún ciclo iniciado',
		icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
		accent: 'from-teal-glow to-green-400',
		iconBg: 'bg-teal-glow/10 text-teal-glow'
	},
	{
		label: 'Mediciones este Mes',
		valueKey: 'medicionesMes' as const,
		empty: 'Registre Talla o Biomasa',
		icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
		accent: 'from-blue-400 to-ocean-light',
		iconBg: 'bg-blue-500/10 text-blue-500'
	}
] as const;