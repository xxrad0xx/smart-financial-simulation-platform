import { Router } from 'express'
import { validateBody } from '../middleware/validate.js'
import { institutionalProfileSchema } from '../schemas/institutionSchemas.js'
import { getInstitutionProfile, updateInstitutionProfile } from '../services/institutionService.js'

export const institutionRouter = Router()

institutionRouter.get('/profile', async (req, res, next) => {
  try {
    res.json(await getInstitutionProfile())
  } catch (e) {
    next(e)
  }
})

institutionRouter.put('/profile', validateBody(institutionalProfileSchema), async (req, res, next) => {
  try {
    res.json(await updateInstitutionProfile(req.body))
  } catch (e) {
    next(e)
  }
})

