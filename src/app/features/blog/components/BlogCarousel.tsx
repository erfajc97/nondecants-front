import useEmblaCarousel from 'embla-carousel-react';
import { useBlogPostsQuery, type BlogPost } from '@/app/tanstack-queries/blogQuery';
import { useCarouselNav, EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import SectionHead, { RoundArrow, PillLink } from '@/app/features/landing/components/shared/SectionHead';

/**
 * Sección Blog del home (REQ-006): carrusel de tarjetas editoriales.
 * Desktop: 3 tarjetas por vista, flechas redondas en la cabecera (prototipo
 * de marca). Mobile: 1 tarjeta a la vez (con la siguiente asomando), sin
 * flechas.
 * Los datos llegan por TanStack Query (misma query pública del blog).
 */

const fmtDate = (d?: string | null) => {
  if (!d) return '';
  const parts = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(new Date(d));
  return parts
    .map((p) => (p.type === 'month' ? p.value.charAt(0).toUpperCase() + p.value.slice(1) : p.value))
    .join('');
};

/** Tiempo de lectura estimado (~200 palabras por minuto). */
const readingTime = (post: BlogPost) => {
  const text = (post.content || post.excerpt || '').replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const excerptOf = (post: BlogPost) =>
  post.excerpt || (post.content ? post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

function BlogCard({ post }: { post: BlogPost }) {
  const date = fmtDate(post.publishedAt || post.createdAt);
  const excerpt = excerptOf(post);

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group/card flex h-full flex-col overflow-hidden rounded-[4px] border border-border bg-surface transition-[border-color,box-shadow] duration-300 hover:border-border-accent hover:shadow-[0_18px_40px_-28px_var(--color-text)]"
    >
      {/* Imagen con categoría encima, abajo a la izquierda */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-alt">
        <img
          src={post.imageUrl || '/banner-catalog.webp'}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-bg px-2.5 py-1.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-text shadow-[0_0_0_1px_var(--color-border)]">
          Blog
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="line-clamp-2 font-display text-[22px] font-normal leading-[1.15] text-text">
          {post.title}
        </h3>

        {/* Fecha de publicación + tiempo de lectura */}
        <div className="mt-2 flex items-center gap-2 font-body text-xs text-text-muted">
          {date && <span>{date}</span>}
          {date && <span aria-hidden="true">·</span>}
          <span>{readingTime(post)} min de lectura</span>
        </div>

        {excerpt && (
          <p className="mt-2.5 line-clamp-2 font-body text-sm leading-relaxed text-text-soft">
            {excerpt}
          </p>
        )}

        {/* Enlace al artículo (anclado al pie de la tarjeta) */}
        <div className="mt-auto pt-3.5">
          <span className="font-body text-[13px] font-semibold text-accent-hover transition-colors group-hover/card:text-text">
            Ver artículo →
          </span>
        </div>
      </div>
    </a>
  );
}

export default function BlogCarousel() {
  const { data: posts = [], isLoading } = useBlogPostsQuery();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', duration: EMBLA_DURATION });
  const { canPrev, canNext, scrollPrev, scrollNext } = useCarouselNav(emblaApi);

  if (isLoading) {
    return (
      <section className="bg-bg py-[clamp(44px,5.5vw,76px)]" aria-hidden="true">
        <div className="mx-auto max-w-[1480px] animate-pulse px-[max(16px,3.4vw)]">
          <div className="h-9 w-40 rounded-sm bg-border-soft md:h-11" />
          <div className="mt-6 grid gap-[18px] md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={i > 0 ? 'hidden md:block' : ''}>
                <div className="aspect-[4/3] w-full rounded-[4px] bg-border-soft" />
                <div className="mt-5 h-6 w-4/5 rounded-sm bg-border-soft" />
                <div className="mt-3 h-3 w-1/2 rounded-sm bg-border-soft" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <SectionHead
          eyebrow="Del blog"
          title="Blog"
          right={
            <>
              <RoundArrow direction="prev" onClick={scrollPrev} disabled={!canPrev} />
              <RoundArrow direction="next" onClick={scrollNext} disabled={!canNext} />
              <PillLink href="/blog">Descubre el blog</PillLink>
            </>
          }
        />

        {/* Carrusel de tarjetas */}
        <div className="-mr-[max(16px,3.4vw)] overflow-hidden min-[821px]:mr-0" ref={emblaRef}>
          <div className="-ml-2.5 flex min-[821px]:-ml-[18px]">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="min-w-0 shrink-0 basis-[85%] pl-2.5 min-[821px]:basis-1/2 min-[821px]:pl-[18px] min-[1181px]:basis-1/3"
              >
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
