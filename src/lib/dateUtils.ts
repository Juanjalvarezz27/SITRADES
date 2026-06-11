/**
 * Utilidades de fecha para America/Caracas (UTC-4, sin DST desde 2016).
 *
 * Por qué existe este archivo:
 * Vercel y Neon (PostgreSQL) corren en servidores UTC. Si se usa `new Date()`
 * directamente en el servidor, hay una ventana de 4 horas cada noche donde el
 * servidor ya entró en el día siguiente pero en Venezuela todavía no. Eso hace
 * que vencimientos y retenciones se calculen mal.
 *
 * Regla: toda comparación de fechas de negocio (vencimiento, retención) debe
 * usar `getHoyCaracas()` en lugar de `new Date()`.
 * Los campos de auditoría (@default(now()), @updatedAt) los maneja Prisma/PostgreSQL
 * en UTC, lo cual es correcto y no se toca.
 */

const CARACAS_OFFSET_MS = -4 * 60 * 60 * 1000; // UTC-4, permanente

/**
 * Devuelve la medianoche UTC del DÍA ACTUAL en Venezuela.
 *
 * Ejemplo: si el servidor UTC dice "2026-12-31T02:00:00Z",
 * en Venezuela son las "2026-12-30T22:00:00", así que
 * esta función devuelve "2026-12-30T00:00:00Z" (inicio del día venezolano).
 *
 * Úsala para comparaciones del tipo: ¿ya venció esta muestra HOY en Venezuela?
 */
export function getHoyCaracas(): Date {
  const ahora = new Date(Date.now() + CARACAS_OFFSET_MS);
  return new Date(Date.UTC(
    ahora.getUTCFullYear(),
    ahora.getUTCMonth(),
    ahora.getUTCDate()
  ));
}

/**
 * Devuelve la medianoche UTC de N días en el futuro, contados desde hoy en Venezuela.
 * Útil para la alerta "vencen en los próximos 30 días".
 */
export function getFuturoCaracas(dias: number): Date {
  const hoy = getHoyCaracas();
  return new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000);
}

/**
 * Convierte un string de fecha tipo "YYYY-MM-DD" proveniente de un <input type="date">
 * al inicio de ese día en Venezuela (medianoche Venezuela = 04:00 UTC).
 *
 * Por qué: `new Date("2026-12-31")` da "2026-12-31T00:00:00Z" (medianoche UTC),
 * pero el usuario en Venezuela entiende el 31 como que termina a las 04:00 UTC.
 * Para campos @db.Date (sin hora), esto garantiza que la fecha quede bien.
 */
export function parseFechaCaracas(fechaStr: string): Date {
  // Parseamos los componentes para evitar ambigüedad de zona horaria
  const [year, month, day] = fechaStr.split("-").map(Number);
  // Medianoche de ese día en Venezuela = 04:00 UTC del mismo día
  return new Date(Date.UTC(year, month - 1, day, 4, 0, 0, 0));
}
