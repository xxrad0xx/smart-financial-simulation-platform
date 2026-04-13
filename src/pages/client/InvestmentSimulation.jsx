import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCatalog } from '../../context/CatalogContext.jsx'
import { compoundWithContributions, compareSimpleVsCompound } from '../../lib/investment.js'
import { formatCurrency } from '../../lib/currency.js'

const capMap = { mensual: 12, trimestral: 4, semestral: 2, anual: 1 }

export default function InvestmentSimulation() {
  const { investmentProducts } = useCatalog()
  const [productId, setProductId] = useState(investmentProducts[0]?.id ?? '')
  const product = investmentProducts.find((p) => p.id === productId) ?? investmentProducts[0]
  const [capital, setCapital] = useState(5000)
  const [plazoMeses, setPlazoMeses] = useState(24)
  const [aporte, setAporte] = useState(100)

  const years = plazoMeses / 12
  const paymentsPerYear = capMap[product?.capitalizacion] ?? 12

  const comparison = useMemo(() => {
    if (!product) return null
    return compareSimpleVsCompound(capital, product.tasaAnual, years, paymentsPerYear)
  }, [capital, product, years, paymentsPerYear])

  const compoundAportes = useMemo(() => {
    if (!product) return null
    return compoundWithContributions({
      initialCapital: capital,
      annualRate: product.tasaAnual,
      years,
      paymentsPerYear,
      periodicContribution: aporte,
    })
  }, [capital, product, years, paymentsPerYear, aporte])

  const chartData = useMemo(() => {
    if (!compoundAportes) return []
    return compoundAportes.table.map((row) => ({
      p: row.period,
      acum: row.accumulated,
    }))
  }, [compoundAportes])

  if (!product) return <p className="text-slate-600">No hay productos de inversión configurados.</p>

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Simulación de inversión</h1>
        <p className="mt-1 text-sm text-slate-600">Interés simple vs compuesto y aportes periódicos.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <label className="block text-sm">
            <span className="text-slate-600">Producto</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {investmentProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Capital inicial</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={capital}
              min={product.montoMin}
              onChange={(e) => setCapital(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Plazo (meses)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={plazoMeses}
              min={1}
              onChange={(e) => setPlazoMeses(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Aporte periódico (compuesto)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={aporte}
              min={0}
              onChange={(e) => setAporte(Number(e.target.value))}
            />
          </label>
        </div>

        {comparison && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <h2 className="text-sm font-semibold text-slate-800">Comparación (sin aportes adicionales en simple)</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Interés simple — capital final</dt>
                <dd className="font-medium">{formatCurrency(comparison.simple.finalCapital)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Interés compuesto — capital final</dt>
                <dd className="font-medium">{formatCurrency(comparison.compound.finalCapital)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Diferencia</dt>
                <dd className="font-medium text-emerald-700">
                  {formatCurrency(comparison.compound.finalCapital - comparison.simple.finalCapital)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {compoundAportes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="text-sm font-semibold text-slate-800">Proyección con aportes (compuesto)</h2>
          <p className="mt-2 text-sm text-slate-600">
            Capital final: <strong>{formatCurrency(compoundAportes.finalCapital)}</strong> — Intereses generados:{' '}
            <strong>{formatCurrency(compoundAportes.interestGenerated)}</strong>
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="p" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="acum" stroke="var(--sfici-primary)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  )
}
