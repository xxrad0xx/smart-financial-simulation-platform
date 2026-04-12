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
  {
    to: '/admin/solicitudes',
    title: 'Solicitudes de crédito',
    desc: 'Revisión y gestión de solicitudes de crédito enviadas por clientes.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

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

  const kpi = [
    { label: 'Créditos activos', value: activeCredits.length },
    { label: 'Productos inversión', value: activeInvests.length },
    { label: 'Cobros indirectos', value: charges.length },
    { label: 'Simulaciones (historial)', value: items.length },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/90">Panel</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Dashboard administrativo
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Estado de configuración, catálogos y actividad reciente del simulador. Misma línea visual que el acceso y el
          inicio de sesión: fondo claro, contraste alto y acentos institucionales.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {kpi.map((k) => (
          <motion.div
            key={k.label}
            variants={item}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">{k.value}</p>
            <div
              className="mt-4 h-1 w-14 rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--sfici-primary, #16a34a), rgba(202, 138, 4, 0.95))',
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 lg:col-span-2"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Actividad (últimos 7 días)</h2>
              <p className="mt-1 text-xs text-slate-600">Cantidad de simulaciones guardadas en historial.</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">Última simulación</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">
                {last ? new Date(last.fecha).toLocaleString('es-EC') : '—'}
              </p>
            </div>
          </div>

          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history7d} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAdminLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sfici-primary, #16a34a)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--sfici-primary, #16a34a)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
                    color: '#0f172a',
                  }}
                  labelStyle={{ color: '#475569', fontWeight: 600 }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Area
                  type="monotone"
                  dataKey="simulaciones"
                  stroke="var(--sfici-primary, #16a34a)"
                  strokeWidth={2}
                  fill="url(#gAdminLight)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
        >
          <h2 className="text-lg font-semibold text-slate-900">Resumen rápido</h2>
          <p className="mt-1 text-xs text-slate-600">Indicadores para operación diaria.</p>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-slate-600">Producto crédito top</span>
              <span className="max-w-[55%] text-right font-semibold text-slate-900">
                {activeCredits[0]?.nombre ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-slate-600">Tasa promedio créditos</span>
              <span className="font-semibold text-slate-900">
                {activeCredits.length
                  ? `${(
                      (activeCredits.reduce((a, p) => a + (Number(p.tasaAnual) || 0), 0) / activeCredits.length) *
                      100
                    ).toFixed(2)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Monto máx. crédito</span>
              <span className="font-semibold text-slate-900">
                {activeCredits.length
                  ? formatCurrency(Math.max(...activeCredits.map((p) => Number(p.montoMax) || 0)))
                  : '—'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-1 flex-col gap-2 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Accesos directos</p>
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-emerald-300/80 hover:bg-white hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800">{c.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{c.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
