src/routes/
├── (public)/                 # Zona de difusión e información general
│   ├── +layout.svelte        # Layout con navegación pública (Landing, Docs)
│   ├── +page.svelte          # Home: Propuesta de valor y bienvenida [cite: 5]
│   ├── metodologia/          # Detalle del TRL 4 y avance al TRL 7 [cite: 167]
│   ├── estado-del-arte/      # Investigación y biología de M. chilensis [cite: 204]
│   └── contacto/             # Formulario de vinculación sectorial [cite: 10]
│
├── (app)/                    # Zona de Gestión (Protegida por Auth)
│   ├── +layout.svelte        # Layout de Dashboard (Sidebar, Perfil Usuario)
│   ├── dashboard/            # Vista consolidada de centros y alertas [cite: 120, 149]
│   ├── centros/              # Gestión de 'Lugares' (Centros de Cultivo) [cite: 115]
│   │   ├── +page.svelte      # Lista de centros del usuario
│   │   └── [id]/             # Detalle del centro y sus variables ambientales
│   ├── ciclos/               # Gestión de periodos de siembra y cosecha [cite: 386]
│   │   ├── +page.svelte      # Cronología de ciclos activos
│   │   └── [id]/             # Curvas predictivas sigmoidales del ciclo [cite: 416]
│   ├── mediciones/           # Registro de Talla, Biomasa y Densidad [cite: 114]
│   │   └── nueva/            # Form Action para ingreso normalizado (ETL)
│   └── api/                  # Endpoints para extracción de datos (API REST) [cite: 126, 201]
│
├── auth/                     # Flujo de Autenticación Passwordless
│   ├── login/                # Solicitud de Magic Link (Resend)
│   └── callback/             # Validación de token y creación de sesión JWT
│
└── +layout.svelte            # Root layout (Global stores, SEO básico)