import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCatalog } from '../../context/CatalogContext.jsx'
import { useHistory } from '../../context/HistoryContext.jsx'
import { formatCurrency } from '../../lib/currency.js'

const cards = [
  {
    to: '/admin/config',
    title: 'Configuración institucional',
    desc: 'Logo, datos legales, colores y pie de documentos PDF.',
  },
  {
    to: '/admin/creditos',
    title: 'Tipos de crédito',
    desc: 'CRUD de productos, tasas, plazos y periodicidades.',
  },
  {
    to: '/admin/cobros',
    title: 'Cobros indirectos',
    desc: 'Seguros, comisiones, cargos fijos o porcentuales.',
  },
  {
    to: '/admin/inversiones',
    title: 'Productos de inversión',
    desc: 'Ahorro programado, plazo fijo, certificados, etc.',
  },
]

export default function AdminHome() {
  const { creditProducts, investmentProducts, charges } = useCatalog()
  const { items } = useHistory()

  const activeCredits = creditProducts.filter((p) => p.activo)
  const activeInvests = investmentProducts

  const history7d = (() => {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (6 - i))
      const key = d.toISOString().slice(0, 10)
      return { key, label: d.toLocaleDateString('es-EC', { weekday: 'short' }), count: 0 }
    })
    const idx = new Map(days.map((d, i) => [d.key, i]))
    for (const it of items) {
      const k = String(it.fecha).slice(0, 10)
      const i = idx.get(k)
      if (i != null) days[i].count += 1
    }
    return days.map((d) => ({ day: d.label, simulaciones: d.count }))
  })()

  const last = items[0]

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-slate-100">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white md:text-3xl">
          Dashboard administrativo
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Estado de configuración, catálogos y actividad reciente del simulador.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Créditos activos', value: activeCredits.length },
          { label: 'Productos inversión', value: activeInvests.length },
          { label: 'Cobros indirectos', value: charges.length },
          { label: 'Simulaciones (historial)', value: items.length },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_-55px_rgba(0,0,0,0.9)]"
          >
            <p className="text-xs font-medium text-slate-400">{k.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{k.value}</p>
            <div className="mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: 'var(--sfici-primary)' }} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">Actividad (últimos 7 días)</h2>
              <p className="mt-1 text-xs text-slate-400">Cantidad de simulaciones guardadas en historial.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Última simulación</p>
              <p className="text-sm text-slate-200">
                {last ? new Date(last.fecha).toLocaleString('es-EC') : '—'}
              </p>
            </div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history7d} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sfici-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--sfici-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2,6,23,0.92)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 12,
                    color: '#fff',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
                <Area
                  type="monotone"
                  dataKey="simulaciones"
                  stroke="var(--sfici-primary)"
                  strokeWidth={2}
                  fill="url(#gAdmin)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold text-white">Resumen rápido</h2>
          <p className="mt-1 text-xs text-slate-400">Indicadores para operación diaria.</p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Producto crédito top</span>
              <span className="font-medium text-white">{activeCredits[0]?.nombre ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Tasa promedio créditos</span>
              <span className="font-medium text-white">
                {activeCredits.length
                  ? `${(
                      (activeCredits.reduce((a, p) => a + (Number(p.tasaAnual) || 0), 0) / activeCredits.length) *
                      100
                    ).toFixed(2)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Monto máx. crédito</span>
              <span className="font-medium text-white">
                {activeCredits.length ? formatCurrency(Math.max(...activeCredits.map((p) => Number(p.montoMax) || 0))) : '—'}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-white/15 hover:bg-black/30"
              >
                <p className="text-sm font-medium text-white">{c.title}</p>
                <p className="mt-1 text-xs text-slate-400">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
