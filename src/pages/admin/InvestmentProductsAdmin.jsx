import { motion } from 'framer-motion'
import { useCatalog } from '../../context/CatalogContext.jsx'

export default function InvestmentProductsAdmin() {
  const { investmentProducts, setInvestmentProducts } = useCatalog()

  const toNumber = (v, fallback = 0) => {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : fallback
  }

  const update = (id, patch) => {
    setInvestmentProducts(investmentProducts.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Productos de inversión</h1>
        <p className="mt-1 text-sm text-slate-600">Tasas, plazos y parámetros de capitalización.</p>
      </div>

      <div className="grid gap-4">
        {investmentProducts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-medium text-slate-900">{p.nombre}</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  ID: <span className="font-mono text-[11px]">{p.id}</span>
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <span className="sr-only">Renovación automática</span>
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={p.renovacionAuto}
                  onChange={(e) => update(p.id, { renovacionAuto: e.target.checked })}
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
                <span className="text-sm font-medium text-slate-700">Renovación automática</span>
              </label>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs">
                <span className="text-slate-500">Tasa anual</span>
                <input
                  type="number"
                  step="0.001"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                  value={toNumber(p.tasaAnual, 0)}
                  onChange={(e) => update(p.id, { tasaAnual: toNumber(e.target.value, 0) })}
                />
              </label>
              <label className="text-xs">
                <span className="text-slate-500">Monto mínimo</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                  value={toNumber(p.montoMin, 0)}
                  onChange={(e) => update(p.id, { montoMin: toNumber(e.target.value, 0) })}
                />
              </label>
              <label className="text-xs">
                <span className="text-slate-500">Penalización retiro</span>
                <input
                  type="number"
                  step="0.001"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                  value={toNumber(p.penalizacionRetiro, 0)}
                  onChange={(e) => update(p.id, { penalizacionRetiro: toNumber(e.target.value, 0) })}
                />
              </label>
              <label className="text-xs">
                <span className="text-slate-500">Impuesto aplicable</span>
                <input
                  type="number"
                  step="0.001"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                  value={toNumber(p.impuesto, 0)}
                  onChange={(e) => update(p.id, { impuesto: toNumber(e.target.value, 0) })}
                />
              </label>
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <p className="text-xs text-slate-500">
                Plazos (meses): <span className="font-medium text-slate-700">{p.plazoMeses.join(', ')}</span> ·
                {' '}Capitalización: <span className="font-medium text-slate-700">{p.capitalizacion}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
