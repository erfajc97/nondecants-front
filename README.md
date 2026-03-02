# NönDecants — Frontend

Plataforma ecommerce para la venta de perfumes sellados, decants y nondecants. Ecuador.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | **Astro** + Vite |
| UI Interactiva | **React** (Astro Islands) |
| Estilos | **Tailwind CSS v4** (`@theme` tokens) |
| Estado global | **Zustand** |
| Data fetching | **TanStack Query v5** |
| HTTP client | **Axios** (instancia configurada con interceptors) |
| Componentes UI | **shadcn/ui** (adaptado al tema de marca) |
| Formularios | **React Hook Form** + **Zod** |
| Toasts | **Sonner** |
| Carrusel | **Embla Carousel React** |
| Gráficos (admin) | **Recharts** |
| Storage seguro | **crypto-js** (encriptado AES en localStorage) |
| Pasarela de pago | **Payphone** (Ecuador) |
| Lenguaje | **TypeScript** (strict mode) |

## Marca

- Estilo: **Dark Luxury** — fondo negro con acento dorado
- Colores:
  - `--color-bg`: `#1B1919` (Black Carbón)
  - `--color-surface`: `#252222`
  - `--color-accent`: `#CCB377` (Gold Honey)
  - `--color-text`: `#FFFFFF`
  - `--color-text-muted`: `#A09A9A`
- Tipografía: **Oswald** (titulares) · **Inter** (cuerpo)
- Regla: **nunca usar hex en JSX** — solo clases del tema (`bg-[--color-accent]`, `text-[--color-text-muted]`)

## Lógica de negocio clave

- Checkout **sin registro obligatorio** (guest checkout)
- Productos con variantes por **ML** (decants y nondecants)
- Inventario híbrido: el back gestiona apertura automática de botellas
- Recargo del **6%** para pagos con tarjeta Payphone — mostrar siempre en checkout
- Métodos de entrega validados por ciudad:
  - Retiro en tienda (Daule) — **$0**
  - Servientrega Guayaquil / Samborondón / Durán — **$3**
  - Servientrega Provincias — **$7**
- Tracking de envíos vía **Servientrega**
- Moneda: **USD ($)** — nunca EUR

## Documentación interna (`common-skills/skills/front/`)

| Carpeta | Contenido |
|---------|-----------|
| `estilo-marca/` | Colores, tipografía, tono de textos, reglas técnicas CSS |
| `logica-negocio-back/` | Flujos de negocio, contratos API, endpoints, ADS 001 |
| `arquitectura-front/` | Estructura del proyecto, patrones de código, ejemplos |
| `figma/` | Capturas de diseño de referencia (home, catálogo, detalle) |

## Referencia de requerimientos

**ADS 001** — `common-skills/skills/front/logica-negocio-back/logica-negocio-nondecants.pdf`

## Estructura de carpetas

```text
src/
├── app/
│   ├── api/                     # endpoints.ts — todos los endpoints centralizados
│   ├── config/                  # axiosConfig.ts — instancia axios con interceptors
│   ├── features/                # Módulos de funcionalidad (screaming architecture)
│   │   ├── landing/             # Home: banners, featured, newsletter
│   │   ├── catalog/             # Catálogo: filtros, búsqueda, paginación
│   │   ├── product/             # Detalle: variantes ML, add to cart
│   │   ├── cart/                # Drawer: items, summary
│   │   ├── checkout/            # Flujo: customer form, delivery, payment, recargo
│   │   ├── order/               # Confirmación y tracking
│   │   └── auth/                # Modal login/registro
│   ├── helpers/                 # Utilidades: sonnerResponse, secureStorage, formatCurrency, etc.
│   ├── providers/               # AppProviders.tsx (QueryClientProvider + Toaster)
│   ├── store/
│   │   ├── auth/                # authStore.ts (Zustand + secureStorage)
│   │   └── cart/                # cartStore.ts (items, drawer, totales)
│   ├── tanstack-queries/        # Queries compartidas: bannersQuery, productsQuery, deliveryMethodsQuery
│   └── types/                   # global.types.ts
├── layouts/
│   ├── BaseLayout.astro          # HTML shell, fuentes, global.css, AppProviders
│   ├── PublicLayout.astro        # Base + Navbar + Footer
│   └── AdminLayout.astro         # Base + Sidebar admin
├── pages/
│   ├── index.astro               # → <Home client:load />
│   ├── catalogo.astro            # → <Catalog client:load />
│   ├── producto/[id].astro       # → <ProductDetail productId={id} client:load />
│   ├── checkout.astro            # → <Checkout client:load />
│   ├── orden/[id].astro          # → <OrderDetail orderId={id} client:visible />
│   └── admin/
│       ├── dashboard.astro
│       ├── productos.astro
│       ├── inventario.astro
│       ├── ordenes.astro
│       ├── clientes.astro
│       └── finanzas.astro
├── styles/
│   └── global.css                # @theme Tailwind v4 — fuente única de tokens de marca
└── middleware.ts                  # Guard admin: verifica authStore.token + rol ADMIN
```

## Variables de entorno

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SECRET_KEY=your-secret-key
```

## Instalación

```bash
npm install
npm run dev
```

## Fases de desarrollo

| Fase | Feature | Prioridad |
|------|---------|-----------|
| 1 | Landing / Home (marca + islands base) | ★★★ |
| 2 | Catálogo (filtros, búsqueda, paginación) | ★★★ |
| 3 | Detalle de producto (variantes ML, carrito) | ★★★ |
| 4 | Cart drawer | ★★★ |
| 5 | Checkout (flujo crítico, recargo 6%) | ★★★ |
| 6 | Confirmación y tracking de orden | ★★ |
| 7 | Auth (modal, no ruta) | ★★ |
| 8 | Admin (dashboard, CRUD, finanzas) | ★ |
