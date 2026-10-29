export default function PaymentConfirmation() {
  return (
    <div className="mx-auto my-5 grid max-w-[640px] justify-items-center gap-3.5 rounded-md border border-border bg-surface p-7 text-center md:p-14">
      <img src="/logonondecants.png" alt="NönDecants" width={543} height={127} className="h-9 w-auto md:h-11" />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-bg">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="font-display text-[clamp(34px,4vw,48px)] leading-none text-text">
        ¡Gracias por tu pedido!
      </h1>
      <p className="max-w-[44ch] font-body text-[17px] text-text-soft">
        Estaremos trabajando para suministrarte tu pedido lo más rápido posible.
      </p>
    </div>
  );
}
