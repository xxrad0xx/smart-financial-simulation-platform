import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCatalog } from '../../context/CatalogContext.jsx'
import { useHistory } from '../../context/HistoryContext.jsx'
import { useInstitution } from '../../context/InstitutionalContext.jsx'
import { buildSchedule, compareMethods } from '../../lib/amortization.js'
import { formatCurrency } from '../../lib/currency.js'
import { PERIODICITY_LABELS } from '../../lib/periodicity.js'
import { downloadCreditSimulationPdf } from '../../lib/pdf/creditSimulationPdf.js'
import { resolveChargesForSimulation } from '../../lib/resolveCharges.js'

const methodLabels = { frances: 'Francés (cuota fija)', aleman: 'Alemán (capital constante)' }

export default function CreditSimulation() {
  const { profile } = useInstitution()
  const { creditProducts, charges } = useCatalog()
  const { add } = useHistory()

  const activeProducts = useMemo(() => creditProducts.filter((p) => p.activo), [creditProducts])
  const [productId, setProductId] = useState(activeProducts[0]?.id ?? '')
  const product = useMemo(
    () => activeProducts.find((p) => p.id === productId) ?? activeProducts[0],
    [activeProducts, productId],
  )

  const [monto, setMonto] = useState(10000)
  const [plazoMeses, setPlazoMeses] = useState(24)
  const [periodicity, setPeriodicity] = useState(product?.periodicidades?.[0] ?? 'mensual')
  const [method, setMethod] = useState('frances')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10))
  const [cliente, setCliente] = useState({ nombre: 'Cliente Demo', documento: '1234567890', email: 'cliente@demo.com' })
  const [optionalIds, setOptionalIds] = useState([])

  const simulationId = useMemo(() => crypto.randomUUID(), [])
  const verifyUrl = useMemo(() => `${window.location.origin}/verificar/${simulationId}`, [simulationId])

  const periodicityForCalc = useMemo(() => {
    if (!product) return periodicity
    return product.periodicidades.includes(periodicity) ? periodicity : product.periodicidades[0]
  }, [product, periodicity])

  const principalNeto = useMemo(() => {
    const p = creditProducts.find((x) => x.id === productId && x.activo)
    if (!p) return monto
    return monto * (1 - (p.porcentajeEntrada || 0))
  }, [monto, productId, creditProducts])

  const selectedChargeIds = useMemo(() => {
    const p = creditProducts.find((x) => x.id === productId && x.activo)
    if (!p) return []
    const base = new Set(p.cobrosIds || [])
    charges
      .filter((c) => c.naturaleza === 'opcional' && optionalIds.includes(c.id))
      .forEach((c) => base.add(c.id))
    return [...base]
  }, [creditProducts, productId, charges, optionalIds])

  const chargeParams = useMemo(
    () => resolveChargesForSimulation(charges, selectedChargeIds, principalNeto),
    [charges, selectedChargeIds, principalNeto],
  )

  const baseInput = useMemo(() => {
    const p = creditProducts.find((x) => x.id === productId && x.activo)
    if (!p) return null
    return {
      principal: principalNeto,
      annualRate: p.tasaAnual,
      plazoMeses,
      periodicity: periodicityForCalc,
      method,
      charges: chargeParams.charges,
      upfrontFee: chargeParams.upfrontFee,
    }
  }, [creditProducts, productId, principalNeto, plazoMeses, periodicityForCalc, method, chargeParams])

  const result = useMemo(() => {
    if (!baseInput) return null
    return buildSchedule(baseInput)
  }, [baseInput])

  const comparison = useMemo(() => {
    if (!baseInput) return null
    return compareMethods({ ...baseInput, method: 'frances' })
  }, [baseInput])

  const chartBalance = useMemo(() => {
    if (!result) return []
    return result.schedule.map((r) => ({
      periodo: r.period,
      saldo: r.balance,
      interes: r.interest,
      capital: r.principal,
    }))
  }, [result])

  const handlePdf = () => {
    if (!result || !product) return
    downloadCreditSimulationPdf({
      institution: profile,
      client: cliente,
      credit: {
        tipo: product.nombre,
        monto: principalNeto,
        plazoMeses,
        periodicity: PERIODICITY_LABELS[periodicityForCalc] ?? periodicityForCalc,
        methodLabel: methodLabels[method],
      },
      result,
      simulationId,
      observations: `Simulación al ${fechaInicio}. Tasas y cargos según catálogo institucional.`,
    })
  }

  const handleSaveHistory = () => {
    if (!result || !product) return
    add({
      id: simulationId,
      fecha: new Date().toISOString(),
      usuario: cliente.email,
      tipoCredito: product.nombre,
      monto: principalNeto,
      metodo: method,
      totalPagar: result.totalPaid,
      pdf: true,
      estado: 'Simulado',
    })
    alert('Simulación registrada en historial.')
  }

  if (!product) {
    return <p className="text-slate-600">No hay productos de crédito activos. Configure el catálogo en administración.</p>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Simulación de crédito</h1>
        <p className="mt-1 text-sm text-slate-600">Método francés o alemán, cargos indirectos y análisis comparativo.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Parámetros</h2>
          <label className="block text-sm">
            <span className="text-slate-600">Tipo de crédito</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value)
                const np = activeProducts.find((p) => p.id === e.target.value)
                if (np?.periodicidades?.length) setPeriodicity(np.periodicidades[0])
              }}
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Monto solicitado</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={monto}
              min={product.montoMin}
              max={product.montoMax}
              onChange={(e) => setMonto(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Plazo (meses)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={plazoMeses}
              min={product.plazoMinMeses}
              max={product.plazoMaxMeses}
              onChange={(e) => setPlazoMeses(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Periodicidad de pago</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={periodicityForCalc}
              onChange={(e) => setPeriodicity(e.target.value)}
            >
              {product.periodicidades.map((per) => (
                <option key={per} value={per}>
                  {PERIODICITY_LABELS[per] ?? per}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Método de amortización</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="frances">{methodLabels.frances}</option>
              <option value="aleman">{methodLabels.aleman}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Fecha de inicio</span>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </label>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500">Datos para PDF</p>
            {['nombre', 'documento', 'email'].map((f) => (
              <label key={f} className="mt-2 block text-sm capitalize">
                <span className="text-slate-600">{f}</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                  value={cliente[f]}
                  onChange={(e) => setCliente({ ...cliente, [f]: e.target.value })}
                />
              </label>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-medium text-slate-500">Cobros opcionales del catálogo</p>
            <div className="mt-2 flex flex-col gap-2">
              {charges
                .filter((c) => c.naturaleza === 'opcional')
                .map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={optionalIds.includes(c.id)}
                      onChange={(e) => {
                        setOptionalIds((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id),
                        )
                      }}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-slate-700">{c.nombre}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resumen</h2>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Monto neto (tras entrada)</dt>
                  <dd className="font-medium">{formatCurrency(principalNeto)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Cuota inicial</dt>
                  <dd className="font-medium">{formatCurrency(result.firstPayment)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total intereses</dt>
                  <dd className="font-medium">{formatCurrency(result.totalInterest)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total a pagar (cronograma)</dt>
                  <dd className="font-medium">{formatCurrency(result.totalPaid)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Cargos en cronograma</dt>
                  <dd className="font-medium">{formatCurrency(result.totalCharges)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">N° pagos</dt>
                  <dd className="font-medium">{result.periods}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                  style={{ backgroundColor: 'var(--sfici-primary)' }}
                  onClick={handlePdf}
                >
                  Descargar PDF
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  onClick={handleSaveHistory}
                >
                  Guardar en historial
                </button>
              </div>
              <div className="mt-4 flex items-start gap-4 border-t border-slate-100 pt-4">
                <QRCodeSVG value={verifyUrl} size={96} level="M" />
                <div className="text-xs text-slate-500">
                  <p className="font-mono text-slate-700">{simulationId}</p>
                  <p>
                    Escanea el QR para verificar esta simulación.
                    <br />
                    Guarda en historial para que sea consultable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {comparison && (
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-5 shadow-sm ring-1 ring-slate-900/5">
              <h2 className="text-sm font-semibold text-sky-900">Comparación francés vs alemán</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-sky-900/90">
                <li>
                  Menor interés total:{' '}
                  <strong>
                    {comparison.lowerInterest === 'empate'
                      ? 'Empate'
                      : comparison.lowerInterest === 'aleman'
                        ? 'Alemán'
                        : 'Francés'}
                  </strong>
                </li>
                <li>
                  Menor cuota inicial:{' '}
                  <strong>
                    {comparison.lowerFirstPayment === 'empate'
                      ? 'Empate'
                      : comparison.lowerFirstPayment === 'frances'
                        ? 'Francés'
                        : 'Alemán'}
                  </strong>
                </li>
                <li>
                  Mayor estabilidad de cuota: <strong>Francés</strong>
                </li>
              </ul>
              <p className="mt-3 text-sm text-sky-950">{comparison.recommendation}</p>
              <div className="mt-3 space-y-2 border-t border-sky-200/80 pt-3">
                {comparison.alerts.map((a, idx) => (
                  <p key={idx} className="text-xs text-sky-900/85">
                    • {a}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {chartBalance.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
            <h3 className="text-sm font-medium text-slate-800">Saldo decreciente</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartBalance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="saldo" stroke="var(--sfici-primary)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
            <h3 className="text-sm font-medium text-slate-800">Capital vs interés (por período)</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartBalance}>
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
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
          <table className="min-w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50/90 to-slate-50 text-slate-500 backdrop-blur">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Cuota</th>
                <th className="px-4 py-3">Interés</th>
                <th className="px-4 py-3">Capital</th>
                <th className="px-4 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.schedule.map((r) => (
                <tr key={r.period} className="odd:bg-white even:bg-slate-50/40 hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-2 tabular-nums text-slate-700">{r.period}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-800">{formatCurrency(r.payment)}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-600">{formatCurrency(r.interest)}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-600">{formatCurrency(r.principal)}</td>
                  <td className="px-4 py-2 tabular-nums font-medium text-slate-800">{formatCurrency(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
