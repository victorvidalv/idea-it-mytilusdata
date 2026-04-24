CREATE TABLE "biblioteca" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo_referencia" text NOT NULL,
	"ciclo_id" integer NOT NULL,
	"puntos_json" jsonb NOT NULL,
	"parametros_calculados" jsonb NOT NULL,
	"formula_tipo" text DEFAULT 'LOGISTICO' NOT NULL,
	"metadatos" jsonb,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lugares" ADD COLUMN "geom" geometry(point);--> statement-breakpoint
ALTER TABLE "biblioteca" ADD CONSTRAINT "biblioteca_ciclo_id_ciclos_id_fk" FOREIGN KEY ("ciclo_id") REFERENCES "public"."ciclos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biblioteca" ADD CONSTRAINT "biblioteca_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lugares_geom" ON "lugares" USING gist ("geom");