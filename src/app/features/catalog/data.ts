import type { CategoryKey, FilterOption, SortKey } from './types';

export const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'disenador', label: 'Diseñador' },
  { key: 'nicho', label: 'Nicho' },
  { key: 'arabes', label: 'Árabes' },
  { key: 'bajo-pedido', label: 'Bajo pedido' },
];

export const CATEGORY_COPY: Record<CategoryKey, { title: string; subtitle: string }> = {
  todos: {
    title: 'Perfumes',
    subtitle: 'Diseñador, nicho y árabes. Todos originales y en decant.',
  },
  disenador: {
    title: 'Diseñador',
    subtitle: 'Los clásicos de las grandes casas, en decant o frasco sellado.',
  },
  nicho: {
    title: 'Nicho',
    subtitle: 'Casas pequeñas y fragancias de autor. Originales, con decant para probar.',
  },
  arabes: {
    title: 'Árabes',
    subtitle: 'Intensidad, dulzor y proyección de Medio Oriente, a precio justo.',
  },
  'bajo-pedido': {
    title: 'Bajo pedido',
    subtitle: 'Frascos sellados que traemos en 13 a 17 días, con pago anticipado.',
  },
};

export const GENDER_OPTIONS: FilterOption[] = [
  { value: 'HOMBRE', label: 'Hombre' },
  { value: 'MUJER', label: 'Mujer' },
  { value: 'UNISEX', label: 'Unisex' },
];

/** `label` es también lo que se busca en `product.occasion`. */
export const MOMENTO_OPTIONS: FilterOption[] = [
  { value: 'oficina', label: 'Oficina' },
  { value: 'noche', label: 'Noche' },
  { value: 'cita', label: 'Cita' },
  { value: 'verano', label: 'Verano' },
  { value: 'invierno', label: 'Invierno' },
  { value: 'fiesta', label: 'Fiesta' },
];

/** Rangos del precio del decant de 3 ml. */
export const PRICE3_OPTIONS: (FilterOption & { test: (n: number) => boolean })[] = [
  { value: 'hasta5', label: 'Hasta $5', test: (n) => n <= 5 },
  { value: '5a8', label: '$5 a $8', test: (n) => n > 5 && n <= 8 },
  { value: 'mas8', label: 'Más de $8', test: (n) => n > 8 },
];

/** 14 notas con su punto de color (valor = nombre normalizado, sin tildes). */
export const NOTE_OPTIONS: FilterOption[] = [
  { value: 'bergamota', label: 'Bergamota', color: '#C9D46A' },
  { value: 'vainilla', label: 'Vainilla', color: '#EAD8A6' },
  { value: 'ambar', label: 'Ámbar', color: '#C98A2B' },
  { value: 'lavanda', label: 'Lavanda', color: '#9B8FC9' },
  { value: 'jazmin', label: 'Jazmín', color: '#F2EBD7' },
  { value: 'pachuli', label: 'Pachulí', color: '#6E5B3A' },
  { value: 'cedro', label: 'Cedro', color: '#A9743F' },
  { value: 'rosa', label: 'Rosa', color: '#E39AA6' },
  { value: 'canela', label: 'Canela', color: '#A4552A' },
  { value: 'almizcle', label: 'Almizcle', color: '#D9CFC0' },
  { value: 'sandalo', label: 'Sándalo', color: '#C7A26B' },
  { value: 'haba tonka', label: 'Haba tonka', color: '#7A5230' },
  { value: 'vetiver', label: 'Vetiver', color: '#6F8A5B' },
  { value: 'cafe', label: 'Café', color: '#4A3326' },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'pedidos', label: 'Más pedidos' },
  { value: 'menor', label: 'Menor precio' },
  { value: 'mayor', label: 'Mayor precio' },
  { value: 'novedades', label: 'Novedades' },
];

/** Atajos viejos del home (?momento=DIA|NOCHE) → momentos nuevos. */
export const LEGACY_MOMENTO: Record<string, string> = { DIA: 'oficina', NOCHE: 'noche' };
