import type { OrderStatus } from '@/app/types/global.types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING:    { label: 'Pendiente',    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  CONFIRMED:  { label: 'Confirmada',   color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  PROCESSING: { label: 'En proceso',   color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  SHIPPED:    { label: 'Enviada',      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' },
  DELIVERED:  { label: 'Entregada',    color: 'bg-green-500/20 text-green-400 border-green-500/40' },
  CANCELLED:  { label: 'Cancelada',    color: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-heading tracking-wider uppercase border ${config.color}`}
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      {config.label}
    </span>
  );
}
