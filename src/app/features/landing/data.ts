import type { Banner, Product } from '@/app/types/global.types';

// Imágenes Unsplash — fragancias y lujo dark
const IMG = {
  p1:  '/home-5.webp',
  p2:  '/home-6.webp',
  p3:  '/yara.webp',
  p4:  '/img-9.webp',
  p5:  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=480&h=580&fit=crop&q=80',
  p6:  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=480&h=580&fit=crop&q=80',
  p7:  'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=480&h=580&fit=crop&q=80',
  p8:  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=480&h=580&fit=crop&q=80',
  p9:  '/home-4.webp',
  p10: '/home-3.webp',
  p11: '/home-2.webp',
  p12: '/home-1.webp',
  b1:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=560&fit=crop&q=80',
  b2:  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1400&h=560&fit=crop&q=80',
  b3:  'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1400&h=560&fit=crop&q=80',
};

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Única Experiencia',
    subtitle: 'Decants & Sellados — Envíos a todo Ecuador',
    image: IMG.b1,
    link: '/catalogo',
    isActive: true,
    order: 1,
  },
  {
    id: 'b2',
    title: 'Fragancias Exclusivas',
    subtitle: 'Las mejores marcas, en el tamaño que quieres',
    image: IMG.b2,
    link: '/catalogo',
    isActive: true,
    order: 2,
  },
  {
    id: 'b3',
    title: 'Nueva Colección',
    subtitle: 'Últimos ingresos disponibles ahora',
    image: IMG.b3,
    link: '/catalogo',
    isActive: true,
    order: 3,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Le Male',
    description: 'Icónica fragancia masculina con notas de lavanda, menta y vainilla. Un clásico atemporal.',
    image: IMG.p1,
    images: [IMG.p1, IMG.p2],
    variants: [
      { id: 'p1-v1', ml: 125, price: 89, mlSize: 125, isFullBottle: true, availableQuantity: 5 },
      { id: 'p1-v2', ml: 75,  price: 65, mlSize: 75,  isFullBottle: true, availableQuantity: 3 },
    ],
    totalMl: 125, openBottleMlRemaining: 0, availableMl: 0,
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'p2',
    name: 'Stronger With You',
    description: 'Fragancia cálida y sensual con notas de castaña, salvia y vainilla.',
    image: IMG.p2,
    images: [IMG.p2],
    variants: [
      { id: 'p2-v1', ml: 100, price: 95, mlSize: 100, isFullBottle: true, availableQuantity: 4 },
      { id: 'p2-v2', ml: 50,  price: 65, mlSize: 50,  isFullBottle: true, availableQuantity: 8 },
    ],
    totalMl: 100, openBottleMlRemaining: 0, availableMl: 0,
    isActive: true,
    createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'p3',
    name: 'Sauvage EDP',
    description: 'Poderoso y noble, Sauvage evoca cielos abiertos y naturaleza salvaje.',
    image: IMG.p3,
    images: [IMG.p3],
    variants: [
      { id: 'p3-v1', ml: 100, price: 145, mlSize: 100, isFullBottle: true, availableQuantity: 2 },
      { id: 'p3-v2', ml: 60,  price: 98,  mlSize: 60,  isFullBottle: true, availableQuantity: 6 },
    ],
    totalMl: 100, openBottleMlRemaining: 0, availableMl: 0,
    isActive: true,
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'p4',
    name: 'Bleu de Chanel EDP',
    description: 'La expresión de una libertad que desafía las convenciones. Madera cedro y sándalo.',
    image: IMG.p4,
    images: [IMG.p4],
    variants: [
      { id: 'p4-v1', ml: 10, price: 22, mlSize: 10, isFullBottle: false, availableQuantity: 15 },
      { id: 'p4-v2', ml: 20, price: 38, mlSize: 20, isFullBottle: false, availableQuantity: 10 },
      { id: 'p4-v3', ml: 30, price: 52, mlSize: 30, isFullBottle: false, availableQuantity: 7  },
    ],
    totalMl: 100, openBottleMlRemaining: 80, availableMl: 80,
    isActive: true,
    createdAt: '2026-02-12T00:00:00Z',
  },
  {
    id: 'p5',
    name: 'Spicebomb Extreme',
    description: 'Una bomba de especias con vainilla y tabaco. Proyección excepcional.',
    image: IMG.p5,
    images: [IMG.p5],
    variants: [
      { id: 'p5-v1', ml: 5,  price: 12, mlSize: 5,  isFullBottle: false, availableQuantity: 20 },
      { id: 'p5-v2', ml: 10, price: 21, mlSize: 10, isFullBottle: false, availableQuantity: 14 },
      { id: 'p5-v3', ml: 20, price: 38, mlSize: 20, isFullBottle: false, availableQuantity: 8  },
    ],
    totalMl: 100, openBottleMlRemaining: 60, availableMl: 60,
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'p6',
    name: 'Noir EDP',
    description: 'Oriental sofisticado con bergamota, cardamomo y ámbar gris. Lujo absoluto.',
    image: IMG.p6,
    images: [IMG.p6],
    variants: [
      { id: 'p6-v1', ml: 5,  price: 18, mlSize: 5,  isFullBottle: false, availableQuantity: 12 },
      { id: 'p6-v2', ml: 10, price: 32, mlSize: 10, isFullBottle: false, availableQuantity: 7  },
    ],
    totalMl: 100, openBottleMlRemaining: 50, availableMl: 50,
    isActive: true,
    createdAt: '2026-02-18T00:00:00Z',
  },
  {
    id: 'p7',
    name: 'Perfume Árabe Lattafa',
    description: 'Fragancia oriental de alta proyección con notas de oud, rosa y almizcle.',
    image: IMG.p7,
    images: [IMG.p7],
    variants: [
      { id: 'p7-v1', ml: 100, price: 42, mlSize: 100, isFullBottle: true, availableQuantity: 9 },
    ],
    totalMl: 100, openBottleMlRemaining: 0, availableMl: 0,
    isActive: true,
    createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'p8',
    name: '9pm Rebel',
    description: 'Fragancia nocturna intensa. Madera oscura, vainilla y almizcle blanco.',
    image: IMG.p8,
    images: [IMG.p8],
    variants: [
      { id: 'p8-v1', ml: 100, price: 38, mlSize: 100, isFullBottle: true, availableQuantity: 11 },
      { id: 'p8-v2', ml: 50,  price: 24, mlSize: 50,  isFullBottle: true, availableQuantity: 6  },
    ],
    totalMl: 100, openBottleMlRemaining: 0, availableMl: 0,
    isActive: true,
    createdAt: '2026-02-22T00:00:00Z',
  },
  {
    id: 'p9',
    name: 'Perfume Valentino',
    description: 'La profundidad del océano en una fragancia. Acuático, marino y mineral.',
    image: IMG.p9,
    images: [IMG.p9],
    variants: [
      { id: 'p9-v1', ml: 75, price: 98, mlSize: 75, isFullBottle: true, availableQuantity: 4 },
    ],
    totalMl: 75, openBottleMlRemaining: 0, availableMl: 0,
    isActive: true,
    createdAt: '2026-02-25T00:00:00Z',
  },
  {
    id: 'p10',
    name: 'Bourbon EDP',
    description: 'El hombre Valentino. Bergamota italiana, iris y cedro de Virginia.',
    image: IMG.p10,
    images: [IMG.p10],
    variants: [
      { id: 'p10-v1', ml: 5,  price: 14, mlSize: 5,  isFullBottle: false, availableQuantity: 18 },
      { id: 'p10-v2', ml: 10, price: 24, mlSize: 10, isFullBottle: false, availableQuantity: 10 },
      { id: 'p10-v3', ml: 30, price: 58, mlSize: 30, isFullBottle: false, availableQuantity: 3  },
    ],
    totalMl: 100, openBottleMlRemaining: 70, availableMl: 70,
    isActive: true,
    createdAt: '2026-02-26T00:00:00Z',
  },
  {
    id: 'p11',
    name: 'Lataffa H&G',
    description: 'Seductor y sensual. Cardamomo, madera cedro y vetiver. Perfecto para la noche.',
    image: IMG.p11,
    images: [IMG.p11],
    variants: [
      { id: 'p11-v1', ml: 10, price: 19, mlSize: 10, isFullBottle: false, availableQuantity: 22 },
      { id: 'p11-v2', ml: 20, price: 34, mlSize: 20, isFullBottle: false, availableQuantity: 15 },
    ],
    totalMl: 100, openBottleMlRemaining: 80, availableMl: 80,
    isActive: true,
    createdAt: '2026-02-27T00:00:00Z',
  },
  {
    id: 'p12',
    name: 'Perfume Arabe',
    description: 'Fragancia oriental amaderada con notas de bourbon, cuero y especias.',
    image: IMG.p12,
    images: [IMG.p12],
    variants: [
      { id: 'p12-v1', ml: 100, price: 35, mlSize: 100, isFullBottle: true, availableQuantity: 14 },
    ],
    totalMl: 100, openBottleMlRemaining: 0, availableMl: 0,
    isActive: true,
    createdAt: '2026-02-28T00:00:00Z',
  },
];

