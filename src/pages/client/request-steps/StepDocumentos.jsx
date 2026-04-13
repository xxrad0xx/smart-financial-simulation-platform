import { useCallback } from 'react'
import { useRequest } from '../../../context/RequestContext.jsx'

const docs = [
  { key: 'docComprobanteIngresos', label: 'Comprobante de ingresos', desc: 'Rol de pagos o certificado laboral', required: true },
  { key: 'docPlanillaServicios', label: 'Planilla de servicios básicos', desc: 'Luz, agua o teléfono reciente', required: true },
  { key: 'docDeclaracionImpuestos', label: 'Declaración de impuestos', desc: 'Solo para montos superiores a $20,000', required: false },
]

export default function StepDocumentos() {
  const ctx = useRequest()
  const { updateField, setStep } = ctx
  const needsDeclaracion = ctx.monto > 20000

  const handleFile = useCallback((key, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateField(key, reader.result)
    reader.readAsDataURL(file)
  }, [updateField])

  const getFileName = (dataUrl) => {
    if (!dataUrl) return null
    const match = dataUrl.match(/^data:([^;]+)/)
    const type = match ? match[1] : 'archivo'
    const size = Math.round((dataUrl.length * 3) / 4 / 1024)
    return `${type} (${size} KB)`
  }

  const canAdvance = ctx.docComprobanteIngresos && ctx.docPlanillaServicios &&
    (!needsDeclaracion || ctx.docDeclaracionImpuestos)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Documentos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Suba los documentos requeridos. La cédula se capturará con cámara en el siguiente paso.
        </p>
      </div>

      <div className="space-y-4">
        {docs.map((d) => {
          const isRequired = d.required || (d.key === 'docDeclaracionImpuestos' && needsDeclaracion)
          const value = ctx[d.key]
          const isImage = value && value.startsWith('data:image')

          return (
            <div
              key={d.key}
              className={[
                'rounded-2xl border border-dashed p-5 text-center shadow-sm ring-1 ring-slate-900/5 transition',
                value
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50/40',
              ].join(' ')}
            >
              <h3 className="font-medium text-slate-900">
                {d.label} {isRequired && <span className="text-red-500">*</span>}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{d.desc}</p>

              {value ? (
                <div className="mt-3 space-y-2">
                  {isImage && <img src={value} alt={d.label} className="mx-auto max-h-32 rounded-xl object-contain shadow-sm ring-1 ring-slate-900/5" />}
                  <p className="text-xs font-medium text-emerald-700">{getFileName(value)}</p>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/10"
                    onClick={() => updateField(d.key, null)}
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <label className="mt-3 inline-block cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  Seleccionar archivo
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFile(d.key, e.target.files?.[0])} />
                </label>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          onClick={() => setStep(5)}
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={!canAdvance}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
          style={{ backgroundColor: 'var(--sfici-primary)' }}
          onClick={() => setStep(7)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
