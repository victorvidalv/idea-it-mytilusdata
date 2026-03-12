<script lang="ts">
</script>

<section class="rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
	<div class="mb-6">
		<h2 class="text-xl font-semibold">¿Cómo usar la API?</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Ejemplos de cómo puedes consultar tus datos desde otras aplicaciones locales o servidores.
		</p>
	</div>

	<div class="space-y-6">
		<div class="space-y-3">
			<h3 class="font-medium">1. Autenticación</h3>
			<p class="text-sm text-muted-foreground">
				Debes enviar la API Key en las cabeceras (headers) de tus peticiones HTTP usando el
				formato Bearer Token.
			</p>
			<div class="rounded-xl border border-border/50 bg-secondary/30 p-4">
				<code class="text-ocean-dark font-mono text-sm dark:text-ocean-light"
					>Authorization: Bearer tu_api_key_aqui</code
				>
			</div>
		</div>

		<div class="space-y-3">
			<h3 class="font-medium">2. Endpoints Disponibles</h3>
			<div class="space-y-4">
				<!-- Endpoint 1 -->
				<div class="space-y-2 rounded-xl border border-border/50 bg-background p-4">
					<div class="flex items-center gap-2">
						<span
							class="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold tracking-wider text-green-600 uppercase dark:text-green-400"
							>GET</span
						>
						<code class="font-mono text-sm">/api/registros</code>
					</div>
					<p class="text-sm text-muted-foreground">
						Retorna el listado completo de todos los registros de mediciones y datos históricos
						que has ingresado o sincronizado.
					</p>
				</div>

				<!-- Endpoint 2 -->
				<div class="space-y-2 rounded-xl border border-border/50 bg-background p-4">
					<div class="flex items-center gap-2">
						<span
							class="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold tracking-wider text-green-600 uppercase dark:text-green-400"
							>GET</span
						>
						<code class="font-mono text-sm">/api/ciclos</code>
					</div>
					<p class="text-sm text-muted-foreground">
						Retorna los ciclos de cultivo asociados a tu cuenta de investigador.
					</p>
				</div>

				<!-- Endpoint 3 -->
				<div class="space-y-2 rounded-xl border border-border/50 bg-background p-4">
					<div class="flex items-center gap-2">
						<span
							class="rounded bg-green-500/10 px-2 py-0.5 text-xs font-bold tracking-wider text-green-600 uppercase dark:text-green-400"
							>GET</span
						>
						<code class="font-mono text-sm">/api/centros</code>
					</div>
					<p class="text-sm text-muted-foreground">
						Retorna los centros de cultivo (lugares) asociados a tu cuenta.
					</p>
				</div>
			</div>
		</div>

		<div class="space-y-3">
			<h3 class="font-medium">3. Ejemplo con cURL</h3>
			<div
				class="overflow-x-auto rounded-xl bg-[#1e1e1e] p-4 font-mono text-sm leading-relaxed text-emerald-400"
			>
				curl -X GET \<br />
				&nbsp;&nbsp;https://plataforma.mytilusdata.cl/api/registros \<br />
				&nbsp;&nbsp;-H "Authorization: Bearer tu_api_key_aqui"
			</div>
		</div>
	</div>
</section>