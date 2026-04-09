import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiRouter } from './routes/api.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')

  app.use(morgan('dev'))
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: false,
    }),
  )
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (req, res) => {
    res.json({ ok: true })
  })

  app.use('/api', apiRouter)

  app.use(errorHandler)
  return app
}

