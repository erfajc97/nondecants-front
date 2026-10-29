import { ORDER_STATUS_CONFIG } from '../data';

interface OrderStatusBadgeProps {
  status: string;
}

const FALLBACK = { label: 'Sin estado', color: 'bg-bg-alt text-text-muted border-border' };

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status] ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-[11px] font-semibold uppercase leading-none tracking-[0.08em] ${config.color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
