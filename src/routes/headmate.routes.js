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
const profileParamSchema = Joi.object({
  headmateId: Joi.number().integer().min(0).required()
})
const profileBodySchema = Joi.object({
  name: Joi.string().alphanum().min(1).max(80).trim(),
  gender: Joi.string().length(1).valid(Gender.Male, Gender.Female, Gender.Unspecified),
  age: Joi.number().integer().min(1).max(150),
  filename: Joi.string().pattern(/^[\w,\s-]+\.[A-Za-z]{3,4}$/).min(1).max(255).trim(),
  filetype: Joi.string().valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').trim(),
  info: Joi.string().min(1).max(10000).trim(),
  traits: Joi.array().max(100).items(
    Joi.object().pattern(/.*/, [ Joi.string() ])
  )
})

const createProfileBodySchema = Joi.object({
  name: Joi.string().alphanum().min(1).max(80).trim().required(),
})
router.post('/headmate', validator.body(profileBodySchema), validator.body(createProfileBodySchema), headmateController.createProfile)

router.get('/headmates', headmateController.getProfiles)
router.get('/headmates/:headmateId', validator.params(profileParamSchema), headmateController.getProfile)
router.patch('/headmate/:headmateId',
  validator.params(profileParamSchema),
  validator.body(profileBodySchema),
  headmateController.editProfile
)
router.delete('/headmates/:headmateId', validator.params(profileParamSchema), headmateController.deleteProfile)

export default router
