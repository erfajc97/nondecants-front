import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/app/store/cart/cartStore';
import { useAuthStore } from '@/app/store/auth/authStore';
import { useDeliveryMethodsHook } from './useDeliveryMethodsHook';
import { useAddressesQuery } from '@/app/tanstack-queries/addressesQuery';
import { calcPayphoneSurcharge } from '@/app/helpers/calcPayphoneSurcharge';
import { splitCartStock, getSplit } from '@/app/helpers/cartStockSplit';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { normalizeCustomerField, validateContactFields } from '../validators';
import { DEMO_ENABLED } from '@/app/lib/mock';
import { ECUADOR_PROVINCES, ALL_CANTONS } from '@/app/data/ecuadorLocations';
import { isPickupMethod, PICKUP_METHODS, type DeliveryMode } from '../components/DeliverySection';
import type { CustomerFormData, PaymentMethod, DeliveryMethod } from '../types';
import { useCouponHook } from './useCouponHook';
import { useFreeShippingThresholdQuery } from '@/app/tanstack-queries/settingsQuery';

const PREFS_KEY = 'nondecants-checkout-prefs';

interface CheckoutPrefs {
  phone?: string;
  city?: string;
  address?: string;
  deliveryMethod?: DeliveryMethod;
}

function loadPrefs(): CheckoutPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePrefs(prefs: CheckoutPrefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

function buildInitialCustomer(): CustomerFormData {
  const prefs = loadPrefs();
  const user = useAuthStore.getState().user;
  return {
    name:      user?.firstName ?? user?.name ?? '',
    lastName:  user?.lastName ?? '',
    email:     user?.email ?? '',
    cedula:    user?.cedula ?? '',
    reference: user?.reference ?? '',
    phone:     user?.phone ?? prefs.phone ?? '',
    province:  user?.province ?? '',
    city:      user?.city ?? prefs.city ?? '',
    address:   user?.address ?? prefs.address ?? '',
  };
}

function getInitialDeliveryMethod(prefs: CheckoutPrefs): DeliveryMethod | null {
  const user = useAuthStore.getState().user;
  const method = user?.preferredDeliveryMethod ?? prefs.deliveryMethod;
  return (method as DeliveryMethod) ?? null;
}

interface OrderItemPayload {
  productId?: number | string;
  productVariationId?: number | string;
  quantity: number;
  priceOverride?: number;
}

export interface BackorderLine {
  name: string;
  ml?: number;
  /** Unidades que salen de stock inmediato. */
  inStock: number;
  /** Unidades que entran bajo pedido (13–17 días). */
  bajo: number;
}

/** Provincia a la que pertenece un cantón (para el envío; vacío si no se encuentra). */
function provinceOfCanton(city: string): string {
  const c = city.trim().toLowerCase();
  return ECUADOR_PROVINCES.find((p) => p.cantons.some((k) => k.toLowerCase() === c))?.name ?? '';
}

export interface PlacedOrder {
  orderNumber: string;
  email: string;
  total: number;
  method: PaymentMethod;
}

export function useCheckoutHook() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Pedido simulado del ambiente de demostración (pantalla "¡Pedido recibido!").
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  // Se activa al intentar continuar con datos incompletos: muestra errores y hace temblar.
  const [showErrors, setShowErrors] = useState(false);
  const [shakeTick, setShakeTick] = useState(0);
  const [customer, setCustomer] = useState<CustomerFormData>(buildInitialCustomer);
  const savedPrefs = loadPrefs();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(getInitialDeliveryMethod(savedPrefs));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  // Envío o retiro en tienda: filtra los métodos que se muestran.
  const initialMethod = getInitialDeliveryMethod(savedPrefs);
  const [deliveryMode, setDeliveryModeState] = useState<DeliveryMode>(
    isPickupMethod(initialMethod) ? 'pickup' : 'shipping',
  );
  const [authOpen, setAuthOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Direcciones guardadas (REQ-062): solo con sesión; el guest checkout no cambia.
  const { data: savedAddresses = [] } = useAddressesQuery();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const addressAutoApplied = useRef(false);

  // Autocompleta los datos de envío con la dirección elegida.
  // `null` = "nueva dirección": el usuario escribe los campos a mano.
  const handleSelectAddress = (id: string | null) => {
    setSelectedAddressId(id);
    if (id == null) return;
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setCustomer((prev) => ({
      ...prev,
      phone:     normalizeCustomerField('phone', addr.telefono),
      province:  addr.provincia,
      city:      addr.ciudad,
      address:   addr.direccion,
      reference: addr.referencia,
    }));
  };

  // Preselección: al cargar las direcciones se aplica la predeterminada
  // (o la primera) una sola vez, antes de que el usuario empiece a editar.
  useEffect(() => {
    if (addressAutoApplied.current || savedAddresses.length === 0) return;
    addressAutoApplied.current = true;
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    handleSelectAddress(def.id);
  }, [savedAddresses]);

  // Fetch full profile from API to pre-fill all fields
  useEffect(() => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) return;

    axiosInstance.get(API_ENDPOINTS.USER_ME).then(({ data }) => {
      const u = data?.data ?? data;
      const prefs = loadPrefs();
      setCustomer((prev) => ({
        name:      prev.name || u.firstName || '',
        lastName:  prev.lastName || u.lastName || '',
        email:     prev.email || u.email || '',
        cedula:    prev.cedula || u.cedula || '',
        reference: prev.reference || u.reference || '',
        phone:     prev.phone || u.phone || prefs.phone || '',
        province:  prev.province || u.province || '',
        city:      prev.city || u.city || prefs.city || '',
        address:   prev.address || u.address || prefs.address || '',
      }));
      if (u.preferredDeliveryMethod && !deliveryMethod) {
        setDeliveryMethod(u.preferredDeliveryMethod as DeliveryMethod);
      }
    }).catch(() => {});
  }, []);

  // Coupon — compartido con el carrito (sessionStorage).
  const {
    couponCode,
    couponDiscount,
    couponFreeShipping,
    couponApplied,
    couponLoading,
    couponMessage,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
  } = useCouponHook();
  const { data: freeShippingThreshold = 0 } = useFreeShippingThresholdQuery();

  const items    = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.total());

  const { methods: deliveryOptions, isLoading: deliveryLoading } = useDeliveryMethodsHook(
    deliveryMode === 'pickup' ? 'Guayaquil' : customer.city,
  );

  // La ciudad se elige DESPUÉS del método: si la nueva ciudad no admite el
  // método ya marcado, se limpia (antes se borraba con cualquier cambio de
  // ciudad, lo que obligaba a volver arriba siempre).
  useEffect(() => {
    if (!deliveryMethod) return;
    if (!deliveryOptions.some((m) => m.method === deliveryMethod)) {
      setDeliveryMethod(null);
    }
  }, [deliveryOptions, deliveryMethod]);

  const afterDiscount = Math.max(0, subtotal - (couponApplied ? couponDiscount : 0));
  const qualifiesFreeShipping =
    (couponApplied && couponFreeShipping) ||
    (freeShippingThreshold > 0 && afterDiscount >= freeShippingThreshold);
  const deliveryCost = qualifiesFreeShipping
    ? 0
    : deliveryMethod
      ? (deliveryOptions.find((m) => m.method === deliveryMethod)?.cost ?? 0)
      : 0;
  const isPayphone = paymentMethod === 'PAYPHONE';
  const payphoneSurcharge = isPayphone ? calcPayphoneSurcharge(afterDiscount + deliveryCost) : 0;
  const total = afterDiscount + deliveryCost + payphoneSurcharge;

  const clearCart = useCartStore((s) => s.clearCart);

  // Desglose bajo pedido: incluye items 100% bajo pedido, frascos con stock
  // PARCIAL y decants cuyo ml ya está comprometido por los frascos del mismo
  // producto que van en el carrito (13–17 días). Se usa para el modal de
  // confirmación con detalle por producto.
  const splits = splitCartStock(items);
  const backorderItems: BackorderLine[] = items
    .map((i) => {
      const s = getSplit(splits, i);
      return { name: i.name, ml: i.ml, inStock: s.inStock, bajo: s.bajo };
    })
    .filter((b) => b.bajo > 0);
  const hasBajoPedido = backorderItems.length > 0;
  const [bajoConfirm, setBajoConfirm] = useState<
    null | { kind: 'submit' } | { kind: 'transfer'; file: File }
  >(null);

  const handleCustomerChange = (field: keyof CustomerFormData, value: string) => {
    const next = normalizeCustomerField(field, value);
    setCustomer((prev) => ({ ...prev, [field]: next }));
  };

  // Al cambiar de modo se limpia el método si pertenece al otro grupo.
  const setDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryModeState(mode);
    setDeliveryMethod((current) => {
      if (current == null) return null;
      const currentIsPickup = PICKUP_METHODS.includes(current);
      return currentIsPickup === (mode === 'pickup') ? current : null;
    });
  };

  // ── Paso 1: entrega ─────────────────────────────────────────────────
  const isPickup = deliveryMode === 'pickup';

  // Envío: la ciudad define el método y el costo ($3 Guayaquil/Durán/Samborondón,
  // $6,50 resto). Quita la selección si cambia a una ciudad que no admite el método.
  // La ciudad debe ser un cantón de la lista (el buscador deja escribir texto libre).
  const cityIsValid = ALL_CANTONS.some((k) => k.toLowerCase() === customer.city.trim().toLowerCase());

  const setCity = (city: string) => {
    setCustomer((prev) => ({ ...prev, city, province: provinceOfCanton(city) || prev.province }));
  };

  useEffect(() => {
    if (deliveryMode !== 'shipping') return;
    if (!cityIsValid) {
      if (deliveryMethod) setDeliveryMethod(null);
      return;
    }
    const ship = deliveryOptions.find((m) => !PICKUP_METHODS.includes(m.method));
    if (ship && ship.method !== deliveryMethod) setDeliveryMethod(ship.method);
  }, [deliveryMode, customer.city, cityIsValid, deliveryOptions]);

  const step1Done = deliveryMethod != null && (isPickup || cityIsValid);

  // ── Paso 2: datos ───────────────────────────────────────────────────
  const contactErrors = validateContactFields(customer, { requiresAddress: !isPickup });
  const step2Done = Object.keys(contactErrors).length === 0;

  const continueStep1 = () => {
    if (!step1Done) return;
    if (items.length === 0) {
      sonnerResponse('Tu carrito está vacío.', 'error');
      return;
    }
    setShowErrors(false);
    setStep(2);
  };

  const continueStep2 = () => {
    if (!step2Done) {
      setShowErrors(true);
      setShakeTick((t) => t + 1);
      return;
    }
    // Guarda preferencias para la próxima compra
    savePrefs({
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      deliveryMethod: deliveryMethod ?? undefined,
    });
    setShowErrors(false);
    setStep(3);
  };

  // ── Confirmación ────────────────────────────────────────────────────
  const canConfirm =
    step1Done &&
    step2Done &&
    paymentMethod != null &&
    termsAccepted &&
    items.length > 0 &&
    (paymentMethod !== 'TRANSFERENCIA' || receiptFile != null);

  const missing: string[] = [];
  if (!step1Done) missing.push(isPickup ? 'elegir el punto de retiro' : 'elegir tu ciudad');
  if (!step2Done) missing.push('completar tus datos');
  if (!paymentMethod) missing.push('elegir cómo pagar');
  else if (paymentMethod === 'TRANSFERENCIA' && !receiptFile) missing.push('subir tu comprobante');
  if (!termsAccepted) missing.push('aceptar los términos');
  const missingText = missing.length ? `Para confirmar falta: ${missing.join(', ')}.` : '';

  /** Pedido simulado: en la demo no se llama a la API. */
  const simulatePlaced = () => {
    setIsPending(true);
    window.setTimeout(() => {
      setPlaced({
        orderNumber: 'ND-48213',
        email: customer.email,
        total,
        method: paymentMethod ?? 'TRANSFERENCIA',
      });
      setIsPending(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  };

  const handleSubmit = async () => {
    if (!paymentMethod) {
      sonnerResponse('Selecciona un método de pago.', 'error');
      return;
    }
    if (DEMO_ENABLED) return simulatePlaced();

    setIsPending(true);

    try {
      // Save contact data to user profile in background
      const isAuth = useAuthStore.getState().isAuthenticated;
      if (isAuth) {
        axiosInstance.patch(API_ENDPOINTS.USER_ME, {
          firstName: customer.name,
          lastName: customer.lastName,
          phone: customer.phone,
          cedula: customer.cedula,
          province: customer.province,
          city: customer.city,
          address: customer.address,
          reference: customer.reference,
          preferredDeliveryMethod: deliveryMethod,
        }).catch(() => {}); // fire and forget
      }

      // Expand combo items into individual products for the backend
      const orderItems = items.flatMap((item): OrderItemPayload | OrderItemPayload[] => {
        if (item.comboProducts && item.comboProducts.length > 0) {
          // Distribute combo price proportionally across items
          const comboPrice = item.price; // This is the combo's actual price (finalPrice - discount)
          const numProducts = item.comboProducts.length;
          const pricePerItem = Math.round((comboPrice / numProducts) * 100) / 100;
          // Last item gets the remainder to avoid rounding errors
          const lastItemPrice = Math.round((comboPrice - pricePerItem * (numProducts - 1)) * 100) / 100;

          return item.comboProducts.map((cp: any, idx: number) => {
            const override = idx === numProducts - 1 ? lastItemPrice : pricePerItem;
            if (cp.productVariationId) {
              return { productVariationId: cp.productVariationId, quantity: cp.quantity * item.quantity, priceOverride: override };
            }
            if (cp.productId) {
              return { productId: cp.productId, quantity: cp.quantity * item.quantity, priceOverride: override };
            }
            return { productId: parseInt(item.productId, 10), quantity: cp.quantity * item.quantity, priceOverride: override };
          });
        }
        // Regular item
        const isFullBottle = item.variantId.startsWith('full-');
        if (isFullBottle) {
          return { productId: parseInt(item.productId, 10), quantity: item.quantity };
        }
        return { productVariationId: parseInt(item.variantId, 10), quantity: item.quantity };
      });

      const payload = {
        items: orderItems,
        paymentMethod,
        customerName: `${customer.name} ${customer.lastName}`.trim(),
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingCity: customer.city || (isPickup ? 'Guayaquil' : ''),
        shippingAddress: customer.address,
        customerCedula: customer.cedula || undefined,
        shippingProvince: customer.province || undefined,
        shippingReference: customer.reference || undefined,
        deliveryMethod,
        deliveryCost,
        couponCode: couponApplied ? couponCode : undefined,
        couponDiscount: couponApplied ? couponDiscount : undefined,
        notes: [
          customer.cedula && `Cédula: ${customer.cedula}`,
          customer.reference && `Ref: ${customer.reference}`,
          customer.province && `Provincia: ${customer.province}`,
        ].filter(Boolean).join(' | ') || undefined,
      };

      const { data } = await axiosInstance.post(API_ENDPOINTS.CREATE_TRANSACTION, payload);
      const result = data?.data ?? data;

      // handleSubmit SOLO corre para PAYPHONE (transferencia usa
      // handleTransferSubmit). La pasarela devuelve payWithCard (paymentUrl)
      // y/o payWithPayPhone. Si no hay enlace, NO fingir compra exitosa: el
      // pedido pudo crearse sin poder iniciar el pago con tarjeta.
      const gatewayUrl = result.paymentUrl || result.payWithPayPhone;
      if (gatewayUrl) {
        clearCart();
        window.location.href = gatewayUrl;
      } else {
        throw new Error(
          'No se pudo iniciar el pago con tarjeta. Vuelve a intentarlo o escríbenos por WhatsApp para completar tu pedido.',
        );
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Error al crear la orden';
      sonnerResponse(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setIsPending(false);
    }
  };

  const handleTransferSubmit = async (receiptFile: File) => {
    if (DEMO_ENABLED) return simulatePlaced();
    setIsPending(true);
    try {
      // Save profile in background
      const isAuth = useAuthStore.getState().isAuthenticated;
      if (isAuth) {
        axiosInstance.patch(API_ENDPOINTS.USER_ME, {
          firstName: customer.name,
          lastName: customer.lastName,
          phone: customer.phone,
          cedula: customer.cedula,
          province: customer.province,
          city: customer.city,
          address: customer.address,
          reference: customer.reference,
          preferredDeliveryMethod: deliveryMethod,
        }).catch(() => {});
      }

      // Build order items (same logic as handleSubmit)
      const orderItems = items.flatMap((item): OrderItemPayload | OrderItemPayload[] => {
        if (item.comboProducts && item.comboProducts.length > 0) {
          const comboPrice = item.price;
          const numProducts = item.comboProducts.length;
          const pricePerItem = Math.round((comboPrice / numProducts) * 100) / 100;
          const lastItemPrice = Math.round((comboPrice - pricePerItem * (numProducts - 1)) * 100) / 100;

          return item.comboProducts.map((cp: any, idx: number) => {
            const override = idx === numProducts - 1 ? lastItemPrice : pricePerItem;
            if (cp.productVariationId) {
              return { productVariationId: cp.productVariationId, quantity: cp.quantity * item.quantity, priceOverride: override };
            }
            if (cp.productId) {
              return { productId: cp.productId, quantity: cp.quantity * item.quantity, priceOverride: override };
            }
            return { productId: parseInt(item.productId, 10), quantity: cp.quantity * item.quantity, priceOverride: override };
          });
        }
        const isFullBottle = item.variantId.startsWith('full-');
        if (isFullBottle) {
          return { productId: parseInt(item.productId, 10), quantity: item.quantity };
        }
        return { productVariationId: parseInt(item.variantId, 10), quantity: item.quantity };
      });

      const payload = {
        items: orderItems,
        paymentMethod: 'TRANSFERENCIA',
        customerName: `${customer.name} ${customer.lastName}`.trim(),
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingCity: customer.city || (isPickup ? 'Guayaquil' : ''),
        shippingAddress: customer.address,
        customerCedula: customer.cedula || undefined,
        shippingProvince: customer.province || undefined,
        shippingReference: customer.reference || undefined,
        deliveryMethod,
        deliveryCost,
        couponCode: couponApplied ? couponCode : undefined,
        couponDiscount: couponApplied ? couponDiscount : undefined,
        notes: [
          customer.cedula && `Cédula: ${customer.cedula}`,
          customer.reference && `Ref: ${customer.reference}`,
          customer.province && `Provincia: ${customer.province}`,
        ].filter(Boolean).join(' | ') || undefined,
      };

      // 1. Create the order
      const { data } = await axiosInstance.post(API_ENDPOINTS.CREATE_TRANSACTION, payload);
      const result = data?.data ?? data;
      const orderId = result.order?.id;

      // 2. Upload receipt immediately
      if (orderId && receiptFile) {
        const fd = new FormData();
        fd.append('receipt', receiptFile);
        // Quien compra sin sesión no tiene token: el correo del pedido es lo que
        // le permite al backend confirmar que la orden es suya.
        fd.append('email', customer.email);
        await axiosInstance.post(`/payments/${orderId}/upload-receipt`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      clearCart();
      sonnerResponse('¡Orden creada con comprobante!', 'success');
      window.location.href = `/orden/confirmacion?orderId=${orderId}&method=TRANSFERENCIA`;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al crear la orden';
      sonnerResponse(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setIsPending(false);
    }
  };

  // Gate de confirmación: si hay bajo pedido, pedir confirmación antes de enviar
  const runConfirm = () => {
    if (paymentMethod === 'TRANSFERENCIA') {
      if (receiptFile) handleTransferSubmit(receiptFile);
    } else {
      handleSubmit();
    }
  };

  const requestConfirm = () => {
    if (!canConfirm) return;
    if (hasBajoPedido) {
      setBajoConfirm({ kind: 'submit' });
      return;
    }
    runConfirm();
  };

  const confirmBajoPedido = () => {
    setBajoConfirm(null);
    runConfirm();
  };

  const cancelBajoPedido = () => setBajoConfirm(null);

  return {
    step,
    setStep,
    customer,
    deliveryMethod,
    paymentMethod,
    deliveryOptions,
    deliveryLoading,
    subtotal,
    deliveryCost,
    payphoneSurcharge,
    isPayphone,
    total,
    items,
    isPending,
    couponCode,
    couponDiscount,
    couponFreeShipping,
    couponApplied,
    couponLoading,
    couponMessage,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleCustomerChange,
    setDeliveryMethod,
    setPaymentMethod,
    termsAccepted,
    setTermsAccepted,
    deliveryMode,
    setDeliveryMode,
    isAuthenticated,
    authOpen,
    openAuth: () => setAuthOpen(true),
    closeAuth: () => setAuthOpen(false),
    // Direcciones guardadas (REQ-062)
    savedAddresses,
    selectedAddressId,
    handleSelectAddress,
    requestConfirm,
    // Pasos
    isPickup,
    setCity,
    step1Done,
    step2Done,
    contactErrors,
    showErrors,
    shakeTick,
    continueStep1,
    continueStep2,
    canConfirm,
    missingText,
    receiptFile,
    setReceiptFile,
    placed,
    // Confirmación bajo pedido
    hasBajoPedido,
    backorderItems,
    bajoConfirmOpen: bajoConfirm != null,
    confirmBajoPedido,
    cancelBajoPedido,
  };
}
