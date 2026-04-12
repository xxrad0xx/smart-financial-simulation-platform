import { useState } from 'react'
import { useRequest } from '../../../context/RequestContext.jsx'

const ESTADO_CIVIL_OPTIONS = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión libre']
const ANTIGUEDAD_OPTIONS = ['Menos de 1 año', '1-2 años', '2-5 años', 'Más de 5 años']

export default function StepDatosPersonales() {
  const ctx = useRequest()
  const { updateField, setStep } = ctx
  const [errors, setErrors] = useState({})

  const fields = [
    { key: 'nombres', label: 'Nombres', type: 'text', placeholder: 'Juan Carlos' },
    { key: 'apellidos', label: 'Apellidos', type: 'text', placeholder: 'Pérez López' },
    { key: 'telefono', label: 'Teléfono', type: 'text', placeholder: '0991234567' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
    { key: 'direccion', label: 'Dirección', type: 'text', placeholder: 'Av. 10 de Agosto y Colón' },
    { key: 'ciudadResidencia', label: 'Ciudad de residencia', type: 'text', placeholder: 'Quito' },
    { key: 'estadoCivil', label: 'Estado civil', type: 'select', options: ESTADO_CIVIL_OPTIONS },
    { key: 'empresa', label: 'Empresa donde trabaja', type: 'text', placeholder: 'Empresa ABC S.A.' },
    { key: 'antiguedadLaboral', label: 'Antigüedad laboral', type: 'select', options: ANTIGUEDAD_OPTIONS },
    { key: 'ingresosMensuales', label: 'Ingresos mensuales ($)', type: 'number', placeholder: '1500' },
    { key: 'egresosMensuales', label: 'Egresos mensuales ($)', type: 'number', placeholder: '800' },
  ]

  const validate = () => {
    const e = {}
    for (const f of fields) {
      const val = ctx[f.key]
      if (f.type === 'number') {
        if (val === undefined || val === null || val === '' || Number(val) < 0) e[f.key] = 'Requerido'
      } else if (!val || (typeof val === 'string' && !val.trim())) {
        e[f.key] = 'Requerido'
      }
    }
    if (ctx.telefono && ctx.telefono.length < 7) e.telefono = 'Mínimo 7 dígitos'
    if (Number(ctx.ingresosMensuales) <= Number(ctx.egresosMensuales)) {
      e.egresosMensuales = 'Los egresos deben ser menores a los ingresos'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Datos personales</h2>
        <p className="mt-1 text-sm text-slate-600">Complete su información personal y financiera.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="text-slate-600">{f.label}</span>
            {f.type === 'select' ? (
              <select className={inputClass} value={ctx[f.key]} onChange={(e) => updateField(f.key, e.target.value)}>
                <option value="">Seleccione...</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                type={f.type}
                value={ctx[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => updateField(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              />
            )}
            {errors[f.key] && <span className="text-xs text-red-500">{errors[f.key]}</span>}
          </label>
        ))}
      </div>
      <div className="flex justify-between">
        <button type="button" className="rounded-lg border border-slate-200 px-5 py-2 text-sm" onClick={() => setStep(1)}>Anterior</button>
        <button type="button" className="rounded-lg px-5 py-2 text-sm font-medium text-white" style={{ backgroundColor: 'var(--sfici-primary)' }} onClick={() => validate() && setStep(3)}>Siguiente</button>
      </div>
    </div>
  )
}
