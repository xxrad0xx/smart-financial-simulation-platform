import { prisma } from '../db/prisma.js'
import { toJsonString } from '../lib/jsonFields.js'

export async function listHistory({ limit = 200 } = {}) {
  const rows = await prisma.simulationHistory.findMany({
    orderBy: { fecha: 'desc' },
    take: Math.min(Math.max(limit, 1), 500),
  })
  return rows.map((r) => ({
    id: r.id,
    fecha: r.fecha.toISOString(),
    usuario: r.usuario,
    tipoCredito: r.tipoCredito,
    monto: r.monto,
    metodo: r.metodo,
    totalPagar: r.totalPagar,
    estado: r.estado,
    payload: r.payload ? JSON.parse(r.payload) : undefined,
  }))
}

export async function addHistoryEntry(entry) {
  const row = await prisma.simulationHistory.create({
    data: {
      id: entry.id,
      fecha: new Date(entry.fecha),
      usuario: entry.usuario,
      tipoCredito: entry.tipoCredito,
      monto: entry.monto,
      metodo: entry.metodo,
      totalPagar: entry.totalPagar,
      estado: entry.estado,
      payload: entry.payload === undefined ? null : toJsonString(entry.payload),
    },
  })
  return {
    id: row.id,
    fecha: row.fecha.toISOString(),
    usuario: row.usuario,
    tipoCredito: row.tipoCredito,
    monto: row.monto,
    metodo: row.metodo,
    totalPagar: row.totalPagar,
    estado: row.estado,
    payload: row.payload ? JSON.parse(row.payload) : undefined,
  }
}

export async function updateHistoryStatus(id, estado) {
  const row = await prisma.simulationHistory.update({
    where: { id },
    data: { estado },
  })
  return {
    id: row.id,
    fecha: row.fecha.toISOString(),
    usuario: row.usuario,
    tipoCredito: row.tipoCredito,
    monto: row.monto,
    metodo: row.metodo,
    totalPagar: row.totalPagar,
    estado: row.estado,
  }
}

