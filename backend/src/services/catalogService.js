import { prisma } from '../db/prisma.js'
import { fromJsonString, toJsonString } from '../lib/jsonFields.js'
import { defaultCatalog } from './seedDefaults.js'

function mapCreditRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    tasaAnual: row.tasaAnual,
    tasaMoratoria: row.tasaMoratoria,
    montoMin: row.montoMin,
    montoMax: row.montoMax,
    plazoMinMeses: row.plazoMinMeses,
    plazoMaxMeses: row.plazoMaxMeses,
    periodicidades: fromJsonString(row.periodicidades, []),
    porcentajeEntrada: row.porcentajeEntrada,
    cobrosIds: fromJsonString(row.cobrosIds, []),
    activo: row.activo,
  }
}

function mapInvRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    tasaAnual: row.tasaAnual,
    montoMin: row.montoMin,
    plazoMeses: fromJsonString(row.plazoMeses, []),
    capitalizacion: row.capitalizacion,
    penalizacionRetiro: row.penalizacionRetiro,
    impuesto: row.impuesto,
    renovacionAuto: row.renovacionAuto,
  }
}

export async function ensureCatalogSeeded() {
  const [c, ch, i] = await Promise.all([
    prisma.creditProduct.count(),
    prisma.charge.count(),
    prisma.investmentProduct.count(),
  ])

  if (c === 0) {
    await prisma.creditProduct.createMany({
      data: defaultCatalog.creditProducts.map((p) => ({
        ...p,
        periodicidades: toJsonString(p.periodicidades),
        cobrosIds: toJsonString(p.cobrosIds),
      })),
    })
  }
  if (ch === 0) {
    await prisma.charge.createMany({ data: defaultCatalog.charges })
  }
  if (i === 0) {
    await prisma.investmentProduct.createMany({
      data: defaultCatalog.investmentProducts.map((p) => ({
        ...p,
        plazoMeses: toJsonString(p.plazoMeses),
      })),
    })
  }
}

export async function getCatalog() {
  await ensureCatalogSeeded()
  const [credit, charges, inv] = await Promise.all([
    prisma.creditProduct.findMany({ orderBy: { id: 'asc' } }),
    prisma.charge.findMany({ orderBy: { id: 'asc' } }),
    prisma.investmentProduct.findMany({ orderBy: { id: 'asc' } }),
  ])

  return {
    creditProducts: credit.map(mapCreditRow),
    charges,
    investmentProducts: inv.map(mapInvRow),
  }
}

export async function replaceCatalog(nextCatalog) {
  await prisma.$transaction(async (tx) => {
    await tx.creditProduct.deleteMany()
    await tx.charge.deleteMany()
    await tx.investmentProduct.deleteMany()

    if (nextCatalog.creditProducts.length) {
      await tx.creditProduct.createMany({
        data: nextCatalog.creditProducts.map((p) => ({
          ...p,
          periodicidades: toJsonString(p.periodicidades),
          cobrosIds: toJsonString(p.cobrosIds),
        })),
      })
    }
    if (nextCatalog.charges.length) {
      await tx.charge.createMany({ data: nextCatalog.charges })
    }
    if (nextCatalog.investmentProducts.length) {
      await tx.investmentProduct.createMany({
        data: nextCatalog.investmentProducts.map((p) => ({
          ...p,
          plazoMeses: toJsonString(p.plazoMeses),
        })),
      })
    }
  })

  return await getCatalog()
}

