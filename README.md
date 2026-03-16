# NönDecants — Frontend

Landing pública de ecommerce para perfumes (sellados, decants, nondecants) optimizada para SEO y velocidad. Construida con **Astro SSG** + **React Islands** para máximo rendimiento e interactividad selectiva.

**Puerto**: `4324` (desarrollo), `4173` (preview)
**API Base**: `http://localhost:3030/api`

---

## 🚀 Features

- ⚡ **Astro SSG** — 114+ páginas pre-renderizadas, cero JS innecesario
- 🏝️ **React Islands** — Interactividad solo donde se necesita (`client:load`, `client:visible`)
- 🎨 **Dark Luxury** — Tema negro carbón (`#1B1919`) + dorado (`#CCB377`)
- 📱 **Fully Responsive** — Mobile-first, adaptado a todos los tamaños
- 🔍 **SEO Optimizado** — Meta tags, Open Graph, sitemap automático
- 🛒 **Carrito Persistente** — Zustand + localStorage encriptado
- 💳 **Checkout Guest** — Sin registro obligatorio
- 📦 **Catálogo Dinámico** — 200+ productos, filtros, búsqueda, paginación
- 📊 **Integración API** — TanStack Query v5 con caching inteligente
- 🔐 **Auth Segura** — JWT, Zustand, secureStorage con AES encriptación
- 🔄 **Servientrega Integration** — Tracking automático
- 💰 **Payphone Ready** — Recargo 6%, webhook callback
- ✨ **Framer Motion** — Animaciones suaves, transiciones

---

## 📦 Stack

| Capa | Tecnología |
|------|-----------|
| Framework | **Astro 4** + Vite |
| Interactividad | **React 18** (Astro Islands) |
| Estilos | **Tailwind CSS v4** (tokens @theme) |
| Estado Global | **Zustand v5** |
| Data Fetching | **TanStack Query v5** |
| HTTP | **Axios** (interceptors JWT) |
| Componentes | **shadcn/ui** (adaptado Dark Luxury) |
| Formularios | **React Hook Form** + **Zod** |
| Notificaciones | **Sonner** |
| Carrusel | **Embla Carousel React** |
| Animaciones | **Framer Motion** |
| Encriptación | **crypto-js** (AES localStorage) |
| Lenguaje | **TypeScript** strict mode |

---

## 🎨 Marca

**Estilo**: Dark Luxury — elegante, minimalista, premium

**Paleta de colores**:
```
--color-bg:           #1B1919  (Fondo principal)
--color-surface:      #252222  (Superficies, tarjetas)
--color-accent:       #CCB377  (Dorado, highlights)
--color-text:         #FFFFFF  (Texto principal)
--color-text-muted:   #A09A9A  (Texto secundario)
--color-border:       #3A3636  (Bordes)
```

**Tipografía**:
- **Oswald** — Titulares, headings (h1-h6)
- **Inter** — Cuerpo, párrafos, UI

**Regla de oro**: ❌ NUNCA hex o `var()` en JSX — ✅ SOLO clases del tema (`bg-accent`, `text-muted`)

---

## 📐 Arquitectura & Carpetas

