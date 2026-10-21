// Fuente única de verdad para todos los endpoints de la API NonDecants
// Backend: http://localhost:3030/api
export const API_ENDPOINTS = {
  // ── Auth ────────────────────────────────────────
  LOGIN:                      '/auth/login',               // POST - public
  REGISTER:                   '/auth/register',            // POST - public (sends verification email)
  LOGOUT:                     '/auth/logout',              // Not implemented in backend yet
  RENEW_TOKEN:                '/auth/refresh-token',       // Not implemented in backend yet
  VERIFY_EMAIL:               '/auth/verify-email',        // GET - public (?token=)
  RESEND_VERIFICATION:        '/auth/resend-verification', // POST - public
  FORGOT_PASSWORD:            '/auth/forgot-password',     // POST - public
  RESET_PASSWORD:             '/auth/reset-password',      // POST - public
  CHANGE_PASSWORD:            '/auth/change-password',
  GOOGLE_AUTH:                '/auth/google',              // POST - public (Google ID token)

  // ── Users ───────────────────────────────────────
  USER_ME:                    '/users/me',             // GET (auth) / PATCH (auth)
  USER_ADDRESSES:             '/users/me/addresses',   // GET list / POST create (auth) · + /:id PATCH/DELETE · + /:id/default PATCH
  USERS:                      '/users',                // GET all (admin), POST create (public)
  USER:                       '/users',                // + /:id GET/PATCH/DELETE

  // ── Banners ─────────────────────────────────────
  BANNERS:                    '/banners',
  BANNERS_VISIBLE:            '/banners/visible',
  BANNERS_BY_TYPE:            '/banners/by-type',      // ?type=hero|category|brand|navbar|catalog_perfumes|catalog_bajo_pedido
  BANNERS_BY_CATEGORY:        '/banners/category',     // + /:categoryId
  BANNERS_BY_MARCA:           '/banners/marca',        // + /:marcaId

  // ── Blog ────────────────────────────────────────
  BLOG_PUBLISHED:             '/blog/published',
  BLOG_BY_SLUG:               '/blog/slug',            // + /:slug

  // ── Coupons ─────────────────────────────────────
  COUPONS_VALIDATE:           '/coupons/validate',     // POST
  COUPONS_EXCLUSIVE:          '/coupons/exclusive',    // GET (public, badges)

  // ── Categories ──────────────────────────────────
  CATEGORIES:                 '/categories',           // GET all (public), POST create (admin)
  CATEGORY:                   '/categories',           // + /:id GET/PATCH/DELETE
  CATEGORY_PRODUCTS:          '/categories',           // + /:id/products GET (public)
  MARCAS:                     '/categories/marcas',
  MARCA_PRODUCTS:             '/categories/marcas',    // + /:id/products GET (public)

  // ── Landing Sections ────────────────────────────
  LANDING_SECTIONS:           '/landing-sections',     // GET all (admin), POST create (admin)
  LANDING_SECTIONS_ACTIVE:    '/landing-sections/active', // GET active (public)
  LANDING_SECTION:            '/landing-sections',     // + /:id GET/PATCH/DELETE (admin)
  LANDING_SECTION_ADD_PRODUCT: '/landing-sections',   // + /:id/products/:productId POST (admin)
  LANDING_SECTION_REMOVE_PRODUCT: '/landing-sections', // + /:id/products/:productId DELETE (admin)

  // ── Products ────────────────────────────────────
  PRODUCTS:                   '/products',             // GET all (public), POST create (admin)
  PRODUCT:                    '/products',             // + /:id GET/PATCH/DELETE
  PRODUCTS_WITH_DECANTS:      '/products/with-decants', // GET all with decants (public)
  PRODUCT_DECANTS:            '/products',             // + /:id/decants GET (public)
  PRODUCT_VARIATIONS:         '/product-variations',   // GET/POST

  // ── Product Options (admin) ─────────────────────
  PRODUCT_OPTIONS:            '/product-options',      // GET all (public), POST/PATCH/DELETE (admin)
  PRODUCT_OPTION_VALUES:      '/product-options/values', // GET/POST/PATCH/DELETE

  // ── Cart ────────────────────────────────────────
  CART:                       '/cart',                 // GET (auth), DELETE (clear)
  CART_ITEMS:                 '/cart/items',           // POST add, PATCH update, DELETE remove

  // ── Orders ──────────────────────────────────────
  ORDERS:                     '/orders',               // GET all (auth: clients see own, admins see all)
  MY_ORDERS:                  '/orders',               // GET own orders (auth) — backend scopes to current client
  ORDER:                      '/orders',               // + /:id GET/PATCH/DELETE
  ORDERS_FROM_CART:           '/orders/from-cart',     // POST create from cart (auth)

  // ── Inventory ───────────────────────────────────
  INVENTORY:                  '/inventory',            // Not in backend
  INVENTORY_ITEM:             '/inventory',            // Not in backend

  // ── Delivery ────────────────────────────────────
  DELIVERY_METHODS:           '/delivery-methods',     // Not in backend

  // ── Payments (Payphone) ──────────────────────────
  CREATE_TRANSACTION:         '/payments/create-transaction',    // POST (auth)
  VERIFY_PAYMENT:             '/payments/verify',                // GET (public, redirect callback)

  // ── Combos ───────────────────────────────────────
  COMBOS:                     '/combos',               // GET all (admin)
  COMBOS_ACTIVE:              '/combos/active',         // GET active (public)

  // ── Newsletter ────────────────────────────────────
  NEWSLETTER_SUBSCRIBE:         '/newsletter/subscribe', // POST - public

  // ── Reseñas ──────────────────────────────────────
  REVIEWS:                      '/reviews',              // POST (auth) - crea reseña pendiente
  REVIEWS_MINE: '/reviews/mine',     // GET (auth)
  REVIEWS_LATEST:               '/reviews/latest',       // GET public
  REVIEWS_BY_PRODUCT:           '/reviews/product',      // + /:id GET public
  REVIEWS_CAN_REVIEW:           '/reviews/can-review',   // + /:productId GET (auth)

  // ── Settings ─────────────────────────────────────
  SETTINGS:                     '/settings',             // GET all (public), PUT /:key (admin)

  // ── Dashboard (admin) ────────────────────────────
  DASHBOARD_STATS:            '/dashboard/stats',      // Not in backend
  DASHBOARD_SALES:            '/dashboard/sales',      // Not in backend

  // ── Clients (admin) ─────────────────────────────
  CLIENTS:                    '/clients',              // Not in backend - use /users
  CLIENT:                     '/clients',              // Not in backend

  // ── Finances (admin) ────────────────────────────
  FINANCES_SUMMARY:           '/finances/summary',     // Not in backend
  FINANCES_EXPENSES:          '/finances/expenses',    // Not in backend
};
