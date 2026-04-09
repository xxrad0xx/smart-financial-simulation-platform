import { z } from 'zod'

export const historyEntrySchema = z.object({
  id: z.string().min(1),
  fecha: z.union([z.string().datetime(), z.string().min(1)]),
  usuario: z.string().min(1),
  tipoCredito: z.string().min(1),
  monto: z.number(),
  metodo: z.enum(['frances', 'aleman']).or(z.string().min(1)),
  totalPagar: z.number(),
  estado: z.string().min(1),
  payload: z.any().optional(),
})

export const historyStatusPatchSchema = z.object({
  estado: z.string().min(1),
})

