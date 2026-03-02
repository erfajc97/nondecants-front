import type { CustomerFormData } from '../types';

interface CustomerFormProps {
  data: CustomerFormData;
  onChange: (field: keyof CustomerFormData, value: string) => void;
}

const fields: { key: keyof CustomerFormData; label: string; type?: string; placeholder: string; required?: boolean }[] = [
  { key: 'name',    label: 'Nombre completo',   placeholder: 'Tu nombre',       required: true },
  { key: 'email',   label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.com', required: true },
  { key: 'phone',   label: 'Teléfono',           type: 'tel',   placeholder: '09XXXXXXXX',   required: true },
  { key: 'city',    label: 'Ciudad',             placeholder: 'Guayaquil',       required: true },
  { key: 'address', label: 'Dirección',          placeholder: 'Calle, número, referencia (para envíos)' },
];

export default function CustomerForm({ data, onChange }: CustomerFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-base uppercase tracking-wider text-[--color-text]">
        Datos de contacto
      </h2>
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-xs text-[--color-text-muted] mb-1.5 uppercase tracking-wider">
            {field.label} {field.required && <span className="text-[--color-error]">*</span>}
          </label>
          <input
            type={field.type ?? 'text'}
            value={data[field.key]}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] text-sm focus:outline-none focus:border-[--color-accent] transition-colors"
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      ))}
    </div>
  );
}
