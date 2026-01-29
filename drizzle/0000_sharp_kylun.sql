CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_unique" UNIQUE("key"),
	CONSTRAINT "api_keys_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ciclos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"fecha_siembra" timestamp NOT NULL,
	"fecha_finalizacion" timestamp,
	"lugar_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"activo" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "consentimientos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"version_documento" text NOT NULL,
	"fecha_aceptacion" timestamp DEFAULT now(),
	"ip_origen" text
);
--> statement-breakpoint
CREATE TABLE "lugares" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"latitud" real,
	"longitud" real,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "magic_link_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "mediciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"valor" real NOT NULL,
	"fecha_medicion" timestamp NOT NULL,
	"ciclo_id" integer,
	"lugar_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"tipo_id" integer NOT NULL,
	"origen_id" integer NOT NULL,
	"notas" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "origen_datos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tipos_registro" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"unidad_base" text NOT NULL,
	CONSTRAINT "tipos_registro_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"rol" text DEFAULT 'USUARIO',
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_lugar_id_lugares_id_fk" FOREIGN KEY ("lugar_id") REFERENCES "public"."lugares"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lugares" ADD CONSTRAINT "lugares_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_link_tokens" ADD CONSTRAINT "magic_link_tokens_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_ciclo_id_ciclos_id_fk" FOREIGN KEY ("ciclo_id") REFERENCES "public"."ciclos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_lugar_id_lugares_id_fk" FOREIGN KEY ("lugar_id") REFERENCES "public"."lugares"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_tipo_id_tipos_registro_id_fk" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipos_registro"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_origen_id_origen_datos_id_fk" FOREIGN KEY ("origen_id") REFERENCES "public"."origen_datos"("id") ON DELETE no action ON UPDATE no action;