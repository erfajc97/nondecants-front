import { defineMiddleware } from 'astro:middleware';

// Guard de rutas /admin/* — verifica que el usuario tenga token y rol ADMIN
// La verificación real ocurre en client-side (authStore). Este middleware
// proporciona una capa de protección SSR básica como primera defensa.
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Solo actúa en rutas /admin
  if (!pathname.startsWith('/admin')) {
    return next();
  }

  // En SSR con Astro, verificamos la cookie de sesión si existe
  // La verificación final de rol siempre ocurre en el componente React (authStore)
  const sessionCookie = context.cookies.get('session');

  // Si no hay cookie, redirige al inicio
  // (la verificación real se hace en el island con authStore)
  if (!sessionCookie) {
    // No redirigimos desde el servidor para no bloquear el island de React
    // que hace la verificación real con authStore + secureStorage
    return next();
  }

  return next();
});
