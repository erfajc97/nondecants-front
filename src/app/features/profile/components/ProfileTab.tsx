import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/app/store/auth/authStore';
import { useLogoutMutation } from '@/app/features/auth/mutations/useLogoutMutation';
import { useResendVerificationMutation } from '@/app/features/auth/mutations/useResendVerificationMutation';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import Loader from '@/app/components/Loader';
import SearchableSelect from '@/app/components/UI/SearchableSelect';
import { PROVINCE_NAMES, cantonsOf, ALL_CANTONS } from '@/app/data/ecuadorLocations';

const INPUT =
  'w-full border border-border bg-surface px-3.5 py-3 font-body text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none transition-colors';
const INPUT_RO =
  'w-full border border-border bg-bg-alt px-3.5 py-3 font-body text-sm text-text-soft cursor-default';
const SELECT =
  'w-full cursor-pointer appearance-none border border-border bg-surface px-3.5 py-3 font-body text-sm text-text focus:border-text focus:outline-none transition-colors';
const LABEL = 'mb-2 block font-body text-[13px] font-semibold text-text-muted';

export default function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const { mutate: resendVerification, isPending: isResending } = useResendVerificationMutation();

  const [isSaving, setIsSaving] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    cedula: '',
    phone: '',
    province: '',
    city: '',
    address: '',
    reference: '',
    preferredDeliveryMethod: '',
  });
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    axiosInstance.get(API_ENDPOINTS.USER_ME).then(({ data }) => {
      const u = data?.data ?? data;
      setIsGoogleUser(u.authProvider === 'google');
      setEmail(u.email ?? '');
      setForm({
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        cedula: u.cedula ?? '',
        phone: u.phone ?? '',
        province: u.province ?? '',
        city: u.city ?? '',
        address: u.address ?? '',
        reference: u.reference ?? '',
        preferredDeliveryMethod: u.preferredDeliveryMethod ?? '',
      });
      if (user) {
        setUser({
          ...user,
          name: `${u.firstName} ${u.lastName}`.trim(),
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email ?? user.email,
          phone: u.phone,
          cedula: u.cedula,
          province: u.province,
          city: u.city,
          address: u.address,
          reference: u.reference,
          preferredDeliveryMethod: u.preferredDeliveryMethod,
        });
      }
    }).catch(() => {});
  }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await axiosInstance.patch(API_ENDPOINTS.USER_ME, form);
      const u = data?.data ?? data;
      if (user) {
        setUser({
          ...user,
          name: `${u.firstName} ${u.lastName}`.trim(),
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone,
          cedula: u.cedula,
          province: u.province,
          city: u.city,
          address: u.address,
          reference: u.reference,
          preferredDeliveryMethod: u.preferredDeliveryMethod,
        });
      }
      sonnerResponse('Perfil actualizado', 'success');
    } catch {
      sonnerResponse('Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.current || !pwdForm.next) {
      sonnerResponse('Completa la contraseña actual y la nueva', 'error');
      return;
    }
    if (pwdForm.next.length < 8) {
      sonnerResponse('La nueva contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    if (pwdForm.next !== pwdForm.confirm) {
      sonnerResponse('La confirmación no coincide', 'error');
      return;
    }
    setIsChangingPwd(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: pwdForm.current,
        newPassword: pwdForm.next,
      });
      sonnerResponse('Contraseña actualizada', 'success');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      sonnerResponse(
        typeof msg === 'string' ? msg : 'No se pudo cambiar la contraseña',
        'error',
      );
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-normal text-text">Mi perfil</h2>
        <p className="mt-1 font-body text-sm text-text-soft">Administra tu información personal y de envío</p>
      </div>

      {/* Email verification warning */}
      {user && !user.isEmailVerified && (
        <div className="border border-warning/40 bg-warning-muted p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-warning">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="mb-3 font-body text-xs text-text-soft">Verifica tu email para desbloquear todas las funciones.</p>
              <button
                onClick={() => user.email && resendVerification(user.email)}
                disabled={isResending}
                className="rounded-[3px] bg-text px-4 py-2 font-body text-[13px] font-semibold text-bg transition-colors hover:bg-text-soft disabled:opacity-50"
              >
                {isResending ? <Loader size={14} color="#fff" /> : 'Reenviar correo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal data */}
      <div className="border border-border bg-surface p-6">
        <span className="eyebrow mb-5 block">Datos personales</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Nombre</label>
            <input type="text" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Apellido</label>
            <input type="text" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>
              Email
              {isGoogleUser && <span className="ml-1.5 normal-case text-text-muted">(Google — no editable)</span>}
            </label>
            <input type="email" value={email} readOnly className={INPUT_RO} />
          </div>
          <div>
            <label className={LABEL}>Cédula</label>
            <input type="text" value={form.cedula} onChange={(e) => updateField('cedula', e.target.value)} placeholder="0912345678" className={INPUT} />
          </div>
        </div>
      </div>

      {/* Contact & shipping */}
      <div className="border border-border bg-surface p-6">
        <span className="eyebrow mb-5 block">Contacto y envío</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Teléfono</label>
            <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="09XXXXXXXX" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Provincia</label>
            <SearchableSelect
              value={form.province}
              options={PROVINCE_NAMES}
              placeholder="Buscar provincia"
              onChange={(v) => {
                updateField('province', v);
                if (v !== form.province) updateField('city', '');
              }}
            />
          </div>
          <div>
            <label className={LABEL}>Ciudad</label>
            <SearchableSelect
              value={form.city}
              options={form.province ? cantonsOf(form.province) : ALL_CANTONS}
              placeholder="Buscar ciudad"
              onChange={(v) => updateField('city', v)}
            />
          </div>
          <div>
            <label className={LABEL}>Dirección</label>
            <input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Av. Principal 123" className={INPUT} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Referencia</label>
            <input type="text" value={form.reference} onChange={(e) => updateField('reference', e.target.value)} placeholder="Cerca de..." className={INPUT} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Método de envío preferido</label>
            <select value={form.preferredDeliveryMethod} onChange={(e) => updateField('preferredDeliveryMethod', e.target.value)} className={SELECT}>
              <option value="">Sin preferencia</option>
              <option value="ENTREGA_PERSONAL">Entrega personal Plaza Tía — Gratis</option>
              <option value="RETIRO_PIWU">Retiro en Piwu Market (Urdesa) — $2</option>
              <option value="SERVIENTREGA_GYE">Servientrega (GYE - Durán - Samborondón) — $3</option>
              <option value="SERVIENTREGA_NACIONAL">Servientrega Nacional (Provincias) — $6.50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seguridad — cambiar contraseña (solo cuentas con contraseña local) */}
      {!isGoogleUser && (
        <div className="border border-border bg-surface p-6">
          <span className="eyebrow mb-5 block">Seguridad</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Contraseña actual</label>
              <input
                type="password"
                value={pwdForm.current}
                onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))}
                autoComplete="current-password"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Nueva contraseña</label>
              <input
                type="password"
                value={pwdForm.next}
                onChange={(e) => setPwdForm((p) => ({ ...p, next: e.target.value }))}
                autoComplete="new-password"
                placeholder="Mín. 8 caracteres"
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Confirmar nueva</label>
              <input
                type="password"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
                className={INPUT}
              />
            </div>
          </div>
          <div className="mt-5">
            <button
              onClick={handleChangePassword}
              disabled={isChangingPwd}
              className="border border-text px-8 py-3 font-body text-[14.5px] font-semibold tracking-[0.01em] text-text transition-colors hover:bg-text hover:text-bg disabled:opacity-50"
            >
              {isChangingPwd ? <Loader size={16} /> : 'Cambiar contraseña'}
            </button>
          </div>
        </div>
      )}

      {/* Save + Logout */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-[3px] bg-text px-8 py-3.5 font-body text-[14.5px] font-semibold tracking-[0.01em] text-bg transition-colors hover:bg-text-soft disabled:opacity-50"
        >
          {isSaving ? <Loader size={16} color="#fff" /> : 'Guardar cambios'}
        </button>
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="border border-border px-8 py-3.5 font-body text-[14.5px] font-semibold tracking-[0.01em] text-text-soft transition-colors hover:border-text hover:text-text disabled:opacity-50"
        >
          {isLoggingOut ? <Loader size={16} /> : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );
}
