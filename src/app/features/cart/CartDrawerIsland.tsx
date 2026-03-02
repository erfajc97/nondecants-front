import CartDrawer from './components/CartDrawer';

// Island que se monta en client:load desde Navbar
// Funciona gracias a Zustand shared store (no necesita Context cross-island)
export default function CartDrawerIsland() {
  return <CartDrawer />;
}
