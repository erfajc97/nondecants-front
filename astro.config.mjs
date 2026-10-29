import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Dominio público: sin esto las URLs absolutas de og:image y canonical se
  // arman con el host de la request, que en las páginas prerenderizadas es
  // localhost y rompe la vista previa al compartir.
  site: 'https://nondecants.com',
  output: 'hybrid',
  // Netlify (ambiente de revisión) define NETLIFY=true durante el build; el resto usa Node/Docker.
  adapter: process.env.NETLIFY ? netlify() : node({ mode: 'standalone' }),
  integrations: [react()],
  // El CSS de página (~15 KiB) no sale como <link> bloqueante: va en el HTML.
  build: {
    inlineStylesheets: 'always',
  },
  server: {
    port: 4321,
  },
  vite: {
    plugins: [tailwindcss()],
    // Astro no inyecta VITE_* del entorno del proceso en el bundle del cliente: se define aquí.
    define: {
      'import.meta.env.VITE_DEMO': JSON.stringify(process.env.VITE_DEMO ?? ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // M1: carruseles con scroll nativo en lugar de Embla (misma API de uso).
        'embla-carousel-react': path.resolve(__dirname, 'src/app/lib/nativeCarousel.ts'),
      },
    },
  },
});
