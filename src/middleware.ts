import { defineMiddleware } from 'astro:middleware';

// El panel de administración fue movido al proyecto nondecants-admin.
// Este middleware queda disponible para futuras necesidades (p. ej. rutas protegidas de usuario).
export const onRequest = defineMiddleware(async (_context, next) => {
  return next();
});
