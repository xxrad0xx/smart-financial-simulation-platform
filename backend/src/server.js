import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './db/prisma.js'
import { ensureCatalogSeeded } from './services/catalogService.js'
import { getInstitutionProfile } from './services/institutionService.js'

const app = createApp()

async function bootstrap() {
  // warm up DB and ensure defaults exist
  await ensureCatalogSeeded()
  await getInstitutionProfile()
}

await bootstrap()

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${env.PORT}`)
})

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[api] ${signal} received, shutting down...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

