/**
 * Datos de prueba para el ambiente de revisión (VITE_USE_MOCK=true, rama `dev`).
 * Tienen la forma CRUDA del backend: el front los pasa por los mismos mappers
 * que las respuestas reales, así que el diseño se ve igual que en producción.
 */

const NOW = '2026-10-01T12:00:00.000Z';

// ── Categorías y marcas ─────────────────────────────────────────────
const marca = (id: number, name: string, categoryId: number, bajoPedido = false) => ({
  id: String(id),
  name,
  description: '',
  slug: null,
  isActive: true,
  imageUrl: null,
  imageKey: null,
  mobileImageUrl: null,
  mobileImageKey: null,
  bajoPedido,
  categoryId: String(categoryId),
  createdAt: NOW,
  updatedAt: NOW,
});

const category = (id: number, name: string, description: string, bajoPedido: boolean, marcas: ReturnType<typeof marca>[]) => ({
  id: String(id),
  name,
  description,
  slug: null,
  imageUrl: null,
  imageKey: null,
  mobileImageUrl: null,
  mobileImageKey: null,
  isActive: true,
  bajoPedido,
  createdAt: NOW,
  updatedAt: NOW,
  marcas,
});

// Casas adicionales (sin productos de prueba) para que los banners del home
// cuenten lo mismo que el prototipo: 25 casas nicho y 11 árabes.
let extraMarcaId = 20;
const casas = (names: string[], categoryId: number, bajoPedido: boolean) =>
  names.map((name) => marca(extraMarcaId++, name, categoryId, bajoPedido));

const NICHO_EXTRA = [
  'Parfums de Marly', 'Initio', 'Amouage', 'Maison Francis Kurkdjian', 'Byredo', 'Nishane', 'Roja Parfums',
  'Tom Ford Private', 'Le Labo', 'Frederic Malle', 'Maison Crivelli', 'Kilian', 'Montale', 'Mancera',
  'Orto Parisi', 'Memo Paris', 'Penhaligons', 'Clive Christian', 'Ex Nihilo', 'Zoologist', 'Nasomatto',
];
const ARABE_EXTRA = ['Rasasi', 'Afnan', 'Al Haramain', 'Ajmal', 'Swiss Arabian', 'Nabeel', 'Maison Alhambra', 'Ard Al Zaafaran', 'Paris Corner'];

export const MOCK_CATEGORIES_RAW = [
  category(1, 'Diseñador', 'Los clásicos de las grandes casas.', false, [
    marca(1, 'Dior', 1),
    marca(2, 'Chanel', 1),
    marca(3, 'Armani', 1),
    marca(4, 'Carolina Herrera', 1),
    marca(9, 'Valentino', 1),
  ]),
  category(2, 'Árabes', 'Intensidad y proyección de Medio Oriente.', false, [
    marca(5, 'Lattafa', 2),
    marca(6, 'Armaf', 2),
    ...casas(ARABE_EXTRA, 2, false),
  ]),
  category(3, 'Nicho', 'Casas pequeñas, fragancias de autor. Solo bajo pedido.', true, [
    marca(7, 'Creed', 3, true),
    marca(8, 'Xerjoff', 3, true),
    ...casas(NICHO_EXTRA, 3, true),
  ]),
];

// ── Productos ───────────────────────────────────────────────────────
const IMAGES = ['/sauvage.webp', '/chanel.webp', '/creed.webp', '/gio.webp', '/yara.webp', '/valentine.webp'];

const NOTE_COLORS = ['#E8D8C0', '#C9A87A', '#8A6B4A'];
const notes = (names: string[]) => names.map((name, i) => ({ name, color: NOTE_COLORS[i % 3] }));

interface Seed {
  id: number;
  name: string;
  marcaId: number;
  categoryId: number;
  price: number; // frasco completo
  ml: number;
  gender: 'HOMBRE' | 'MUJER' | 'UNISEX';
  timeOfDay: 'DIA' | 'NOCHE' | 'AMBOS';
  concentration: 'EAU_DE_TOILETTE' | 'EAU_DE_PARFUM' | 'PARFUM' | 'ELIXIR';
  projection: 'DISCRETA' | 'MODERADA' | 'ALTA';
  top: string[];
  heart: string[];
  base: string[];
  description: string;
  stock: number;
  bajoPedido?: boolean;
  discount?: number;
  salesCount?: number;
}

