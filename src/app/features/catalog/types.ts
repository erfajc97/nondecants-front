export type CategoryKey = 'todos' | 'disenador' | 'nicho' | 'arabes' | 'bajo-pedido';

/** Secciones del panel (sin Concentración, Proyección ni deslizador). */
export type FilterSection = 'genders' | 'momentos' | 'precios' | 'notas' | 'casas';

export type SortKey = 'pedidos' | 'menor' | 'mayor' | 'novedades';

export interface CatalogCriteria {
  category: CategoryKey;
  genders: string[];
  momentos: string[];
  precios: string[];
  notas: string[];
  casas: string[];
  /** Solo llega por enlace (?search=) desde el buscador del header. */
  search: string;
  /** Vista de marca: solo productos de esa casa. */
  marcaId?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

export interface FilterContext {
  catKeyById: Map<number, CategoryKey>;
}

export interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
}
