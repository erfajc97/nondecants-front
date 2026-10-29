interface OrderTrackingProps {
  trackingCode?: string;
}

export default function OrderTracking({ trackingCode }: OrderTrackingProps) {
  if (!trackingCode) {
    return (
      <div className="rounded-md border border-border bg-surface p-5">
        <p className="mb-2 font-body text-[17px] font-bold text-text">Seguimiento Servientrega</p>
        <p className="font-body text-[15px] text-text-muted">
          El código de seguimiento estará disponible cuando el pedido sea despachado.
        </p>
      </div>
    );
  }

  const trackingUrl = `https://www.servientrega.com.ec/Tracking/Index/?guia=${encodeURIComponent(trackingCode)}`;

  const handleTrackingClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(trackingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <p className="mb-2 font-body text-[17px] font-bold text-text">Seguimiento Servientrega</p>
      <p className="mb-4 font-body text-xl font-bold tabular-nums text-accent-hover">{trackingCode}</p>
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleTrackingClick}
        className="inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg no-underline transition-colors hover:bg-text-soft sm:w-auto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        Rastrear envío en Servientrega
      </a>
    </div>
  );
}
