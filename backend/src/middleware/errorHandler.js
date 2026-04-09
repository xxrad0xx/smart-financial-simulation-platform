import { HttpError } from '../lib/httpErrors.js'

export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _next = next
  const status = err instanceof HttpError ? err.status : 500
  const body = {
    error: status >= 500 ? 'Internal Server Error' : err.message,
  }
  if (err instanceof HttpError && err.details) body.details = err.details
  if (process.env.NODE_ENV !== 'production') body.stack = err.stack
  res.status(status).json(body)
}

