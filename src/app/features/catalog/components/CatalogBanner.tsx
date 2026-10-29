import { formatCurrency } from '@/app/helpers/formatCurrency';
import { useMarcaStats } from '../hooks/useMarcaStats';
import {
  useCatalogPageBanner,
  type CatalogBannerSlot,
} from '@/app/tanstack-queries/bannersQuery';
import { useRawCategoriesQuery } from '@/app/tanstack-queries/categoriesQuery';
import type { NavCategory, NavMarca } from '@/app/tanstack-queries/categoriesQuery';

interface CatalogBannerProps {
  defaultTitle: string;
  defaultDescription: string;
  categoryId?: number;
  marcaId?: number;
  bannerSlot?: CatalogBannerSlot;
}

function findMarca(
  categories: NavCategory[],
  marcaId: number,
): { marca: NavMarca; category: NavCategory } | null {
  for (const category of categories) {
    const marca = category.marcas.find((item) => Number(item.id) === Number(marcaId));
    if (marca) return { marca, category };
  }
  return null;
}

function StatRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="font-body text-[13px] text-text-muted">{label}</dt>
      <dd className="font-display text-[22px] leading-none text-text">{loading ? '—' : value}</dd>
    </div>
  );
}

function marcaSummary(stats: {
  decants: number;
  bajoPedido: number;
  fromPrice: number | null;
  isLoading: boolean;
}) {
  if (stats.isLoading) return '';
  const from = stats.fromPrice != null ? ` desde ${formatCurrency(stats.fromPrice)}` : '';
  const decantBit =
    stats.decants > 0
      ? `${stats.decants} ${stats.decants === 1 ? 'referencia' : 'referencias'} para probar en decant hoy${from}`
      : '';
  const backBit = stats.bajoPedido > 0 ? `${stats.bajoPedido} más por encargo` : '';
  if (decantBit && backBit) return `${decantBit} y ${backBit}.`;
  if (decantBit) return `${decantBit}.`;
  if (stats.bajoPedido > 0) {
    return `${stats.bajoPedido} ${stats.bajoPedido === 1 ? 'referencia' : 'referencias'} por encargo.`;
  }
  return '';
}

export default function CatalogBanner({
  defaultTitle,
  defaultDescription,
  categoryId,
  marcaId,
  bannerSlot,
}: CatalogBannerProps) {
  const { data: categories = [] } = useRawCategoriesQuery();
  const { data: slotBanner } = useCatalogPageBanner(bannerSlot, marcaId == null);
  const stats = useMarcaStats(marcaId);

  const found = marcaId != null ? findMarca(categories, marcaId) : null;
  const category =
    categoryId != null
      ? categories.find((item) => Number(item.id) === Number(categoryId))
      : found?.category;

  const showMarcaHeader = marcaId != null && (categories.length === 0 || found != null);

  if (showMarcaHeader) {
    const title = found?.marca.name ?? defaultTitle;
    const description = found?.marca.description?.trim() ?? '';
    const summary = marcaSummary(stats);

    return (
      <div className="border-b border-border px-4 py-6 md:px-14 md:py-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="min-w-0 max-w-2xl">
            {found?.category?.name && (
              <span className="font-body text-[13px] font-semibold text-accent-hover">{found.category.name}</span>
            )}
            <h1 className="mt-2 font-display text-[clamp(40px,6vw,84px)] font-normal leading-[0.95] tracking-[-0.025em] text-text">
              {title} en Ecuador
            </h1>
            {summary && (
              <p className="mt-4 font-body text-base leading-relaxed text-text">
                {summary}
              </p>
            )}
            {description && (
              <p className="mt-3 font-body text-[15px] leading-relaxed text-text-muted">{description}</p>
            )}
          </div>
          <div className="w-full shrink-0 rounded-sm border border-border bg-white px-5 py-4 md:max-w-xs">
            <p className="font-body text-[13px] font-semibold text-accent-hover">En cifras</p>
            <dl className="mt-1 divide-y divide-border">
              <StatRow label="Referencias" value={String(stats.total)} loading={stats.isLoading} />
              <StatRow label="En decant" value={String(stats.decants)} loading={stats.isLoading} />
              <StatRow label="Por encargo" value={String(stats.bajoPedido)} loading={stats.isLoading} />
              <StatRow
                label="Desde"
                value={stats.fromPrice != null ? formatCurrency(stats.fromPrice) : '—'}
                loading={stats.isLoading}
              />
            </dl>
          </div>
        </div>
      </div>
    );
  }

  const title = category?.name ?? defaultTitle;
  const description =
    category?.description ||
    (category ? `Explora nuestra selección de ${category.name.toLowerCase()}` : defaultDescription);
  const customImage = category?.imageUrl || slotBanner?.imageUrl || slotBanner?.image || null;
  const mobileSrc = category?.mobileImageUrl || slotBanner?.mobileImageUrl || null;

  if (!customImage) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pb-4 pt-7 md:px-14 md:pb-5 md:pt-12">
        <h1 className="font-display text-[clamp(40px,6vw,84px)] font-normal leading-[0.95] tracking-[-0.025em] text-text">
          {title}
        </h1>
        <p className="mt-2.5 max-w-[46ch] font-body text-base text-text-muted">{description}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-4 md:px-14 md:pt-8">
      <div className="relative h-44 w-full overflow-hidden rounded-sm sm:h-56 md:h-72">
        <picture>
          {mobileSrc && <source media="(max-width: 767px)" srcSet={mobileSrc} />}
          <img
            src={customImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-linear-to-t from-black/66 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 px-5 py-6 md:px-10 md:py-9">
          <h1 className="font-display text-[clamp(34px,5vw,64px)] font-normal leading-none text-white">
            {title}
          </h1>
          <p className="max-w-md font-body text-sm text-white/85">{description}</p>
        </div>
      </div>
    </div>
  );
}
