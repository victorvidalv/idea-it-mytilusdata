/*
  Warnings:

  - You are about to drop the `bitacora_cambios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bitacora_cambios" DROP CONSTRAINT "bitacora_cambios_usuario_id_fkey";

-- AlterTable
ALTER TABLE "mediciones" ADD COLUMN     "ciclo_id" INTEGER;

-- DropTable
DROP TABLE "bitacora_cambios";

-- CreateTable
CREATE TABLE "ciclos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_siembra" TIMESTAMP(3) NOT NULL,
    "fecha_finalizacion" TIMESTAMP(3),
    "lugar_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "creado_por_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ciclos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ciclos_lugar_id_idx" ON "ciclos"("lugar_id");

-- CreateIndex
CREATE INDEX "ciclos_activo_idx" ON "ciclos"("activo");

-- CreateIndex
CREATE INDEX "ciclos_fecha_siembra_idx" ON "ciclos"("fecha_siembra");

-- CreateIndex
CREATE INDEX "ciclos_deleted_at_idx" ON "ciclos"("deleted_at");

-- CreateIndex
CREATE INDEX "mediciones_fecha_medicion_idx" ON "mediciones"("fecha_medicion");

-- CreateIndex
CREATE INDEX "mediciones_lugar_id_idx" ON "mediciones"("lugar_id");

-- CreateIndex
CREATE INDEX "mediciones_unidad_id_idx" ON "mediciones"("unidad_id");

-- CreateIndex
CREATE INDEX "mediciones_tipo_id_idx" ON "mediciones"("tipo_id");

-- CreateIndex
CREATE INDEX "mediciones_origen_id_idx" ON "mediciones"("origen_id");

-- CreateIndex
CREATE INDEX "mediciones_registrado_por_id_idx" ON "mediciones"("registrado_por_id");

-- CreateIndex
CREATE INDEX "mediciones_ciclo_id_idx" ON "mediciones"("ciclo_id");

-- CreateIndex
CREATE INDEX "mediciones_deleted_at_idx" ON "mediciones"("deleted_at");

-- AddForeignKey
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_ciclo_id_fkey" FOREIGN KEY ("ciclo_id") REFERENCES "ciclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_lugar_id_fkey" FOREIGN KEY ("lugar_id") REFERENCES "lugares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
