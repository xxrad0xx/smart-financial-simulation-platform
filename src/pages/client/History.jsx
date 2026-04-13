import { motion } from 'framer-motion'
import { useHistory } from '../../context/HistoryContext.jsx'
import { formatCurrency } from '../../lib/currency.js'

const estadoBadge = {
  Simulado: 'bg-slate-100 text-slate-700',
  Preaprobado: 'bg-emerald-100 text-emerald-800',
  Rechazado: 'bg-red-100 text-red-800',
  'Enviado a revisión': 'bg-amber-100 text-amber-800',
}

export default function History() {
  const { items } = useHistory()

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Historial de simulaciones</h1>
        <p className="mt-1 text-sm text-slate-600">Registro local con trazabilidad básica.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50/90 to-slate-50 text-xs uppercase tracking-wide text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No hay simulaciones guardadas. Ejecuta una simulación y usa “Guardar en historial”.
                </td>
              </tr>
            )}
            {items.map((row) => (
              <tr
                key={row.id}
                className={[
                  'group transition-colors',
                  'odd:bg-white even:bg-slate-50/40',
                  'hover:bg-emerald-50/30',
                ].join(' ')}
              >
                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                  {new Date(row.fecha).toLocaleString('es-EC')}
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">{row.usuario}</td>
                <td className="px-4 py-3">{row.tipoCredito}</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-slate-800">{formatCurrency(row.monto)}</td>
                <td className="px-4 py-3">{row.metodo === 'frances' ? 'Francés' : 'Alemán'}</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-slate-800">{formatCurrency(row.totalPagar)}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                      estadoBadge[row.estado] || 'bg-slate-100 text-slate-700',
                    ].join(' ')}
                  >
                    {row.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