```text
src/
├── app/
│   ├── api/                     # endpoints.ts (rutas API centralizadas)
│   ├── config/
│   │   └── axiosConfig.ts       # Instancia axios + JWT + interceptors
│   ├── features/                # Screaming Architecture (por dominio)
│   │   ├── landing/
│   │   │   ├── components/      # Hero, Banners, Featured, Newsletter
│   │   │   ├── hooks/           # useLandingData, etc.
│   │   │   ├── data.ts          # Datos estáticos (testimonios, etc.)
│   │   │   └── Landing.tsx      # Componente principal (island)
│   │   ├── catalog/
│   │   │   ├── components/      # CatalogGrid, Filters, SearchBar
│   │   │   ├── hooks/           # useCatalogHook
│   │   │   ├── services/        # catalogService.ts
│   │   │   ├── types.ts
│   │   │   └── Catalog.tsx
│   │   ├── product/
│   │   │   ├── components/      # ProductCard, ProductGallery, ProductOptions
│   │   │   ├── hooks/           # useProductDetail
│   │   │   ├── services/        # productService.ts
│   │   │   ├── types.ts
│   │   │   └── ProductDetail.tsx
│   │   ├── cart/
│   │   │   ├── components/      # CartDrawer, CartItem, CartSummary
│   │   │   ├── types.ts
│   │   │   └── CartDrawer.tsx
│   │   ├── checkout/
│   │   │   ├── components/      # CheckoutForm, DeliverySelect, PaymentSummary
│   │   │   ├── hooks/           # useCheckoutHook
│   │   │   ├── mutations/       # useCreateOrderMutation
│   │   │   ├── services/        # checkoutService.ts, paymentService.ts
│   │   │   ├── types.ts
│   │   │   └── Checkout.tsx
│   │   ├── order/
│   │   │   ├── components/      # OrderConfirmation, OrderTracking
│   │   │   ├── hooks/           # useOrderDetail
│   │   │   ├── services/        # orderService.ts
│   │   │   ├── types.ts
│   │   │   └── OrderDetail.tsx
│   │   └── auth/
│   │       ├── components/      # LoginForm, RegisterForm, AuthModal
│   │       ├── hooks/           # useLoginHook, useRegisterHook
│   │       ├── mutations/       # useLoginMutation
│   │       ├── services/        # authService.ts
│   │       ├── types.ts
│   │       └── AuthModal.tsx
│   ├── helpers/
│   │   ├── secureStorage.ts     # AES encrypt/decrypt localStorage
│   │   ├── sonnerResponse.ts    # Toast helper
│   │   ├── formatCurrency.ts    # Formato USD
│   │   ├── parsePaginatedResponse.ts
│   │   └── ...
│   ├── providers/
│   │   └── AppProviders.tsx     # QueryClientProvider + Toaster
│   ├── store/
│   │   ├── auth/
│   │   │   └── authStore.ts     # Zustand (token, user, isAuthenticated)
│   │   └── cart/
│   │       └── cartStore.ts     # Zustand (items, totals, drawer state)
│   ├── tanstack-queries/
│   │   ├── bannersQuery.ts
│   │   ├── productsQuery.ts
│   │   ├── categoriesQuery.ts
│   │   ├── deliveryMethodsQuery.ts
│   │   └── ...
│   └── types/
│       └── global.types.ts
├── layouts/
│   ├── BaseLayout.astro         # HTML shell, fonts, global.css, AppProviders
│   ├── PublicLayout.astro       # BaseLayout + Navbar (island) + Footer
│   └── ...
├── pages/
│   ├── index.astro              # HOME → <Landing client:load />
│   ├── catalogo.astro           # CATALOG → <Catalog client:load />
│   ├── producto/[id].astro      # PRODUCT DETAIL → <ProductDetail id={id} />
│   ├── checkout.astro           # CHECKOUT → <Checkout client:load />
│   ├── orden/[id].astro         # ORDER TRACKING → <OrderDetail id={id} />
│   └── 404.astro
├── styles/
│   └── global.css               # @theme Tailwind v4 (colores, tipografía)
├── assets/
│   ├── svg/                     # Icons como componentes React
│   └── images/
└── middleware.ts                # Protección de rutas (future use)
```

---

## 🚀 Quick Start

### Instalación

```bash
# Clonar y entrar
git clone <repo-url>
cd nondecants-front

# Instalar dependencias
npm install

# Copiar .env
cp .env.example .env

# Variables necesarias
# VITE_API_BASE_URL=http://localhost:3030/api
# VITE_SECRET_KEY=your-secret-key-min-16-chars
```

### Desarrollo

```bash
npm run dev
# 🌐 Acceder a http://localhost:3000/
# 📚 Astro preview → http://localhost:3000/
```

### Build

```bash
npm run build      # SSG build (114+ páginas)
npm run preview    # Preview del build
```

---

## 🔑 Variables de Entorno

```env
# API
VITE_API_BASE_URL=http://localhost:3030/api

# Encriptación (mínimo 16 caracteres)
VITE_SECRET_KEY=your-secret-key-change-in-production

# Features
VITE_USE_MOCK=false              # false = usar backend real
VITE_GOOGLE_CLIENT_ID=...        # Para login con Google

# Env (auto)
VITE_SITE_URL=http://localhost:4324
```

---

## 🌊 Astro + React Islands

### Patrones clave

**1. Páginas `.astro` primero, React solo cuando hay interactividad:**

```astro
---
// src/pages/catalogo.astro
import PublicLayout from '@/layouts/PublicLayout.astro';
import Catalog from '@/app/features/catalog/Catalog'; // React island
---

<PublicLayout title="Catálogo — NönDecants">
  <!-- Contenido estático (zero JS, carga al instante) -->
  <div class="banner">
    <h1>Nuestro Catálogo</h1>
  </div>

  <!-- Island interactivo (se hidrata cuando es visible) -->
  <Catalog client:visible />
</PublicLayout>
```

**2. Directivas de hidratación:**

| Directiva | Caso de uso |
|-----------|-----------|
| `client:load` | Interactividad inmediata (navbar, formularios, carrito) |
| `client:visible` | Solo cuando usuario lo ve (catálogo, reviews al fondo) |
| Sin directiva | Componente `.astro` estático (zero JS) |

**3. Islands se envuelven en `AppProviders`:**

```typescript
// src/app/features/catalog/Catalog.tsx
import AppProviders from '@/app/providers/AppProviders';
import CatalogGrid from './components/CatalogGrid';

export default function Catalog() {
  return (
    <AppProviders>
      <CatalogGrid />
    </AppProviders>
  );
}
```

---

## 🎯 Flujos Principales

