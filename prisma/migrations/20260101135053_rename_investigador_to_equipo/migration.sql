/*
  Warnings:

  - The values [INVESTIGADOR] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `origen_id` to the `mediciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'EQUIPO', 'PUBLICO');
ALTER TABLE "public"."usuarios" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'PUBLICO';
COMMIT;

-- AlterTable
ALTER TABLE "mediciones" ADD COLUMN     "origen_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "origen_datos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creado_por_id" INTEGER,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "origen_datos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "origen_datos" ADD CONSTRAINT "origen_datos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_origen_id_fkey" FOREIGN KEY ("origen_id") REFERENCES "origen_datos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
