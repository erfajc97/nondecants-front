export const MOCK_ENABLED = import.meta.env.VITE_USE_MOCK === 'true';

/** Ambiente de demostración (rama `dev` en Netlify): axios responde con datos de prueba. */
export const DEMO_ENABLED = String(import.meta.env.VITE_DEMO) === 'true';