### Landing (`/`)
1. Carga banners, productos featured, testimonios
2. Navbar interactivo (búsqueda, carrito, auth)
3. Newsletter signup
4. CTA a catálogo

### Catálogo (`/catalogo`)
1. Filtros dinámicos (categoría, rango precio, rating)
2. Búsqueda por nombre
3. Paginación (12 items/página)
4. Grid responsive

### Detalle Producto (`/producto/[id]`)
1. Galería de imágenes
2. Variantes por ML (30ml, 50ml, 100ml)
3. Descripción, ingredientes, reviews
4. Add to cart → actualiza cartStore

### Carrito
1. Drawer lateral (slide-in desde derecha)
2. Items con remove/qty
3. Resumen: subtotal + shipping + recargo 6%
4. CTA a checkout

### Checkout
1. **Sin registro** — email anónimo
2. Datos de entrega (dirección, método)
3. Cálculo de shipping dinámico (por ciudad)
4. Resumen con recargo 6%
5. Redirige a Payphone
6. Webhook actualiza BD

### Confirmación
1. Número de orden
2. Tracking Servientrega
3. Historial de estado

---

## 🔐 Autenticación

**Zustand + localStorage encriptado (secureStorage)**

```typescript
// src/app/store/auth/authStore.ts
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token, refreshToken, expiration) => { },
      removeToken: () => { },
      isAuthenticated: () => Boolean(token),
    }),
    {
      name: 'auth-store',
      storage: secureStorage, // AES encrypted
    }
  )
);
```

**Login Modal:**
- Desde navbar (no ruta dedicada `/login`)
- Email + password O Google OAuth
- Guardar token en Zustand
- Navegar a checkout si viene de add-to-cart

---

## 📊 Queries & State

### TanStack Query (server-state)

```typescript
// src/app/tanstack-queries/productsQuery.ts
export const useProductsQuery = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};
```

### Zustand (UI-state)

```typescript
// Carrito
const items = useCartStore((s) => s.items);
const addItem = useCartStore((s) => s.addItem);

// Auth
const token = useAuthStore((s) => s.token);
const isAuth = useAuthStore((s) => s.isAuthenticated());
```

---

## 🛒 Lógica de Negocio

### Métodos de entrega

| Método | Ubicación | Costo |
|--------|----------|-------|
| Retiro | Daule (tienda) | $0 |
| Servientrega | Guayaquil, Samborondón, Durán | $3 |
| Servientrega | Resto de provincias | $7 |

### Recargo Payphone

- **6% sobre subtotal** — mostrar SIEMPRE
- Ejemplo: $100 → +$6 = $106

### Moneda

- **USD ($)** — Ecuador
- Nunca EUR ni símbolos locales

---

## 📝 Scripts

| Script | Descripción |
|--------|-----------|
| `npm run dev` | Desarrollo con HMR |
| `npm run build` | Build SSG (114+ páginas) |
| `npm run preview` | Preview del build estático |
| `npm run check` | Prettier + ESLint + TypeScript |
| `npm run format` | Prettier --write |
| `npm run lint` | ESLint |

---

## 🐳 Docker

```bash
# Build imagen
docker build -t nondecants-front .

# Ejecutar
docker run -p 80:80 nondecants-front
```

Ver `DOCKER.md` para detalles.

---

## 📚 Patrones de Código

### Componente → Hook → Query/Mutation → Service

```typescript
// Componente (UI only)
function CatalogGrid({ filters }) {
  const { data, isLoading } = useCatalogHook(filters);
  return <div>...</div>;
}

// Hook (lógica)
function useCatalogHook(filters) {
  return useProductsQuery(filters);
}

// Query (data fetching)
function useProductsQuery(filters) {
  return useQuery({ queryKey: [...], queryFn: productService.getAll });
}

// Service (axios)
const productService = {
  getAll: (filters) => axiosInstance.get('/products', { params: filters }),
};
```

### No usar hex ni var() en componentes

```tsx
// ❌ MAL
<div style={{ color: '#CCB377' }} />
<div className="text-[var(--color-accent)]" />

// ✅ BIEN
<div className="text-accent" />
```

---

## 🚀 Deployment

### Vercel (recomendado)

```bash
npm run build
# Push a GitHub → auto-deploy
```

### Netlify

```bash
# netlify.toml ya configurado
npm run build
# Deploy dist/
```

### Docker

Ver `DOCKER.md` — imagen multi-stage, nginx, 45MB final.

---

## 🧪 Testing

```bash
# Jest + React Testing Library (setup listo)
npm run test
npm run test:watch
```

---

## 📞 Soporte

- 📖 Docs: `common-skills/skills/front/`
- 🎨 Marca: `common-skills/skills/front/estilo-marca/`
- 🔌 API: `common-skills/skills/front/logica-negocio-back/`
- 🎯 Arch: `common-skills/skills/front/arquitectura-front/`
