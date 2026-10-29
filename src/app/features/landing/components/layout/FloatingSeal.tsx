import { useEffect, useState } from 'react';
import NodSeal from '@/app/components/UI/NodSeal';
import PhosphorIcon from '@/assets/svg/PhosphorIcon';

const WHATSAPP_URL = 'https://wa.me/593992305463';

/**
 * Botón flotante de WhatsApp (prototipo de marca): el sello NöD girando, con la
 * burbuja verde de WhatsApp en la esquina. A los 4,2 s aparece un globo de
 * ayuda que se oculta solo (o al hacer scroll). Mismo número oficial del sitio.
 */
export default function FloatingSeal() {
  const [shown, setShown] = useState(false);
  const [bubble, setBubble] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setShown(true), 900);
    let hide: number | undefined;
    const bub = window.setTimeout(() => {
      setBubble(true);
      hide = window.setTimeout(() => setBubble(false), 6500);
    }, 4200);
    const startY = { v: 0 };
    const onScroll = () => {
      if (startY.v === 0) startY.v = window.scrollY;
      if (Math.abs(window.scrollY - startY.v) > 80) setBubble(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(bub);
      if (hide) window.clearTimeout(hide);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
      className={`fseal ${shown ? 'in' : ''}`}
    >
      <span className={`fseal-bub ${bubble ? 'on' : ''}`} aria-hidden="true">
        ¿No sabes cuál elegir?<b>Te asesoramos por WhatsApp</b>
      </span>
      <NodSeal />
      <span className="fseal-wa">
        <PhosphorIcon name="whatsappLogo" className="h-[17px] w-[17px] max-[820px]:h-[15px] max-[820px]:w-[15px]" />
      </span>
    </a>
  );
}