// Últimos ingresos (más recientes)
export const MOCK_NEW_ARRIVALS = MOCK_PRODUCTS.slice(-4).reverse();

// Más vendidos (selección de 4 destacados)
export const MOCK_FEATURED = [
  MOCK_PRODUCTS[0],
  MOCK_PRODUCTS[2],
  MOCK_PRODUCTS[4],
  MOCK_PRODUCTS[6],
  MOCK_PRODUCTS[8],
  MOCK_PRODUCTS[9],
  MOCK_PRODUCTS[10],
  MOCK_PRODUCTS[11],
];

// === PERFUME CATEGORIES (Bajo Pedido dropdown) ===
export const PERFUME_CATEGORIES = [
  { label: 'NICHO', marcas: ['Tom Ford', 'Creed', 'Parfums de Marly', 'Xerjoff', 'Initio', 'Nishane', 'Ver todos'] },
  { label: 'DISEÑADOR', marcas: ['Dior', 'Chanel', 'Versace', 'Prada', 'YSL', 'Dolce & Gabbana', 'Ver todos'] },
  { label: 'ÁRABES', marcas: ['Lattafa', 'Asad', 'Armaf', 'Shaghaf', 'Khama', 'Yara Moi', 'Azrap', 'Qaed', 'Ver todos'] },
  { label: 'GENERO', marcas: ['Masculino', 'Femenino', 'Unisex'] },
  { label: 'HORA DEL DIA', marcas: ['Día', 'Noche', 'Versátil'] },
];

