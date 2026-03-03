-- Migración: Agregar soporte PostGIS para coordenadas geográficas
-- Fase 1: Habilitar extensión, agregar columna geom, migrar datos, crear índice

-- 1. Habilitar extensión PostGIS si no está disponible
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Agregar columna geometry para almacenar puntos geográficos
-- SRID 4326 = WGS84 (estándar para GPS y aplicaciones web)
ALTER TABLE lugares ADD COLUMN geom geometry(Point, 4326);

-- 3. Migrar datos existentes de latitud/longitud a columna geom
-- ST_MakePoint(x, y) donde x = longitud, y = latitud
-- ST_SetSRID asigna el sistema de referencia espacial
UPDATE lugares 
SET geom = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)
WHERE latitud IS NOT NULL AND longitud IS NOT NULL;

-- 4. Crear índice espacial GIST para consultas geográficas eficientes
CREATE INDEX idx_lugares_geom ON lugares USING GIST (geom);