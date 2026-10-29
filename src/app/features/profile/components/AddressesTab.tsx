import { useAddressesHook } from '../hooks/useAddressesHook';
import AddressForm from './AddressForm';

/**
 * Pestaña "Mis direcciones" (REQ-062): lista las direcciones guardadas con su
 * alias y badge de predeterminada, y permite crear, editar, eliminar (con
 * confirmación) y marcar una como predeterminada para el checkout.
 */
export default function AddressesTab() {
  const {
    addresses,
    isLoading,
    formOpen,
    editing,
    isSaving,
    startCreate,
    startEdit,
    cancelForm,
    submitForm,
    confirmDeleteId,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
    deletingId,
    markDefault,
    isMarkingDefault,
    markingDefaultId,
  } = useAddressesHook();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-normal text-text">Mis direcciones</h2>
        <p className="mt-1 font-body text-sm text-text-soft">
          Guárdalas una vez y reutilízalas en cada compra
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-text" />
        </div>
      ) : (
        <>
          {addresses.length === 0 && !formOpen && (
            <div className="border border-border bg-surface py-12 text-center">
              <p className="font-body text-sm text-text-muted">No tienes direcciones guardadas.</p>
              <p className="mt-1 font-body text-xs text-text-muted">
                Agrega una y se preseleccionará en tu próximo checkout.
              </p>
            </div>
          )}

          {addresses.map((address) => {
            const busy =
              (isDeleting && deletingId === address.id) ||
              (isMarkingDefault && markingDefaultId === address.id);
            return (
              <div key={address.id} className="border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-normal text-text">{address.alias}</p>
                  {address.isDefault && (
                    <span className="bg-accent/10 px-2 py-0.5 font-body text-[11px] font-semibold text-accent">
                      Predeterminada
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-body text-sm text-text-soft">{address.direccion}</p>
                <p className="font-body text-xs text-text-muted">
                  {address.ciudad}{address.provincia ? `, ${address.provincia}` : ''}
                </p>
                {address.referencia && (
                  <p className="font-body text-xs text-text-muted">Ref: {address.referencia}</p>
                )}
                <p className="font-body text-xs text-text-muted">Tel: {address.telefono}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    className="border border-border px-4 py-2 font-body text-[13px] font-semibold text-text-soft transition-colors hover:border-text hover:text-text"
                  >
                    Editar
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => markDefault(address.id)}
                      disabled={busy}
                      className="border border-border px-4 py-2 font-body text-[13px] font-semibold text-text-soft transition-colors hover:border-text hover:text-text disabled:opacity-50"
                    >
                      {isMarkingDefault && markingDefaultId === address.id
                        ? 'Marcando…'
                        : 'Predeterminada'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => requestDelete(address.id)}
                    disabled={busy}
                    className="border border-border px-4 py-2 font-body text-[13px] font-semibold text-text-soft transition-colors hover:border-error hover:text-error disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>

                {confirmDeleteId === address.id && (
                  <div className="mt-4 border border-error/40 bg-error-muted p-3.5">
                    <p className="font-body text-xs text-text-soft">
                      ¿Eliminar "{address.alias}"? Esta acción no se puede deshacer.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => confirmDelete(address.id)}
                        disabled={isDeleting}
                        className="bg-error px-4 py-2 font-body text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {isDeleting && deletingId === address.id ? 'Eliminando…' : 'Sí, eliminar'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelDelete}
                        disabled={isDeleting}
                        className="border border-border px-4 py-2 font-body text-[13px] font-semibold text-text-soft transition-colors hover:border-text hover:text-text disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {formOpen ? (
            <AddressForm
              initial={editing}
              isPending={isSaving}
              onSubmit={submitForm}
              onCancel={cancelForm}
            />
          ) : (
            <button
              type="button"
              onClick={startCreate}
              className="w-full border border-dashed border-border px-6 py-4 font-body text-[14.5px] font-semibold tracking-[0.01em] text-text-soft transition-colors hover:border-text hover:text-text"
            >
              + Agregar dirección
            </button>
          )}
        </>
      )}
    </div>
  );
}
