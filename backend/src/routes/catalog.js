import { Router } from 'express'
import { validateBody } from '../middleware/validate.js'
import { catalogUpsertSchema } from '../schemas/catalogSchemas.js'
import { getCatalog, replaceCatalog } from '../services/catalogService.js'

export const catalogRouter = Router()

catalogRouter.get('/', async (req, res, next) => {
  try {
    res.json(await getCatalog())
  } catch (e) {
    next(e)
  }
})

catalogRouter.put('/', validateBody(catalogUpsertSchema), async (req, res, next) => {
  try {
    res.json(await replaceCatalog(req.body))
  } catch (e) {
    next(e)
  }
})