// === BLOG SECTION ===
export const BLOG_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=380&fit=crop&q=80',
    text: 'Excepturi praesentium beatae ut nemo commodi. Nemo omnis repudiandae culpa quaerat soluta dolorem aspernatur et. Repellendus sint reprehenderit dignissimos consequatur maiores.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=380&fit=crop&q=80',
    text: 'Excepturi praesentium beatae ut nemo commodi. Nemo omnis repudiandae culpa quaerat soluta dolorem aspernatur et. Repellendus sint reprehenderit dignissimos consequatur maiores.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=380&fit=crop&q=80',
    text: 'Excepturi praesentium beatae ut nemo commodi. Nemo omnis repudiandae culpa quaerat soluta dolorem aspernatur et. Repellendus sint reprehenderit dignissimos consequatur maiores.',
  },
];

// === TESTIMONIALS SECTION ===
export const TESTIMONIALS = [
  {
    badge: 'COMPRADOR FRECUENTE',
    name: 'MARIANO TORRES',
    text: 'Excepturi praesentium beatae ut nemo commodi. Nemo omnis repudiandae culpa quaerat soluta dolorem aspernatur et. Repellendus sint reprehenderit dignissimos consequatur maiores.',
    rating: 5.0,
    avatar: '/avatar.webp',
    productImage: '/home-3.webp',
  },
  {
    badge: 'CLIENTE NUEVO',
    name: 'ANDREA VILLACÍS',
    text: 'Increíble calidad en cada decant. Los aromas son exactamente como los originales y el servicio fue rápido y profesional. Definitivamente volvería a comprar.',
    rating: 5.0,
    avatar: '/avatar.webp',
    productImage: '/home-1.webp',
  },
  {
    badge: 'CLIENTE FRECUENTE',
    name: 'CARLOS MENDOZA',
    text: 'La variedad de fragancias es impresionante. Pude probar varios decants antes de decidirme. El packaging es excelente y la entrega fue en tiempo récord.',
    rating: 5.0,
    avatar: '/avatar.webp',
    productImage: '/home-4.webp',
  },
] as const;

// === FOOTER LINKS ===
export const FOOTER_SOCIAL_ICONS = [
  { alt: 'Facebook', href: '#' },
  { alt: 'Instagram', href: '#' },
  { alt: 'TikTok', href: '#' },
];

export const FOOTER_LINKS_COL1 = [
  { href: '/catalogo/perfumes', label: 'Perfumes' },
  { href: '/decants',           label: 'Cómo funcionan los decants' },
  { href: '/bajo-pedido',       label: 'Bajo pedidos' },
  { href: '/catalogo/combos',   label: 'Combos' },
];
