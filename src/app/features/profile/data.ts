import type { ProfileTabId } from './types';

export const PROFILE_TABS: { id: ProfileTabId; label: string }[] = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'direcciones', label: 'Direcciones' },
  { id: 'pedidos', label: 'Mis Pedidos' },
];

// === TRACKING TIMELINE ===
export interface TrackingStep {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  active: boolean;
}

export const MOCK_TRACKING_STEPS: TrackingStep[] = [
  { title: 'Pedido confirmado', description: 'Tu pedido ha sido registrado exitosamente', date: '20 febrero 2026 - 10:30', completed: true, active: false },
  { title: 'Preparando tu perfume', description: 'Estamos seleccionando tu inventario', date: '20 febrero 2026 - 10:30', completed: true, active: false },
  { title: 'Empacando tu perfume', description: 'Envuelto con presentación premium', date: '20 febrero 2026 - 10:30', completed: true, active: false },
  { title: 'Enviado exitosamente', description: 'Tu paquete salió de nuestro almacén', date: '20 febrero 2026 - 10:30', completed: true, active: false },
  { title: 'En tránsito', description: 'En camino a tu Ciudad', date: '20 febrero 2026 - 10:30', completed: true, active: true },
  { title: 'En reparto', description: 'Tu perfume está cada vez más cerca', date: '20 febrero 2026 - 10:30', completed: false, active: false },
  { title: 'Entregado', description: 'Disfruta de tu nueva fragancia.', date: '', completed: false, active: false },
];

export const MOCK_TRACKING_ORDER = {
  id: 'ORD-2045Y-50ML',
  name: 'Bourbon EDP',
  image: '/home-3.webp',
  status: 'En tránsito' as const,
  progress: 83,
  estimatedDate: '25/08/2026',
};

// === ORDERS (no entregados) ===
export const MOCK_PENDING_ORDERS = [
  { id: 'ORD-2045Y-50ML', name: 'Bourbon EDP', image: '/home-3.webp', date: '20 Febrero 2026', price: 285, status: 'En tránsito' },
  { id: 'ORD-2045Y-50ML', name: 'Bourbon EDP', image: '/home-3.webp', date: '20 Febrero 2026', price: 285, status: 'Entregado' },
  { id: 'ORD-2045Y-50ML', name: 'Bourbon EDP', image: '/home-3.webp', date: '20 Febrero 2026', price: 285, status: 'Entregado' },
  { id: 'ORD-2045Y-50ML', name: 'Bourbon EDP', image: '/home-3.webp', date: '20 Febrero 2026', price: 285, status: 'Entregado' },
];

// === PROFILE ===
export const MOCK_PROFILE = {
  name: 'Alejandro Magno',
  email: 'phillipediaz@shepwashi.com',
  phone: '+525512324567',
};

export const MOCK_ADDRESSES = [
  { id: '1', label: 'Casa', address: 'Avenida 456 Ecuador Guayaquil', selected: true },
  { id: '2', label: 'Oficina', address: 'Avenida 456 Ecuador Guayaquil', selected: false },
];

export const MOCK_PREFERENCES = ['Perfumes Árabes', 'Perfumes de Nicho'];

// === PAYMENTS ===
export const MOCK_PAYMENTS = [
  { id: '1', name: 'Bourbon EDP', image: '/home-3.webp', method: 'efectivo', amount: 340000, date: '4 de Enero 2026', status: 'Pagado' },
  { id: '2', name: 'Bourbon EDP', image: '/home-3.webp', method: 'efectivo', amount: 340000, date: '4 de Enero 2026', status: 'Pagado' },
  { id: '3', name: 'Bourbon EDP', image: '/home-3.webp', method: 'efectivo', amount: 340000, date: '4 de Enero 2026', status: 'Pagado' },
];