const SEEDS: Seed[] = [
  { id: 1, name: 'Sauvage Elixir', marcaId: 1, categoryId: 1, price: 165, ml: 100, gender: 'HOMBRE', timeOfDay: 'NOCHE', concentration: 'ELIXIR', projection: 'ALTA', top: ['Bergamota', 'Canela', 'Nuez moscada'], heart: ['Lavanda', 'Pachulí'], base: ['Ámbar', 'Vainilla', 'Sándalo'], description: 'Especiada, cálida y de rastro inconfundible.', stock: 6, salesCount: 90 },
  { id: 2, name: 'Bleu de Chanel', marcaId: 2, categoryId: 1, price: 150, ml: 100, gender: 'HOMBRE', timeOfDay: 'AMBOS', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Limón', 'Menta', 'Pomelo'], heart: ['Jengibre', 'Jazmín'], base: ['Cedro', 'Sándalo'], description: 'Elegancia aromática para todos los días.', stock: 9, salesCount: 120 },
  { id: 3, name: 'Acqua di Giò Profondo', marcaId: 3, categoryId: 1, price: 120, ml: 100, gender: 'HOMBRE', timeOfDay: 'DIA', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Mandarina', 'Notas marinas'], heart: ['Romero', 'Lavanda'], base: ['Pachulí', 'Almizcle'], description: 'Frescura marina profunda, limpia y versátil.', stock: 12, salesCount: 75 },
  { id: 4, name: 'Good Girl', marcaId: 4, categoryId: 1, price: 140, ml: 80, gender: 'MUJER', timeOfDay: 'NOCHE', concentration: 'EAU_DE_PARFUM', projection: 'ALTA', top: ['Almendra', 'Café'], heart: ['Jazmín', 'Tuberosa'], base: ['Cacao', 'Haba tonka'], description: 'Dulce, sensual y magnética.', stock: 7, salesCount: 110 },
  { id: 5, name: 'Yara', marcaId: 5, categoryId: 2, price: 45, ml: 100, gender: 'MUJER', timeOfDay: 'DIA', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Orquídea', 'Heliotropo'], heart: ['Frutas tropicales'], base: ['Vainilla', 'Almizcle', 'Sándalo'], description: 'Suave, cremosa y adictiva. Bestseller árabe.', stock: 20, salesCount: 140, discount: 10 },
  { id: 6, name: 'Khamrah', marcaId: 5, categoryId: 2, price: 55, ml: 100, gender: 'UNISEX', timeOfDay: 'NOCHE', concentration: 'EAU_DE_PARFUM', projection: 'ALTA', top: ['Canela', 'Nuez moscada', 'Bergamota'], heart: ['Dátiles', 'Praliné'], base: ['Vainilla', 'Haba tonka', 'Ámbar'], description: 'Gourmand especiado que se queda todo el día.', stock: 14, salesCount: 130 },
  { id: 7, name: 'Club de Nuit Intense', marcaId: 6, categoryId: 2, price: 60, ml: 105, gender: 'HOMBRE', timeOfDay: 'AMBOS', concentration: 'EAU_DE_TOILETTE', projection: 'ALTA', top: ['Limón', 'Piña', 'Bergamota'], heart: ['Abedul', 'Jazmín'], base: ['Almizcle', 'Ámbar gris'], description: 'Ahumada y cítrica. El clon más querido.', stock: 10, salesCount: 95 },
  { id: 8, name: 'Aventus', marcaId: 7, categoryId: 3, price: 380, ml: 100, gender: 'HOMBRE', timeOfDay: 'AMBOS', concentration: 'EAU_DE_PARFUM', projection: 'ALTA', top: ['Piña', 'Bergamota', 'Grosella'], heart: ['Abedul', 'Pachulí'], base: ['Almizcle', 'Musgo de roble'], description: 'El rey de los nichos. Frutal y ahumado.', stock: 0, bajoPedido: true, salesCount: 60 },
  { id: 9, name: 'Silver Mountain Water', marcaId: 7, categoryId: 3, price: 360, ml: 100, gender: 'UNISEX', timeOfDay: 'DIA', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Bergamota', 'Mandarina'], heart: ['Té verde', 'Grosella negra'], base: ['Almizcle', 'Sándalo'], description: 'Frescura alpina, mineral y luminosa.', stock: 0, bajoPedido: true, salesCount: 40 },
  { id: 10, name: 'Naxos', marcaId: 8, categoryId: 3, price: 310, ml: 100, gender: 'UNISEX', timeOfDay: 'AMBOS', concentration: 'EAU_DE_PARFUM', projection: 'ALTA', top: ['Lavanda', 'Bergamota', 'Limón'], heart: ['Miel', 'Canela'], base: ['Tabaco', 'Vainilla', 'Haba tonka'], description: 'Miel y tabaco: un lujo envolvente.', stock: 0, bajoPedido: true, salesCount: 55 },
  { id: 11, name: 'Coco Mademoiselle', marcaId: 2, categoryId: 1, price: 170, ml: 100, gender: 'MUJER', timeOfDay: 'AMBOS', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Naranja', 'Bergamota'], heart: ['Rosa', 'Jazmín'], base: ['Pachulí', 'Vetiver'], description: 'Floral oriental, femenino y atemporal.', stock: 8, salesCount: 85 },
  { id: 12, name: 'Dior Homme Intense', marcaId: 1, categoryId: 1, price: 145, ml: 100, gender: 'HOMBRE', timeOfDay: 'NOCHE', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Lavanda', 'Pera'], heart: ['Iris', 'Ámbar'], base: ['Vetiver', 'Cedro'], description: 'Polvoriento y elegante. Para ocasiones especiales.', stock: 5, salesCount: 70, discount: 5 },
  { id: 13, name: 'Asad', marcaId: 5, categoryId: 2, price: 48, ml: 100, gender: 'HOMBRE', timeOfDay: 'NOCHE', concentration: 'EAU_DE_PARFUM', projection: 'ALTA', top: ['Pimienta negra', 'Piña', 'Tabaco'], heart: ['Café', 'Iris'], base: ['Vainilla', 'Ámbar', 'Pachulí'], description: 'Oscuro, especiado y muy proyectivo.', stock: 11, salesCount: 80 },
  { id: 14, name: '212 VIP Rosé', marcaId: 4, categoryId: 1, price: 130, ml: 80, gender: 'MUJER', timeOfDay: 'NOCHE', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Champagne rosado', 'Pimienta rosa'], heart: ['Rosa', 'Peonía'], base: ['Almizcle', 'Vainilla'], description: 'Festiva, burbujeante y floral.', stock: 6, salesCount: 50 },
  { id: 31, name: 'Born in Roma Uomo', marcaId: 9, categoryId: 1, price: 135, ml: 100, gender: 'HOMBRE', timeOfDay: 'NOCHE', concentration: 'EAU_DE_TOILETTE', projection: 'ALTA', top: ['Salvia', 'Jengibre'], heart: ['Vainilla', 'Lavanda'], base: ['Madera ahumada', 'Pachulí'], description: 'Vainilla mineral, moderna y de gran estela.', stock: 8, salesCount: 85 },
  { id: 32, name: 'Born in Roma Donna', marcaId: 9, categoryId: 1, price: 145, ml: 100, gender: 'MUJER', timeOfDay: 'AMBOS', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Bergamota', 'Pimienta rosa'], heart: ['Jazmín', 'Flor de naranjo'], base: ['Vainilla', 'Ámbar'], description: 'Floral vainillado, luminoso y seguro de sí.', stock: 6, salesCount: 70 },
  { id: 33, name: 'Voce Viva', marcaId: 9, categoryId: 1, price: 125, ml: 100, gender: 'MUJER', timeOfDay: 'DIA', concentration: 'EAU_DE_PARFUM', projection: 'MODERADA', top: ['Mandarina', 'Bergamota'], heart: ['Gardenia', 'Flor de azahar'], base: ['Vainilla', 'Almizcle'], description: 'Gardenia cremosa con un guiño cítrico.', stock: 9, salesCount: 55 },
];

const DECANTS = [
  { ml: 3, factor: 0.045 },
  { ml: 5, factor: 0.07 },
  { ml: 10, factor: 0.125 },
];

const round2 = (n: number) => Math.round(n * 100) / 100;

// Momentos de uso por producto (filtro «Momento» del catálogo; se leen de `occasion`).
const MOMENTOS: Record<number, string[]> = {
  1: ['Noche', 'Cita', 'Fiesta'],
  2: ['Oficina', 'Cita', 'Invierno'],
  3: ['Oficina', 'Verano'],
  4: ['Noche', 'Cita', 'Fiesta'],
  5: ['Verano', 'Cita'],
  6: ['Invierno', 'Noche', 'Cita'],
  7: ['Fiesta', 'Noche'],
  8: ['Oficina', 'Cita'],
  9: ['Verano', 'Oficina'],
  10: ['Invierno', 'Noche'],
  11: ['Oficina', 'Cita'],
  12: ['Noche', 'Invierno'],
  13: ['Fiesta', 'Noche', 'Invierno'],
  14: ['Fiesta', 'Noche', 'Verano'],
};

function buildProduct(s: Seed) {
  const image = IMAGES[(s.id - 1) % IMAGES.length];
  const brand = MOCK_CATEGORIES_RAW.flatMap((c) => c.marcas).find((m) => m.id === String(s.marcaId))!;
  const hasStock = s.stock > 0;

  const bottle = {
    id: String(s.id * 100),
    productId: String(s.id),
    mlSize: s.ml,
    isFullBottle: true,
    presentationType: 'sellada',
    price: s.price.toFixed(2),
    sku: `mock-${s.id}-bottle`,
    name: `${s.name} - Botella ${s.ml}ml`,
    optionValues: [],
    availableQuantity: s.stock,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  };
  // Los decants nunca son "bajo pedido": solo se ofrecen con ml disponibles.
  const decants = s.bajoPedido
    ? []
    : DECANTS.map((d, i) => ({
        id: String(s.id * 100 + i + 1),
        productId: String(s.id),
        mlSize: d.ml,
        isFullBottle: false,
        presentationType: 'decant',
        price: round2(s.price * d.factor + 3).toFixed(2),
        sku: `mock-${s.id}-${d.ml}ml`,
        name: `${s.name} - Decant ${d.ml}ml`,
        optionValues: [],
        availableQuantity: 8,
        isActive: true,
        createdAt: NOW,
        updatedAt: NOW,
      }));
  const variations = [...decants, bottle];

  return {
    id: String(s.id),
    name: s.name,
    price: s.price,
    cost: round2(s.price * 0.6),
    description: s.description,
    imageUrl: image,
    stock: s.stock,
    totalMl: s.ml,
    openBottleMlRemaining: 0,
    availableMl: s.bajoPedido ? 0 : s.stock * s.ml,
    isActive: true,
    isPurchasable: true,
    bajoPedido: !!s.bajoPedido,
    gender: s.gender,
    timeOfDay: s.timeOfDay,
    concentration: s.concentration,
    projection: s.projection,
    discount: (s.discount ?? 0).toFixed(2),
    detailDescription: `${s.description} Una fragancia ${s.projection === 'ALTA' ? 'de gran proyección' : 'de proyección equilibrada'} para quien busca dejar huella.`,
    benefits: JSON.stringify(['Larga duración', 'Versátil', 'Autenticidad garantizada']),
    scentProfileTitle: `La pirámide de ${s.name}`,
    scentSections: [
      { title: 'Notas de salida', notes: notes(s.top), description: 'La primera impresión.' },
      { title: 'Notas de corazón', notes: notes(s.heart), description: 'El alma de la fragancia.' },
      { title: 'Notas de fondo', notes: notes(s.base), description: 'La huella que queda.' },
    ],
    mood: ['Elegante', s.projection === 'ALTA' ? 'Intenso' : 'Fresco'],
    occasion: MOMENTOS[s.id] ?? (s.timeOfDay === 'NOCHE' ? ['Noche', 'Eventos'] : ['Día', 'Oficina']),
    longevity: s.projection === 'ALTA' ? 9 : 7,
    projectionScore: s.projection === 'ALTA' ? 8 : 6,
    signatureTitle: 'La firma',
    signatureDescription: 'Un rastro inconfundible, pensado para recordarse.',
    salesCount: s.salesCount ?? 0,
    categoryId: String(s.categoryId),
    marcaId: String(s.marcaId),
    marca: { id: s.marcaId, name: brand.name },
    variationsCount: variations.length,
    minFormatPrice: Number(variations[0].price),
    maxFormatPrice: s.price,
    formats: variations.map((v) => ({
      id: Number(v.id),
      ml: v.mlSize,
      price: Number(v.price),
      isFullBottle: v.isFullBottle,
      presentationType: v.presentationType,
    })),
    variations,
    images: [{ id: String(s.id), productId: String(s.id), url: image, key: image, alt: s.name, displayOrder: 0, isActive: true }],
    createdAt: new Date(Date.parse(NOW) - Math.max(0, 20 - s.id) * 86_400_000).toISOString(),
    updatedAt: NOW,
    _hasStock: hasStock,
  };
}

export const MOCK_PRODUCTS_RAW = SEEDS.map(buildProduct);

// ── Secciones del home / carrito ────────────────────────────────────
const byIds = (ids: number[]) => ids.map((id) => MOCK_PRODUCTS_RAW.find((p) => p.id === String(id))!);

// Los títulos "Eyebrow · Título" se parten en el front (antetítulo ✦ + título).
const newest = [...MOCK_PRODUCTS_RAW].sort((x, y) => Date.parse(y.createdAt) - Date.parse(x.createdAt) || y.salesCount - x.salesCount);
const bestSellers = [...MOCK_PRODUCTS_RAW].sort((x, y) => y.salesCount - x.salesCount);
const inCategory = (categoryId: number) => bestSellers.filter((p) => p.categoryId === String(categoryId));

export const MOCK_SECTIONS_RAW = [
  { id: 1, title: 'Recién llegados · Novedades', order: 1, placement: 'home', isActive: true, products: newest.slice(0, 10), createdAt: NOW, updatedAt: NOW },
  { id: 2, title: 'Lo que más se pide · Tienes que probarlos', order: 2, placement: 'home', isActive: true, products: bestSellers.slice(0, 10), createdAt: NOW, updatedAt: NOW },
  { id: 4, title: 'Diseñador · Lo mejor de Valentino', order: 3, placement: 'home', isActive: true, products: bestSellers.filter((p) => p.marcaId === '9'), createdAt: NOW, updatedAt: NOW },
  { id: 5, title: 'Nicho · Los mejores nichos', order: 4, placement: 'home', isActive: true, products: inCategory(3), createdAt: NOW, updatedAt: NOW },
  { id: 6, title: 'Árabes · Árabes que rinden', order: 5, placement: 'home', isActive: true, products: inCategory(2), createdAt: NOW, updatedAt: NOW },
  { id: 3, title: 'Completa tu pedido', order: 1, placement: 'cart', isActive: true, products: byIds([3, 11, 12, 14]), createdAt: NOW, updatedAt: NOW },
];

// ── Combos ──────────────────────────────────────────────────────────
// Cada combo tiene 3 versiones (3, 5 y 10 ml por perfume). La base es la de 3 ml y
// `versions` trae las otras dos, como las entrega el backend. "Antes" = suma de los
// decants de cada perfume en ese tamaño; el precio del combo es un % de ese "antes".
const COMBO_ML = [3, 5, 10] as const;
const COMBO_FACTOR: Record<number, number> = { 3: 0.82, 5: 0.868, 10: 0.932 };

const decantOf = (productId: number, ml: number) => {
  const prod = MOCK_PRODUCTS_RAW.find((p) => p.id === String(productId))!;
  return prod.variations.find((v) => !v.isFullBottle && v.mlSize === ml)!;
};

const comboVersion = (
  id: number,
  name: string,
  description: string,
  productIds: number[],
  image: string,
  ml: number,
  parentId: number | null,
  /** Precios explícitos por perfume y precio final (para ejemplos exactos). */
  override?: { each: number[]; final: number },
) => {
  const variations = productIds.map((pid, i) => {
    const v = decantOf(pid, ml);
    return override ? { ...v, price: override.each[i].toFixed(2) } : v;
  });
  const before = variations.reduce((sum, v) => sum + Number(v.price), 0);
  const final = override ? override.final : round2(before * COMBO_FACTOR[ml]);
  return {
    id: String(id),
    name,
    description,
    imageUrl: image,
    imageKey: image,
    finalPrice: final.toFixed(2),
    discount: '0.00',
    isActive: true,
    parentComboId: parentId == null ? null : String(parentId),
    versions: [] as unknown[],
    comboProducts: productIds.map((pid, i) => ({
      id: String(id * 10 + i),
      comboId: String(id),
      productId: String(pid),
      productVariationId: Number(variations[i].id),
      quantity: 1,
      product: MOCK_PRODUCTS_RAW.find((p) => p.id === String(pid)),
      productVariation: variations[i],
    })),
    createdAt: NOW,
    updatedAt: NOW,
  };
};

const combo = (
  id: number,
  name: string,
  description: string,
  productIds: number[],
  image: string,
  overrides?: Record<number, { each: number[]; final: number }>,
) => {
  const [base, ...rest] = COMBO_ML.map((ml, i) =>
    comboVersion(i === 0 ? id : id * 100 + ml, name, description, productIds, image, ml, i === 0 ? null : id, overrides?.[ml]),
  );
  return { ...base, versions: rest };
};

export const MOCK_COMBOS_RAW = [
  combo(1, 'Trío Árabe', 'Tres árabes icónicos en formato decant para descubrir cuál es el tuyo. Dulces, especiados y de gran proyección: una forma fácil de entrar al mundo árabe sin comprometerte con un frasco.', [5, 6, 13], '/yara.webp'),
  combo(2, 'Dúo Diseñador', 'Dos clásicos de las grandes casas, listos para estrenar.', [2, 3], '/chanel.webp'),
  combo(3, 'Noche Intensa', 'Fragancias de noche, proyección alta y rastro memorable.', [1, 12, 13], '/sauvage.webp'),
  combo(4, 'Isla Hawas', 'Cuatro decants para vivir el verano árabe: frescura, dulzor y un rastro que se queda todo el día.', [5, 6, 13, 7], '/valentine.webp', {
    3: { each: [5.48, 5.48, 5.47, 5.47], final: 17.95 },
    5: { each: [7.48, 7.48, 7.47, 7.47], final: 25.95 },
    10: { each: [13.13, 13.13, 13.12, 13.12], final: 48.95 },
  }),
];

// ── Banners ─────────────────────────────────────────────────────────
interface BannerCopy {
  eyebrow?: string;
  highlight?: string;
  paragraph?: string;
  bgColor?: string;
  theme?: 'light' | 'dark';
  showSeal?: boolean;
}

const banner = (
  id: number,
  type: string,
  title: string,
  subtitle: string,
  image: string,
  link: string,
  buttonText: string,
  copy: BannerCopy = {},
) => ({
  id: String(id),
  title,
  subtitle,
  imageUrl: image,
  imageKey: image,
  mobileImageUrl: null,
  mobileImageKey: null,
  link,
  buttonText,
  type,
  isVisible: true,
  position: id,
  categoryId: null,
  marcaId: null,
  createdAt: NOW,
  updatedAt: NOW,
  ...copy,
});

// 5 slides del prototipo: texto sobre fondo de color + foto (mitad derecha / arriba en móvil).
export const MOCK_BANNERS_RAW = [
  banner(1, 'hero', 'El frasco de $270, en 3 ml por $11,75.', 'Prueba antes de comprometerte con el frasco entero.', '/home.webp', '/catalogo/perfumes', 'Ver perfumes', {
    eyebrow: 'Decants originales',
    highlight: 'en 3 ml por $11,75.',
    paragraph: 'Sale de la botella original, sellada y verificada. Pruébalo una semana antes de decidir por el frasco.',
    bgColor: '#F3ECDA',
    theme: 'light',
    showSeal: true,
  }),
  banner(2, 'hero', 'Árabes con intensidad que dura todo el día.', 'Proyección alta y estela memorable.', '/home-3.webp', '/catalogo/perfumes', 'Ver árabes', {
    eyebrow: 'Árabes que rinden',
    highlight: 'que dura todo el día.',
    paragraph: 'Lattafa, Armaf y más casas árabes, con decants desde $4,15 para elegir sin arriesgar.',
    bgColor: '#1B1919',
    theme: 'dark',
  }),
  banner(3, 'hero', 'Los clásicos de diseñador, en la medida que quieras.', 'Decants de 3, 5 y 10 ml.', '/home-5.webp', '/catalogo/perfumes', 'Ver diseñador', {
    eyebrow: 'Diseñador',
    highlight: 'en la medida que quieras.',
    paragraph: 'Dior, Chanel, Valentino y más. Elige 3, 5 o 10 ml y quédate con el frasco cuando lo tengas claro.',
    bgColor: '#F0EEEA',
    theme: 'light',
  }),
  banner(4, 'hero', 'Casas pequeñas, perfumes de autor.', 'Frascos sellados bajo pedido.', '/home-1.webp', '/bajo-pedido', 'Ver bajo pedido', {
    eyebrow: 'Nicho',
    highlight: 'perfumes de autor.',
    paragraph: 'Frascos sellados que traemos en 13 a 17 días, con pago anticipado.',
    bgColor: '#2E2C2A',
    theme: 'dark',
  }),
  banner(5, 'hero', 'Tres decants, una sola decisión.', 'Combos NonDecants.', '/home-6.webp', '/catalogo/combos', 'Ver combos', {
    eyebrow: 'Combos',
    highlight: 'una sola decisión.',
    paragraph: 'Decants que se llevan juntos, con descuento. Ideal para regalar o para descubrir tu próximo favorito.',
    bgColor: '#F3ECDA',
    theme: 'light',
  }),
  banner(6, 'catalog_perfumes', 'Perfumes', 'Diseñador, árabes y más.', '/banner-catalog.webp', '/catalogo/perfumes', ''),
  banner(7, 'catalog_bajo_pedido', 'Bajo pedido', 'Nichos importados para ti.', '/banner-catalog.webp', '/bajo-pedido', ''),
];

// ── Blog, reseñas, ajustes ──────────────────────────────────────────
export const MOCK_BLOG_RAW = [
  { id: '1', title: 'Cómo elegir tu primer perfume árabe', slug: 'como-elegir-tu-primer-perfume-arabe', excerpt: 'Guía rápida para entender notas, proyección y duración.', content: '<p>Los perfumes árabes se distinguen por su intensidad y su duración. Empieza por un gourmand suave como <strong>Yara</strong> o por un especiado como <strong>Khamrah</strong>.</p><p>Prueba primero en decant: es la forma más inteligente de decidir.</p>', imageUrl: '/home-3.webp', imageKey: null, isPublished: true, position: 0, publishedAt: '2026-09-20T12:00:00.000Z', createdAt: NOW, updatedAt: NOW },
  { id: '2', title: 'Decant vs. frasco completo', slug: 'decant-vs-frasco-completo', excerpt: 'Cuándo conviene probar y cuándo comprar la botella.', content: '<p>Un decant te deja vivir el perfume una semana antes de comprometerte con 100 ml.</p>', imageUrl: '/home-4.webp', imageKey: null, isPublished: true, position: 1, publishedAt: '2026-09-28T12:00:00.000Z', createdAt: NOW, updatedAt: NOW },
];

export const MOCK_REVIEWS_RAW = [
  { id: 1, productId: 2, productName: 'Bleu de Chanel', customerName: 'Andrés M.', variantLabel: '10 ml', rating: 5, comment: 'Llegó rápido y huele increíble. Ya pedí el frasco.', createdAt: '2026-09-21T17:33:30.054Z', verified: true },
  { id: 2, productId: 5, productName: 'Yara', customerName: 'Valeria P.', variantLabel: '5 ml', rating: 5, comment: 'Suave y dulce, justo lo que buscaba.', createdAt: '2026-09-25T12:10:00.000Z', verified: true },
  { id: 3, productId: 6, productName: 'Khamrah', customerName: 'Diego R.', variantLabel: '100 ml', rating: 4, comment: 'Dura todo el día. Muy buena relación precio-calidad.', createdAt: '2026-10-02T09:00:00.000Z', verified: true },
  { id: 4, productId: 1, productName: 'Sauvage Elixir', customerName: 'Camila T.', variantLabel: '3 ml', rating: 5, comment: 'Perfecto para probar antes de comprar la botella.', createdAt: '2026-10-05T15:45:00.000Z', verified: true },
];

export const MOCK_SETTINGS_RAW: Record<string, string> = {
  announcement_bar: JSON.stringify(['Envío a todo Ecuador en 24–72 h', 'Código NOD: $5 de descuento', 'Perfumes 100% originales y sellados', 'Decants desde $4,15', 'Asesoría por WhatsApp antes de comprar', 'Ambiente de demostración']),
  delivery_days_offset: '0',
  dispatch_cutoff_hour: '15',
  free_shipping_threshold: '0',
};
