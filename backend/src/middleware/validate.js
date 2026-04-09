import { ZodError } from 'zod'
import { HttpError } from '../lib/httpErrors.js'

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (e) {
      if (e instanceof ZodError) {
        next(new HttpError(400, 'Validation error', e.flatten()))
        return
      }
      next(e)
    }
  }
}

