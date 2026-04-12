import { useMemo } from 'react'
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useRequest } from '../../../context/RequestContext.jsx'
import { useCatalog } from '../../../context/CatalogContext.jsx'
import { buildSchedule, compareMethods } from '../../../lib/amortization.js'
import { formatCurrency } from '../../../lib/currency.js'
import { PERIODICITY_LABELS } from '../../../lib/periodicity.js'
import { resolveChargesForSimulation } from '../../../lib/resolveCharges.js'

const methodLabels = { frances: 'Francés (cuota fija)', aleman: 'Alemán (capital constante)' }

export default function StepSimulacion() {
  const ctx = useRequest()
  const { productoId, monto, plazoMeses, periodicidad, metodoAmortizacion, updateField, updateFields, setStep } = ctx
  const { creditProducts, charges } = useCatalog()

  const product = useMemo(() => creditProducts.find((p) => p.id === productoId), [creditProducts, productoId])

  const principalNeto = useMemo(() => {
    if (!product) return monto
    return monto * (1 - (product.porcentajeEntrada || 0))
  }, [monto, product])

  const chargeParams = useMemo(() => {
    if (!product) return { charges: [], upfrontFee: 0 }
    return resolveChargesForSimulation(charges, product.cobrosIds || [], principalNeto)
  }, [charges, product, principalNeto])

  const result = useMemo(() => {
    if (!product || !monto || !plazoMeses) return null
    return buildSchedule({
      principal: principalNeto,
      annualRate: product.tasaAnual,
      plazoMeses,
      periodicity: periodicidad,
      method: metodoAmortizacion,
      charges: chargeParams.charges,
      upfrontFee: chargeParams.upfrontFee,
    })
  }, [product, principalNeto, monto, plazoMeses, periodicidad, metodoAmortizacion, chargeParams])

  const comparison = useMemo(() => {
    if (!product || !monto || !plazoMeses) return null
    return compareMethods({
      principal: principalNeto,
      annualRate: product.tasaAnual,
      plazoMeses,
      periodicity: periodicidad,
      method: 'frances',
      charges: chargeParams.charges,
      upfrontFee: chargeParams.upfrontFee,
    })
  }, [product, principalNeto, monto, plazoMeses, periodicidad, chargeParams])

  const chartData = useMemo(() => {
    if (!result) return []
    return result.schedule.map((r) => ({ periodo: r.period, saldo: r.balance, interes: r.interest, capital: r.principal }))
  }, [result])

  const handleNext = () => {
    if (!result) return
    updateFields({ totalPagar: result.totalPaid, cuotaMensual: result.firstPayment })
    setStep(5)
  }

  if (!product) return <p className="text-slate-600">Producto no encontrado. Vuelva al paso anterior.</p>

  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Simulación de crédito</h2>
        <p className="mt-1 text-sm text-slate-600">Configure los parámetros y revise su tabla de amortización.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Parámetros</h3>
          <label className="block text-sm">
            <span className="text-slate-600">Monto solicitado</span>
            <input className={inputClass} type="number" value={monto || ''} min={product.montoMin} max={product.montoMax} onChange={(e) => updateField('monto', Number(e.target.value))} />
            <span className="text-xs text-slate-400">{formatCurrency(product.montoMin)} — {formatCurrency(product.montoMax)}</span>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Plazo (meses)</span>
            <input className={inputClass} type="number" value={plazoMeses || ''} min={product.plazoMinMeses} max={product.plazoMaxMeses} onChange={(e) => updateField('plazoMeses', Number(e.target.value))} />
            <span className="text-xs text-slate-400">{product.plazoMinMeses} — {product.plazoMaxMeses} meses</span>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Periodicidad</span>
            <select className={inputClass} value={periodicidad} onChange={(e) => updateField('periodicidad', e.target.value)}>
              {product.periodicidades.map((p) => <option key={p} value={p}>{PERIODICITY_LABELS[p] ?? p}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Método de amortización</span>
            <select className={inputClass} value={metodoAmortizacion} onChange={(e) => updateField('metodoAmortizacion', e.target.value)}>
              <option value="frances">{methodLabels.frances}</option>
              <option value="aleman">{methodLabels.aleman}</option>
            </select>
          </label>
        </div>

        {result && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resumen</h3>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Monto neto</dt><dd className="font-medium">{formatCurrency(principalNeto)}</dd></div>
              <div><dt className="text-slate-500">Cuota</dt><dd className="font-medium">{formatCurrency(result.firstPayment)}</dd></div>
              <div><dt className="text-slate-500">Total intereses</dt><dd className="font-medium">{formatCurrency(result.totalInterest)}</dd></div>
              <div><dt className="text-slate-500">Total a pagar</dt><dd className="font-medium">{formatCurrency(result.totalPaid)}</dd></div>
              <div><dt className="text-slate-500">N° pagos</dt><dd className="font-medium">{result.periods}</dd></div>
            </dl>
          </div>
        )}
      </div>

      {comparison && (
        <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-5">
          <h3 className="text-sm font-semibold text-sky-900">Comparación francés vs alemán</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-sky-900/90">
            <li>Menor interés total: <strong>{comparison.lowerInterest === 'empate' ? 'Empate' : comparison.lowerInterest === 'aleman' ? 'Alemán' : 'Francés'}</strong></li>
            <li>Menor cuota inicial: <strong>{comparison.lowerFirstPayment === 'empate' ? 'Empate' : comparison.lowerFirstPayment === 'frances' ? 'Francés' : 'Alemán'}</strong></li>
          </ul>
          <p className="mt-3 text-sm text-sky-950">{comparison.recommendation}</p>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-slate-800">Saldo decreciente</h3>
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="saldo" stroke="var(--sfici-primary)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-slate-800">Capital vs interés</h3>
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="capital" stackId="a" fill="#0ea5e9" name="Capital" />
                  <Bar dataKey="interes" stackId="a" fill="#64748b" name="Interés" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-xs">
            <thead className="sticky top-0 border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Cuota</th>
                <th className="px-3 py-2">Interés</th>
                <th className="px-3 py-2">Capital</th>
                <th className="px-3 py-2">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((r) => (
                <tr key={r.period} className="border-b border-slate-50">
                  <td className="px-3 py-1.5">{r.period}</td>
                  <td className="px-3 py-1.5">{formatCurrency(r.payment)}</td>
                  <td className="px-3 py-1.5">{formatCurrency(r.interest)}</td>
                  <td className="px-3 py-1.5">{formatCurrency(r.principal)}</td>
                  <td className="px-3 py-1.5">{formatCurrency(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" className="rounded-lg border border-slate-200 px-5 py-2 text-sm" onClick={() => setStep(3)}>Anterior</button>
        <button type="button" disabled={!result} className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--sfici-primary)' }} onClick={handleNext}>Siguiente</button>
      </div>
    </div>
  )
}
