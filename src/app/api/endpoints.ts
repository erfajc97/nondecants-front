// Fuente única de verdad para todos los endpoints de la API NönDecants
export const API_ENDPOINTS = {
  // ── Auth ────────────────────────────────────────
  LOGIN:                      '/auth/login',
  REGISTER:                   '/auth/register',
  LOGOUT:                     '/auth/logout',
  RENEW_TOKEN:                '/auth/refresh-token',
  FORGOT_PASSWORD:            '/auth/forgot-password',
  RESET_PASSWORD:             '/auth/reset-password',
  CHANGE_PASSWORD:            '/auth/change-password',

  // ── Users ───────────────────────────────────────
  USER_ME:                    '/users/me',
  USERS:                      '/users',

  // ── Banners ─────────────────────────────────────
  BANNERS:                    '/banners',

  // ── Products ────────────────────────────────────
  PRODUCTS:                   '/products',
  PRODUCT:                    '/products',        // + /:id
  PRODUCT_VARIANTS:           '/products',        // + /:id/variants

  // ── Inventory ───────────────────────────────────
  INVENTORY:                  '/inventory',
  INVENTORY_ITEM:             '/inventory',       // + /:id

  // ── Delivery ────────────────────────────────────
  DELIVERY_METHODS:           '/delivery-methods',

  // ── Orders ──────────────────────────────────────
  ORDERS:                     '/orders',
  ORDER:                      '/orders',          // + /:id
  MY_ORDERS:                  '/orders/my-orders',

  // ── Payments (Payphone) ──────────────────────────
  CREATE_TRANSACTION:         '/payments/create-transaction',
  VERIFY_PAYMENT:             '/payments/verify',
  UPDATE_TRANSACTION_STATUS:  '/payments/update-status',

  // ── Dashboard (admin) ────────────────────────────
  DASHBOARD_STATS:            '/dashboard/stats',
  DASHBOARD_SALES:            '/dashboard/sales',

  // ── Clients (admin) ─────────────────────────────
  CLIENTS:                    '/clients',
  CLIENT:                     '/clients',         // + /:id

  // ── Finances (admin) ────────────────────────────
  FINANCES_SUMMARY:           '/finances/summary',
  FINANCES_EXPENSES:          '/finances/expenses',
};
