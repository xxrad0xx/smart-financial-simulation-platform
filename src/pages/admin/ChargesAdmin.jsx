import { motion } from 'framer-motion'
import { useCatalog } from '../../context/CatalogContext.jsx'

export default function ChargesAdmin() {
  const { charges, setCharges } = useCatalog()

  const toNumber = (v, fallback = 0) => {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : fallback
  }

  const update = (id, patch) => {
    setCharges(charges.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const add = () => {
    const id = `cargo_${crypto.randomUUID()}`
    setCharges([
      ...charges,
      {
        id,
        nombre: 'Nuevo cargo',
        tipo: 'fijo',
        valor: 0,
        frecuencia: 'mensual',
        naturaleza: 'opcional',
      },
    ])
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cobros indirectos</h1>
          <p className="mt-1 text-sm text-slate-600">Fijos o porcentuales; frecuencia y obligatoriedad.</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
          style={{ backgroundColor: 'var(--sfici-primary)' }}
          onClick={add}
        >
          Nuevo cobro
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50/90 to-slate-50 text-xs uppercase tracking-wide text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Frecuencia</th>
              <th className="px-4 py-3">Naturaleza</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {charges.map((c) => (
              <tr
                key={c.id}
                className={[
                  'group transition-colors',
                  'odd:bg-white even:bg-slate-50/40',
                  'hover:bg-emerald-50/30',
                ].join(' ')}
              >
                <td className="px-4 py-3 align-top">
                  <input
                    className="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                    value={c.nombre}
                    onChange={(e) => update(c.id, { nombre: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    ID: <span className="font-mono text-[11px]">{c.id}</span>
                  </p>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                    value={c.tipo}
                    onChange={(e) => update(c.id, { tipo: e.target.value })}
                  >
                    <option value="fijo">Fijo</option>
                    <option value="porcentual">Porcentual</option>
                  </select>
                </td>
                <td className="px-4 py-3 align-top">
                  <input
                    type="number"
                    step="0.0001"
                    className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                    value={toNumber(c.valor, 0)}
                    onChange={(e) => update(c.id, { valor: toNumber(e.target.value, 0) })}
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                    value={c.frecuencia}
                    onChange={(e) => update(c.id, { frecuencia: e.target.value })}
                  >
                    <option value="mensual">Mensual</option>
                    <option value="unico">Único</option>
                  </select>
                </td>
                <td className="px-4 py-3 align-top">
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                    value={c.naturaleza}
                    onChange={(e) => update(c.id, { naturaleza: e.target.value })}
                  >
                    <option value="obligatorio">Obligatorio</option>
                    <option value="opcional">Opcional</option>
                  </select>
                </td>
                <td className="px-3 py-3 align-top text-right">
                  <button
                    type="button"
                    className={[
                      'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-red-600 shadow-sm transition',
                      'hover:bg-red-50 hover:text-red-700',
                      'opacity-0 group-hover:opacity-100 focus:opacity-100',
                      'focus:outline-none focus:ring-4 focus:ring-red-500/10',
                    ].join(' ')}
                    onClick={() => {
                      if (!confirm('¿Eliminar este cobro?')) return
                      setCharges(charges.filter((x) => x.id !== c.id))
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {charges.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No hay cobros indirectos configurados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sugerencia</p>
        <p className="mt-2 text-sm leading-relaxed">
          Usa <span className="font-medium text-slate-700">Fijo</span> para valores en dólares y{' '}
          <span className="font-medium text-slate-700">Porcentual</span> para recargos calculados sobre el monto del crédito.
        </p>
      </div>
    </motion.div>
  )
}
