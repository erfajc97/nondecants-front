interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function AddToCartButton({ onClick, disabled }: AddToCartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 bg-[--color-accent] text-[--color-bg] font-heading uppercase tracking-widest text-sm hover:bg-[--color-accent-hover] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      Agregar al carrito
    </button>
  );
}
