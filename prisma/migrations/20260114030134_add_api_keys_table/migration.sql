-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "permisos" TEXT[],
    "creado_por_id" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_uso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revocada_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_activa_idx" ON "api_keys"("activa");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
