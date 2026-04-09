import { z } from 'zod'

export const institutionalProfileSchema = z.object({
  nombre: z.string().min(1),
  ruc: z.string().min(1),
  direccion: z.string().min(1),
  telefonos: z.string().min(1),
  email: z.string().min(1),
  lema: z.string().min(1),
  pieDocumentos: z.string().min(1),
  colorPrimario: z.string().min(1),
  colorSecundario: z.string().min(1),
  logoDataUrl: z.string().nullable().optional(),
})

