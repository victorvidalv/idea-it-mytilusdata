CREATE TABLE "email_cooldowns" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"last_sent_at" timestamp NOT NULL,
	CONSTRAINT "email_cooldowns_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "rate_limit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"tipo" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
