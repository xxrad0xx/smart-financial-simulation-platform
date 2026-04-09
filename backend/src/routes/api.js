import { Router } from 'express'
import { catalogRouter } from './catalog.js'
import { institutionRouter } from './institution.js'
import { historyRouter } from './history.js'

export const apiRouter = Router()

apiRouter.use('/catalog', catalogRouter)
apiRouter.use('/institution', institutionRouter)
apiRouter.use('/history', historyRouter)

