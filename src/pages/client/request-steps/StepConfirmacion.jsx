import { useRequest } from '../../../context/RequestContext.jsx'
import { formatCurrency } from '../../../lib/currency.js'

const methodLabels = { frances: 'Francés (cuota fija)', aleman: 'Alemán (capital constante)' }

export default function StepConfirmacion() {
  const ctx = useRequest()
  const { updateField, setStep } = ctx
  const allAccepted = ctx.aceptaTerminos && ctx.aceptaDatos && ctx.aceptaVeracidad

  const checks = [
    { key: 'aceptaVeracidad', label: 'Declaro que la información proporcionada es verídica y autorizo su verificación.' },
    { key: 'aceptaTerminos', label: 'Acepto los términos y condiciones del crédito, incluyendo la tasa de interés y cobros indirectos aplicables.' },
    { key: 'aceptaDatos', label: 'Autorizo el tratamiento de mis datos personales y biométricos para fines de validación de identidad.' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Confirmación</h2>
        <p className="mt-1 text-sm text-slate-600">Revise el resumen y acepte las condiciones.</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">Resumen de la solicitud</h3>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-amber-800/70">Cliente:</span> <strong className="text-amber-900">{ctx.nombres} {ctx.apellidos}</strong></div>
          <div><span className="text-amber-800/70">Cédula:</span> <strong className="text-amber-900">{ctx.cedula}</strong></div>
          <div><span className="text-amber-800/70">Email:</span> <strong className="text-amber-900">{ctx.email}</strong></div>
          <div><span className="text-amber-800/70">Producto:</span> <strong className="text-amber-900">{ctx.productoNombre}</strong></div>
          <div><span className="text-amber-800/70">Monto:</span> <strong className="text-amber-900">{formatCurrency(ctx.monto)}</strong></div>
          <div><span className="text-amber-800/70">Plazo:</span> <strong className="text-amber-900">{ctx.plazoMeses} meses</strong></div>
          <div><span className="text-amber-800/70">Método:</span> <strong className="text-amber-900">{methodLabels[ctx.metodoAmortizacion]}</strong></div>
          <div><span className="text-amber-800/70">Cuota:</span> <strong className="text-amber-900">{formatCurrency(ctx.cuotaMensual)}</strong></div>
          <div><span className="text-amber-800/70">Total a pagar:</span> <strong className="text-amber-900">{formatCurrency(ctx.totalPagar)}</strong></div>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((c) => (
          <label key={c.key} className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={ctx[c.key]} onChange={(e) => updateField(c.key, e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
            <span className="text-slate-700">{c.label}</span>
          </label>
        ))}
      </div>

      {!allAccepted && <p className="text-xs text-amber-600">Debe aceptar todas las condiciones para continuar.</p>}

      <div className="flex justify-between">
        <button type="button" className="rounded-lg border border-slate-200 px-5 py-2 text-sm" onClick={() => setStep(4)}>Anterior</button>
        <button type="button" disabled={!allAccepted} className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--sfici-primary)' }} onClick={() => setStep(6)}>Siguiente</button>
      </div>
    </div>
  )
}
