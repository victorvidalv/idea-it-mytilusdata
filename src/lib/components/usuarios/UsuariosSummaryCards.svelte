<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	export let totalUsers: number;
	export let investigators: number;
	export let admins: number;
</script>

<div class="animate-fade-up grid gap-5 delay-75 md:grid-cols-3">
	<div class="card-hover">
		<Card.Root class="overflow-hidden border-border/50">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="font-body text-sm font-medium text-muted-foreground"
					>Total Usuarios</Card.Title
				>
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-mid/10">
					<svg
						class="h-[18px] w-[18px] text-ocean-mid"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.75"
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
						/>
					</svg>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="font-display text-3xl">{totalUsers}</div>
				<p class="mt-1 font-body text-xs text-muted-foreground">Registrados en la plataforma</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="card-hover">
		<Card.Root class="overflow-hidden border-border/50">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="font-body text-sm font-medium text-muted-foreground"
					>Investigadores</Card.Title
				>
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-light/10">
					<svg
						class="h-[18px] w-[18px] text-ocean-light"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.75"
							d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="font-display text-3xl">{investigators}</div>
				<p class="mt-1 font-body text-xs text-muted-foreground">Con acceso a datos globales</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="card-hover">
		<Card.Root class="overflow-hidden border-border/50">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="font-body text-sm font-medium text-muted-foreground"
					>Administradores</Card.Title
				>
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
					<svg
						class="h-[18px] w-[18px] text-red-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.75"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="font-display text-3xl">{admins}</div>
				<p class="mt-1 font-body text-xs text-muted-foreground">Con control total del sistema</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>