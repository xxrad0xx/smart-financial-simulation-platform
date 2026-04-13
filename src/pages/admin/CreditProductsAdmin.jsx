import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCatalog } from '../../context/CatalogContext.jsx'
import { PERIODICITY_LABELS } from '../../lib/periodicity.js'
import { formatCurrency, formatPercent } from '../../lib/currency.js'

export default function CreditProductsAdmin() {
  const { creditProducts, setCreditProducts } = useCatalog()
  const [editingId, setEditingId] = useState(null)

  const toNumber = (v, fallback = 0) => {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : fallback
  }

  const clampMin = (n, min = 0) => Math.max(min, toNumber(n, min))

  const update = (id, patch) => {
    setCreditProducts(creditProducts.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const remove = (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    setCreditProducts(creditProducts.filter((p) => p.id !== id))
  }

  const duplicate = (p) => {
    const copy = {
      ...p,
      id: `${p.id}_copy_${crypto.randomUUID()}`,
      nombre: `${p.nombre} (copia)`,
    }
    setCreditProducts([...creditProducts, copy])
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tipos de crédito</h1>
          <p className="mt-1 text-sm text-slate-600">Alta, edición y estado activo/inactivo.</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          style={{ backgroundColor: 'var(--sfici-primary)' }}
          onClick={() => {
            const id = `nuevo_${crypto.randomUUID()}`
            setCreditProducts([
              ...creditProducts,
              {
                id,
                nombre: 'Nuevo producto',
                tasaAnual: 0.12,
                tasaMoratoria: 0.24,
                montoMin: 1000,
                montoMax: 50000,
                plazoMinMeses: 12,
                plazoMaxMeses: 60,
                periodicidades: ['mensual'],
                porcentajeEntrada: 0,
                cobrosIds: [],
                activo: true,
              },
            ])
            setEditingId(id)
          }}
        >
          Nuevo producto
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50/90 to-slate-50 text-xs uppercase tracking-wide text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tasa anual</th>
              <th className="px-4 py-3">Montos</th>
              <th className="px-4 py-3">Plazo (meses)</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {creditProducts.map((p) => (
              <tr
                key={p.id}
                className={[
                  'group transition-colors',
                  'odd:bg-white even:bg-slate-50/40',
                  'hover:bg-emerald-50/30',
                  editingId === p.id ? 'bg-emerald-50/50 ring-1 ring-inset ring-emerald-200/60' : '',
                ].join(' ')}
              >
                <td className="px-4 py-3 align-top">
                  {editingId === p.id ? (
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                      value={p.nombre}
                      onChange={(e) => update(p.id, { nombre: e.target.value })}
                    />
                  ) : (
                    <div className="min-w-48">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{p.nombre}</span>
                        {!p.activo && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        ID: <span className="font-mono text-[11px]">{p.id}</span>
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  {editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                        value={toNumber(p.tasaAnual, 0)}
                        onChange={(e) => update(p.id, { tasaAnual: clampMin(e.target.value, 0) })}
                      />
                      <span className="text-xs font-medium text-slate-500">{formatPercent(toNumber(p.tasaAnual, 0))}</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-800">
                      {formatPercent(toNumber(p.tasaAnual, 0))}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-xs text-slate-600">
                  {editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-500">Min</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                          value={toNumber(p.montoMin, 0)}
                          onChange={(e) => update(p.id, { montoMin: clampMin(e.target.value, 0) })}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-500">Max</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                          value={toNumber(p.montoMax, 0)}
                          onChange={(e) => update(p.id, { montoMax: clampMin(e.target.value, 0) })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-nowrap">
                      <div className="text-xs font-semibold tabular-nums text-slate-800">
                        {formatCurrency(toNumber(p.montoMin, 0))} – {formatCurrency(toNumber(p.montoMax, 0))}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {toNumber(p.montoMin, 0).toLocaleString('es-EC')} – {toNumber(p.montoMax, 0).toLocaleString('es-EC')}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-xs text-slate-600">
                  {editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-500">Min</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                          value={toNumber(p.plazoMinMeses, 1)}
                          onChange={(e) => update(p.id, { plazoMinMeses: clampMin(e.target.value, 1) })}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-500">Max</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                          value={toNumber(p.plazoMaxMeses, 1)}
                          onChange={(e) => update(p.id, { plazoMaxMeses: clampMin(e.target.value, 1) })}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-800">
                      {toNumber(p.plazoMinMeses, 0)} – {toNumber(p.plazoMaxMeses, 0)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <span className="sr-only">Activo</span>
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={p.activo}
                      onChange={(e) => update(p.id, { activo: e.target.checked })}
                    />
                    <span
                      className={[
                        'relative inline-flex h-6 w-10 items-center rounded-full border transition',
                        'shadow-sm ring-1 ring-slate-900/5',
                        'bg-slate-200 border-slate-200',
                        'peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/15',
                        'peer-checked:bg-emerald-600 peer-checked:border-emerald-600',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition',
                          'peer-checked:translate-x-[1.125rem]',
                        ].join(' ')}
                      />
                    </span>
                    <span className="text-xs font-medium text-slate-600">{p.activo ? 'Activo' : 'Inactivo'}</span>
                  </label>
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    className="text-sky-700 transition hover:text-sky-900 hover:underline"
                    onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                  >
                    {editingId === p.id ? 'Listo' : 'Editar'}
                  </button>
                  <button
                    type="button"
                    className={[
                      'ml-2 text-slate-500 transition hover:text-slate-700 hover:underline',
                      'opacity-0 group-hover:opacity-100 focus:opacity-100',
                    ].join(' ')}
                    onClick={() => duplicate(p)}
                  >
                    Duplicar
                  </button>
                  <button
                    type="button"
                    className={[
                      'ml-2 text-red-600 transition hover:text-red-700 hover:underline',
                      'opacity-0 group-hover:opacity-100 focus:opacity-100',
                    ].join(' ')}
                    onClick={() => remove(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Información</p>
        <p className="mt-2 text-sm leading-relaxed">
          Periodicidades disponibles:{' '}
          <span className="font-medium text-slate-700">
            {Object.values(PERIODICITY_LABELS).join(', ')}
          </span>
          . Elige las que apliquen a cada producto según tu forma de cobro.
        </p>
        <p className="mt-1 text-sm leading-relaxed">
          Si el crédito incluye cargos adicionales (por ejemplo, seguros o comisiones), configúralos en{' '}
          <span className="font-medium text-slate-700">Cobros indirectos</span>.
        </p>
      </div>
    </motion.div>
  )
}
