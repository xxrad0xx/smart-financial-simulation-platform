import { z } from 'zod'

export const chargeSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  tipo: z.string().min(1),
  valor: z.number(),
  frecuencia: z.string().min(1),
  naturaleza: z.string().min(1),
})

export const creditProductSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  tasaAnual: z.number(),
  tasaMoratoria: z.number(),
  montoMin: z.number(),
  montoMax: z.number(),
  plazoMinMeses: z.number().int(),
  plazoMaxMeses: z.number().int(),
  periodicidades: z.array(z.string()),
  porcentajeEntrada: z.number(),
  cobrosIds: z.array(z.string()),
  activo: z.boolean(),
})

export const investmentProductSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  tasaAnual: z.number(),
  montoMin: z.number(),
  plazoMeses: z.array(z.number().int()),
  capitalizacion: z.string().min(1),
  penalizacionRetiro: z.number(),
  impuesto: z.number(),
  renovacionAuto: z.boolean(),
})

export const catalogUpsertSchema = z.object({
  creditProducts: z.array(creditProductSchema),
  charges: z.array(chargeSchema),
  investmentProducts: z.array(investmentProductSchema),
})

