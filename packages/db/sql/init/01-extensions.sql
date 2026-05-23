-- Extensiones requeridas por Tabor.
-- Se ejecuta automáticamente la primera vez que el contenedor de Postgres
-- inicializa el volumen de datos. Idempotente.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
