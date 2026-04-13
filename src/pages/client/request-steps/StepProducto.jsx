import { useMemo } from 'react'
import { useRequest } from '../../../context/RequestContext.jsx'
import { useCatalog } from '../../../context/CatalogContext.jsx'
import { formatCurrency, formatPercent } from '../../../lib/currency.js'

export default function StepProducto() {
  const { productoId, updateFields, setStep } = useRequest()
  const { creditProducts } = useCatalog()
  const activeProducts = useMemo(() => creditProducts.filter((p) => p.activo), [creditProducts])

  const handleSelect = (p) => {
    updateFields({
      productoId: p.id,
      productoNombre: p.nombre,
      periodicidad: p.periodicidades?.[0] ?? 'mensual',
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Selección de producto</h2>
        <p className="mt-1 text-sm text-slate-600">Elija el tipo de crédito que desea solicitar.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeProducts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelect(p)}
            className={[
              'group rounded-2xl border p-5 text-left shadow-sm ring-1 ring-slate-900/5 transition',
              'hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/10',
              productoId === p.id ? 'border-emerald-400 bg-emerald-50/30 ring-emerald-200/60' : 'border-slate-200 bg-white',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-slate-900 transition group-hover:text-emerald-900">{p.nombre}</h3>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-800">
                {formatPercent(p.tasaAnual)}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Tasa anual</p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>
                <span className="font-medium text-slate-700">{formatCurrency(p.montoMin)}</span> —{' '}
                <span className="font-medium text-slate-700">{formatCurrency(p.montoMax)}</span>
              </p>
              <p>
                <span className="font-medium text-slate-700">{p.plazoMinMeses}</span> —{' '}
                <span className="font-medium text-slate-700">{p.plazoMaxMeses}</span> meses
              </p>
            </div>
            <div
              className="mt-4 h-1 w-14 rounded-full opacity-70 transition group-hover:opacity-90"
              style={{
                background: 'linear-gradient(90deg, var(--sfici-primary, #16a34a), rgba(202, 138, 4, 0.95))',
              }}
            />
          </button>
        ))}
      </div>
      {!productoId && <p className="text-xs text-amber-600">Seleccione un producto para continuar.</p>}
      <div className="flex justify-between">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          onClick={() => setStep(2)}
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={!productoId}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
          style={{ backgroundColor: 'var(--sfici-primary)' }}
          onClick={() => setStep(4)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
