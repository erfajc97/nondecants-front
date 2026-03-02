import AuthModal from './components/AuthModal';

interface AuthModalIslandProps {
  open: boolean;
  onClose: () => void;
}

// Island integrado en Navbar — se activa con client:load
export default function AuthModalIsland({ open, onClose }: AuthModalIslandProps) {
  return <AuthModal open={open} onClose={onClose} />;
}
