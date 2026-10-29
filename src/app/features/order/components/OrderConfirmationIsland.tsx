import { useState, useEffect, useRef } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import GoogleReviewOptIn from './GoogleReviewOptIn';

type Status = 'loading' | 'paid' | 'failed' | 'transfer';

interface OrderData {
  id?: number;
  orderNumber: string;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  customerEmail?: string;
  transferReceiptUrl?: string;
}

function OrderConfirmationContent() {
  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // PayPhone may send 'id' or 'paymentId'
    const paymentId = params.get('id') || params.get('paymentId');
    const clientTransactionId = params.get('clientTransactionId');
    const orderId = params.get('orderId');
    const method = params.get('method');

    if (method === 'TRANSFERENCIA' && orderId) {
      setStatus('transfer');
      setOrder({ orderNumber: String(orderId), total: 0, id: Number(orderId) || undefined });
      return;
    }

    if (paymentId && clientTransactionId) {
      verifyPayment(paymentId, clientTransactionId);
    } else {
      setStatus('failed');
      setError(
        `No se encontraron datos de pago. Parámetros recibidos: ${window.location.search || '(ninguno)'}`,
      );
    }
  }, []);

  const verifyPayment = async (paymentId: string, clientTransactionId: string) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.VERIFY_PAYMENT, {
        params: { id: paymentId, clientTransactionId },
      });
      const result = data?.data ?? data;

      if (result.paymentStatus === 'paid' || result.approved) {
        setStatus('paid');
        setOrder(result.order);
      } else {
        setStatus('failed');
        setError(result.transactionStatusName || 'Pago no aprobado');
      }
    } catch (err: any) {
      setStatus('failed');
      setError(err.response?.data?.message || 'Error al verificar el pago');
    }
  };

  const handleUploadReceipt = async (file: File) => {
    if (!order?.id) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      await axiosInstance.post(`/payments/${order.id}/upload-receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReceiptUploaded(true);
      sonnerResponse('Comprobante subido exitosamente', 'success');
    } catch {
      sonnerResponse('Error al subir el comprobante', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 md:py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-text" />
        <p className="font-body text-base text-text-muted">Verificando tu pago...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto my-5 grid max-w-[640px] justify-items-center gap-3.5 rounded-md border border-border bg-surface p-7 text-center md:p-14">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error text-bg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="font-display text-[clamp(34px,4vw,48px)] leading-none text-text">Pago no completado</h1>
        <p className="max-w-[44ch] font-body text-[17px] text-text-soft">{error}</p>
        <a href="/checkout" className="inline-flex h-[52px] items-center justify-center rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg transition-colors hover:bg-text-soft mt-2">
          Intentar de nuevo
        </a>
      </div>
    );
  }

  const isTransfer = status === 'transfer';

  return (
    <div className="mx-auto my-5 grid max-w-[640px] justify-items-center gap-3.5 rounded-md border border-border bg-surface p-7 text-center md:p-14">
      <GoogleReviewOptIn
        orderId={order?.id || order?.orderNumber}
        email={order?.customerEmail}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-bg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="font-display text-[clamp(34px,4vw,48px)] leading-none text-text">
        {isTransfer ? '¡Orden registrada!' : '¡Pago exitoso!'}
      </h1>

      {order?.orderNumber && (
        <p className="font-body text-[17px] text-text-soft">
          Orden: <span className="font-bold text-text">{order.orderNumber}</span>
        </p>
      )}

      {!isTransfer && order?.total ? (
        <p className="font-body text-[17px] text-text-soft">
          Total pagado: <span className="font-bold tabular-nums text-text">{formatCurrency(order.total)}</span>
        </p>
      ) : null}

      {/* Transfer: receipt already uploaded during checkout */}
      {isTransfer && (
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 rounded-md bg-gold-light px-4 py-4 text-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="font-body text-[15px] text-text-soft">Comprobante enviado. Te notificaremos cuando confirmemos tu pago.</p>
          </div>
        </div>
      )}

      <p className="mt-1 max-w-[44ch] font-body text-[15px] text-text-muted">
        Te enviaremos los detalles a <span className="font-semibold text-text">{order?.customerEmail || 'tu correo'}</span>.
      </p>

      <div className="mt-4 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <a href="/mi-cuenta" className="inline-flex h-[52px] items-center justify-center rounded-sm bg-text px-7 font-body text-[14.5px] font-semibold text-bg transition-colors hover:bg-text-soft flex-1">
          Ver mi pedido
        </a>
        <a href="/catalogo/perfumes" className="inline-flex h-[52px] flex-1 items-center justify-center rounded-sm border-[1.5px] border-text px-7 font-body text-[14.5px] font-semibold text-text transition-colors hover:bg-bg-alt">
          Seguir comprando
        </a>
      </div>
    </div>
  );
}

export default function OrderConfirmationIsland() {
  return (
    <AppProviders>
      <OrderConfirmationContent />
    </AppProviders>
  );
}
