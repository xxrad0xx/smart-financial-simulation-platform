import { useMemo } from 'react'
import { useRequest } from '../../../context/RequestContext.jsx'
import { useCatalog } from '../../../context/CatalogContext.jsx'
import { formatCurrency } from '../../../lib/currency.js'

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
              'rounded-xl border-2 p-5 text-left transition hover:shadow-md',
              productoId === p.id ? 'border-sky-500 bg-sky-50/50 shadow' : 'border-slate-200 bg-white',
            ].join(' ')}
          >
            <h3 className="font-medium text-slate-900">{p.nombre}</h3>
            <p className="mt-2 text-3xl font-bold" style={{ color: productoId === p.id ? 'var(--sfici-primary)' : '#64748b' }}>
              {p.tasaAnual}%
            </p>
            <p className="mt-1 text-xs text-slate-500">Tasa anual</p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>{formatCurrency(p.montoMin)} — {formatCurrency(p.montoMax)}</p>
              <p>{p.plazoMinMeses} — {p.plazoMaxMeses} meses</p>
            </div>
          </button>
        ))}
      </div>
      {!productoId && <p className="text-xs text-amber-600">Seleccione un producto para continuar.</p>}
      <div className="flex justify-between">
        <button type="button" className="rounded-lg border border-slate-200 px-5 py-2 text-sm" onClick={() => setStep(2)}>Anterior</button>
        <button type="button" disabled={!productoId} className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--sfici-primary)' }} onClick={() => setStep(4)}>Siguiente</button>
      </div>
    </div>
  )
}
