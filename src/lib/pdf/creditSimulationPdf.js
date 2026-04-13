import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from '../currency.js'

const BRAND = {
  emerald: [22, 163, 74],
  emeraldDark: [11, 42, 29],
  slate900: [15, 23, 42],
  slate600: [71, 85, 105],
  slate400: [148, 163, 184],
  border: [226, 232, 240],
  surface: [248, 250, 252],
  headFill: [15, 118, 110],
}

function safeText(v, fallback = '—') {
  const s = v == null ? '' : String(v).trim()
  return s ? s : fallback
}

function formatDateTimeEC(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return date.toLocaleString('es-EC')
  }
}

/**
 * @param {object} opts
 * @param {{ nombre: string, ruc: string, logoDataUrl?: string, lema?: string, pieDocumentos?: string }} opts.institution
 * @param {object} opts.client { nombre, documento, email }
 * @param {object} opts.credit { tipo, monto, plazoMeses, periodicity, methodLabel }
 * @param {import('../amortization.js').AmortizationResult} opts.result
 * @param {string} opts.simulationId
 * @param {string} [opts.observations]
 */
export function downloadCreditSimulationPdf({
  institution,
  client,
  credit,
  result,
  simulationId,
  observations = '',
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 14
  const rightX = pageW - marginX

  const drawHeader = () => {
    // Top bar
    doc.setFillColor(...BRAND.surface)
    doc.rect(0, 0, pageW, 28, 'F')

    // Logo
    const logoX = marginX
    const logoY = 8
    const logoS = 14
    if (institution.logoDataUrl) {
      try {
        doc.addImage(institution.logoDataUrl, 'PNG', logoX, logoY, logoS, logoS)
      } catch {
        /* ignore invalid image */
      }
    }

    const titleX = institution.logoDataUrl ? logoX + logoS + 6 : marginX
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...BRAND.slate900)
    doc.text(safeText(institution.nombre, 'Institución'), titleX, 14)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BRAND.slate600)
    const lema = safeText(institution.lema, '')
    if (lema) doc.text(lema, titleX, 20)

    // Meta
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...BRAND.slate900)
    doc.text('Simulación de crédito', rightX, 14, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BRAND.slate600)
    doc.text(`N° simulación: ${safeText(simulationId)}`, rightX, 20, { align: 'right' })
    doc.text(`Fecha: ${formatDateTimeEC(new Date())}`, rightX, 25, { align: 'right' })

    // Divider line
    doc.setDrawColor(...BRAND.border)
    doc.setLineWidth(0.6)
    doc.line(marginX, 30, rightX, 30)
  }

  const drawFooter = () => {
    const pages = doc.getNumberOfPages()
    for (let p = 1; p <= pages; p += 1) {
      doc.setPage(p)
      const y = pageH - 12
      doc.setDrawColor(...BRAND.border)
      doc.setLineWidth(0.6)
      doc.line(marginX, y - 4, rightX, y - 4)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...BRAND.slate600)
      const left = safeText(institution.pieDocumentos, '')
      if (left) {
        const lines = doc.splitTextToSize(left, pageW * 0.62)
        doc.text(lines, marginX, y)
      }
      doc.text(`Página ${p} de ${pages}`, rightX, y, { align: 'right' })
    }
  }

  const drawCard = ({ x, y, w, h, title }) => {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...BRAND.border)
    doc.setLineWidth(0.6)
    doc.roundedRect(x, y, w, h, 3.5, 3.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...BRAND.slate900)
    doc.text(title, x + 4, y + 7)

    doc.setDrawColor(...BRAND.border)
    doc.setLineWidth(0.4)
    doc.line(x + 4, y + 9.5, x + w - 4, y + 9.5)
  }

  const drawKV = ({ x, y, label, value, maxW }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BRAND.slate600)
    doc.text(`${label}:`, x, y)
    doc.setTextColor(...BRAND.slate900)
    const lines = doc.splitTextToSize(safeText(value), maxW)
    doc.text(lines, x + 22, y)
    return y + Math.max(5, lines.length * 4.5)
  }

  drawHeader()
  let y = 36

  // Two-column cards: client + credit conditions
  const gap = 6
  const colW = (pageW - marginX * 2 - gap) / 2
  const cardH = 38

  drawCard({ x: marginX, y, w: colW, h: cardH, title: 'Datos del cliente' })
  let y1 = y + 16
  y1 = drawKV({ x: marginX + 4, y: y1, label: 'Nombre', value: client.nombre, maxW: colW - 34 })
  y1 = drawKV({ x: marginX + 4, y: y1, label: 'Documento', value: client.documento, maxW: colW - 34 })
  drawKV({ x: marginX + 4, y: y1, label: 'Correo', value: client.email, maxW: colW - 34 })

  drawCard({ x: marginX + colW + gap, y, w: colW, h: cardH, title: 'Condiciones del crédito' })
  let y2 = y + 16
  y2 = drawKV({ x: marginX + colW + gap + 4, y: y2, label: 'Producto', value: credit.tipo, maxW: colW - 34 })
  y2 = drawKV({
    x: marginX + colW + gap + 4,
    y: y2,
    label: 'Monto',
    value: formatCurrency(credit.monto),
    maxW: colW - 34,
  })
  y2 = drawKV({
    x: marginX + colW + gap + 4,
    y: y2,
    label: 'Plazo',
    value: `${safeText(credit.plazoMeses)} meses`,
    maxW: colW - 34,
  })
  y2 = drawKV({
    x: marginX + colW + gap + 4,
    y: y2,
    label: 'Pago',
    value: credit.periodicity,
    maxW: colW - 34,
  })
  drawKV({
    x: marginX + colW + gap + 4,
    y: y2,
    label: 'Sistema',
    value: credit.methodLabel,
    maxW: colW - 34,
  })

  y += cardH + 10

  // Financial summary card
  const summaryH = 26
  drawCard({ x: marginX, y, w: pageW - marginX * 2, h: summaryH, title: 'Resumen financiero' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND.slate600)

  const sx = marginX + 4
  const sy = y + 16
  doc.text('Total a pagar', sx, sy)
  doc.text('Total intereses', sx + 62, sy)
  doc.text('Cargos en cronograma', sx + 124, sy)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BRAND.slate900)
  doc.text(formatCurrency(result.totalPaid), sx, sy + 6)
  doc.text(formatCurrency(result.totalInterest), sx + 62, sy + 6)
  doc.text(formatCurrency(result.totalCharges), sx + 124, sy + 6)

  y += summaryH + 8

  const body = result.schedule.map((r) => [
    r.period,
    formatCurrency(r.payment),
    formatCurrency(r.interest),
    formatCurrency(r.principal),
    formatCurrency(r.balance),
  ])

  autoTable(doc, {
    startY: y,
    head: [['#', 'Cuota', 'Interés', 'Capital', 'Saldo']],
    body,
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: { top: 2.1, right: 2.2, bottom: 2.1, left: 2.2 },
      lineColor: BRAND.border,
      lineWidth: 0.2,
      textColor: BRAND.slate900,
    },
    headStyles: {
      fillColor: BRAND.headFill,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: marginX, right: marginX },
    didDrawPage: () => {
      drawHeader()
    },
  })

  const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : y + 80
  const legalY = Math.min(finalY, pageH - 26)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...BRAND.slate600)

  const legal = 'Esta simulación es referencial y no constituye una oferta vinculante.'
  const legalLines = doc.splitTextToSize(legal, pageW - marginX * 2)
  doc.text(legalLines, marginX, legalY)

  if (observations) {
    const obs = doc.splitTextToSize(String(observations), pageW - marginX * 2)
    doc.setTextColor(...BRAND.slate600)
    doc.text(obs, marginX, legalY + legalLines.length * 4.2 + 4)
  }

  drawFooter()

  doc.save(`SFICI-simulacion-${simulationId}.pdf`)
}
