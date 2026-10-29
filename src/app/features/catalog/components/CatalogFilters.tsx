import { useState } from 'react';
import {
  CATALOG_GENDERS,
  CATALOG_TIME_OF_DAY,
  CATALOG_CONCENTRATIONS,
  CATALOG_PROJECTIONS,
} from '../data';
import FilterPillGroup from './FilterPillGroup';
import FilterPriceRange from './FilterPriceRange';
import {
  useCategoriesWithMarcasQuery,
  sortCategoriesByHierarchy,
} from '@/app/tanstack-queries/categoriesQuery';
import type { Gender, TimeOfDay, Concentration, Projection } from '@/app/types/global.types';

interface CatalogFiltersProps {
  gender: Gender | '';
  onGenderChange: (v: Gender | '') => void;
  timeOfDay: TimeOfDay | '';
  onTimeOfDayChange: (v: TimeOfDay | '') => void;
  concentration: Concentration | '';
  onConcentrationChange: (v: Concentration | '') => void;
  projection: Projection | '';
  onProjectionChange: (v: Projection | '') => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceRangeChange: (min?: number, max?: number) => void;
  categoryId?: number;
  onCategoryChange: (v?: number) => void;
  marcaId?: number;
  onMarcaChange: (v?: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  hideCategories?: boolean;
}

const normalizeText = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Indicador cuadrado (estilo checkbox de la referencia) para listas de
 *  selección única: la API filtra por UN solo valor de marca/concentración. */
function CheckRow({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className="group -mx-1.5 flex min-h-[42px] w-[calc(100%+12px)] items-center gap-3 rounded-md px-1.5 text-left transition-colors hover:bg-bg-alt"
    >
      <span
        aria-hidden
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${
          active ? 'border-text bg-text' : 'border-[#b7b2a9] bg-white'
        }`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          className={`text-white transition-transform duration-300 ${active ? 'scale-100' : 'scale-0'}`}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="font-body text-[15px] text-text">
        {label}
      </span>
    </button>
  );
}

export default function CatalogFilters({
  gender,
  onGenderChange,
  timeOfDay,
  onTimeOfDayChange,
  concentration,
  onConcentrationChange,
  projection,
  onProjectionChange,
  maxPrice,
  onPriceRangeChange,
  categoryId,
  onCategoryChange,
  marcaId,
  onMarcaChange,
  hasActiveFilters,
  onClearFilters,
  hideCategories,
}: CatalogFiltersProps) {
  const { data: categories = [] } = useCategoriesWithMarcasQuery();
  const filteredCategories = sortCategoriesByHierarchy(
    categories.filter((c) => c.name.toLowerCase() !== 'all'),
  );

  // Marcas de la lista: las de la categoría elegida; si no hay categoría,
  // todas las marcas (dedupe por id).
  const marcaSource = categoryId
    ? (filteredCategories.find((c) => Number(c.id) === categoryId)?.marcas ?? [])
    : filteredCategories.flatMap((c) => c.marcas);
  const marcas = Array.from(new Map(marcaSource.map((m) => [String(m.id), m])).values());

  // Buscador de marcas (filtra la lista localmente).
  const [marcaSearch, setMarcaSearch] = useState('');
  const visibleMarcas = marcaSearch
    ? marcas.filter((m) => normalizeText(m.name).includes(normalizeText(marcaSearch)))
    : marcas;

  return (
    <div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="font-body text-sm font-semibold text-text-soft underline underline-offset-[3px] transition-colors hover:text-text"
        >
          Limpiar filtros
        </button>
      )}

      {/* 1. Categoría — chips (Árabes / Diseñador / Nicho primero) */}
      {!hideCategories && filteredCategories.length > 0 && (
        <FilterPillGroup
          label="1. Categoría"
          options={filteredCategories.map((c) => ({ value: String(c.id), label: c.name }))}
          selected={categoryId != null ? [String(categoryId)] : []}
          onChange={(values) => {
            const next = values.find((v) => v !== String(categoryId));
            onCategoryChange(next != null ? Number(next) : undefined);
          }}
          singleSelect
        />
      )}

      {/* 2. Género — chips */}
      <FilterPillGroup
        label="2. Género"
        options={CATALOG_GENDERS}
        selected={gender ? [gender] : []}
        onChange={(values) => {
          const next = values.find((v) => v !== gender) || '';
          onGenderChange(next as Gender | '');
        }}
        singleSelect
      />

      {/* 3. Ocasión — chips */}
      <FilterPillGroup
        label="3. Ocasión"
        options={CATALOG_TIME_OF_DAY}
        selected={timeOfDay ? [timeOfDay] : []}
        onChange={(values) => {
          const next = values.find((v) => v !== timeOfDay) || '';
          onTimeOfDayChange(next as TimeOfDay | '');
        }}
        singleSelect
      />

      {/* 4. Marca — buscador + lista */}
      {marcas.length > 0 && (
        <div className="border-b border-border py-4">
          <p className="mb-3 font-body text-[12.5px] font-bold uppercase tracking-[0.08em] text-text-muted">4. Marca</p>
          {marcas.length > 5 && (
            <input
              type="search"
              value={marcaSearch}
              onChange={(e) => setMarcaSearch(e.target.value)}
              placeholder="Buscar marca…"
              className="mb-3 h-10 w-full rounded-full border border-border bg-white px-4 font-body text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none"
            />
          )}
          <div className="grid max-h-56 gap-0.5 overflow-y-auto pr-1">
            {visibleMarcas.map((m) => (
              <CheckRow
                key={m.id}
                label={m.name}
                active={marcaId === Number(m.id)}
                onToggle={() => onMarcaChange(marcaId === Number(m.id) ? undefined : Number(m.id))}
              />
            ))}
            {visibleMarcas.length === 0 && (
              <p className="font-body text-xs text-text-muted">Sin marcas para “{marcaSearch}”.</p>
            )}
          </div>
        </div>
      )}

      {/* 5. Concentración — lista */}
      <div className="border-b border-border py-4">
        <p className="mb-3 font-body text-[12.5px] font-bold uppercase tracking-[0.08em] text-text-muted">5. Concentración</p>
        <div className="grid gap-0.5">
          {CATALOG_CONCENTRATIONS.map((opt) => (
            <CheckRow
              key={opt.value}
              label={opt.label}
              active={concentration === opt.value}
              onToggle={() =>
                onConcentrationChange(concentration === opt.value ? '' : (opt.value as Concentration))
              }
            />
          ))}
        </div>
      </div>

      {/* 6. Proyección — chips */}
      <FilterPillGroup
        label="6. Proyección"
        options={CATALOG_PROJECTIONS}
        selected={projection ? [projection] : []}
        onChange={(values) => {
          const newVal = values.find((v) => v !== projection) || '';
          onProjectionChange(newVal as Projection | '');
        }}
        singleSelect
      />

      <FilterPriceRange
        label="Precio máximo"
        min={0}
        max={500}
        value={maxPrice ?? 500}
        onChange={(val) => onPriceRangeChange(undefined, val < 500 ? val : undefined)}
      />
    </div>
  );
}
