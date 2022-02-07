import { Router } from 'express'
import Joi from 'joi'
import expressJoiValidation from 'express-joi-validation'
import { eyeAccountController } from '../di-container'


let router = Router()

const validator = expressJoiValidation.createValidator({
  passError: true,
  convert: false
})

const eyeAccountIdSchema = Joi.object({
  eyeAccountId: Joi.number().integer().min(0).required()
})

router.get('/eyeaccount/:eyeAccountId', validator.params(eyeAccountIdSchema), eyeAccountController.getEyeAccount)

export default router
