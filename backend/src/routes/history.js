import { Router } from 'express'
import { validateBody } from '../middleware/validate.js'
import { historyEntrySchema, historyStatusPatchSchema } from '../schemas/historySchemas.js'
import { addHistoryEntry, listHistory, updateHistoryStatus } from '../services/historyService.js'

export const historyRouter = Router()

historyRouter.get('/', async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 200
    res.json(await listHistory({ limit }))
  } catch (e) {
    next(e)
  }
})

historyRouter.post('/', validateBody(historyEntrySchema), async (req, res, next) => {
  try {
    res.status(201).json(await addHistoryEntry(req.body))
  } catch (e) {
    next(e)
  }
})

historyRouter.patch('/:id/status', validateBody(historyStatusPatchSchema), async (req, res, next) => {
  try {
    res.json(await updateHistoryStatus(req.params.id, req.body.estado))
  } catch (e) {
    next(e)
  }
})

