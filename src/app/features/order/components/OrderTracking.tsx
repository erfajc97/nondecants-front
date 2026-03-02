interface OrderTrackingProps {
  trackingCode?: string;
}

export default function OrderTracking({ trackingCode }: OrderTrackingProps) {
  if (!trackingCode) {
    return (
      <div className="bg-[--color-surface] border border-[--color-border] p-5" style={{ borderRadius: 'var(--radius-md)' }}>
        <p className="text-sm text-[--color-text-muted]">
          El código de seguimiento estará disponible cuando el pedido sea despachado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[--color-surface] border border-[--color-border] p-5" style={{ borderRadius: 'var(--radius-md)' }}>
      <p className="font-heading text-xs uppercase tracking-wider text-[--color-text-muted] mb-2">
        Seguimiento Servientrega
      </p>
      <p className="font-heading text-lg text-[--color-accent]">{trackingCode}</p>
      <a
        href={`https://www.servientrega.com.ec/rastreo/?guia=${trackingCode}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs text-[--color-accent] hover:underline"
      >
        Rastrear en Servientrega →
      </a>
    </div>
  );
}
