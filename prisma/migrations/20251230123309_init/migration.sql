-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "creado_por_id" INTEGER,
    "deleted_at" DATETIME,
    CONSTRAINT "unidades_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lugares" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "nota" TEXT,
    "latitud" DECIMAL,
    "longitud" DECIMAL,
    "creado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    CONSTRAINT "lugares_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tipos_registro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "mediciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" DECIMAL NOT NULL,
    "fecha_medicion" DATETIME NOT NULL,
    "lugar_id" INTEGER NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "tipo_id" INTEGER NOT NULL,
    "registrado_por_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deleted_at" DATETIME,
    CONSTRAINT "mediciones_lugar_id_fkey" FOREIGN KEY ("lugar_id") REFERENCES "lugares" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mediciones_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mediciones_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "tipos_registro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mediciones_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bitacora_cambios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tabla_afectada" TEXT NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "cambios" TEXT,
    "usuario_id" INTEGER,
    "fecha_evento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_origen" TEXT,
    CONSTRAINT "bitacora_cambios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_registro_codigo_key" ON "tipos_registro"("codigo");
