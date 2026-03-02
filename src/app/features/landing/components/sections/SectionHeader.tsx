interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string; // parte del título que va en dorado
}

export default function SectionHeader({ title, subtitle, accent }: SectionHeaderProps) {
  return (
    <div className="text-center mb-10">
      <h2 className="font-heading text-3xl md:text-4xl text-[--color-text] uppercase tracking-wider">
        {accent ? (
          <>
            {title}{' '}
            <span className="text-[--color-accent]">{accent}</span>
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[--color-text-muted] text-sm max-w-md mx-auto">
          {subtitle}
        </p>
      )}
      <div className="mt-4 mx-auto w-16 h-px bg-[--color-accent]" />
    </div>
  );
}
