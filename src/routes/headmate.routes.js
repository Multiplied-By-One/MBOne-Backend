import { Router } from 'express'
import Joi from 'joi'
import expressJoiValidation from 'express-joi-validation'
import { headmateController } from '../di-container'
import { Gender } from '../libs/constants'

let router = Router()
const validator = expressJoiValidation.createValidator({
  passError: true,
  convert: false
})

const createProfileBodySchema = Joi.object({
  name: Joi.string().alphanum().min(1).max(80).required(),
  gender: Joi.string().valid(Gender.Male, Gender.Female, Gender.Unspecified),
  age: Joi.number().integer().min(1).max(150),
  filename: Joi.string().pattern(/^[\w,\s-]+\.[A-Za-z]{3,4}$/).min(1).max(255),
  filetype: Joi.string().valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
})

router.post('/headmate', validator.body(createProfileBodySchema), headmateController.createProfile)
// router.post('/headmate', headmateController.createProfile)

export default router
