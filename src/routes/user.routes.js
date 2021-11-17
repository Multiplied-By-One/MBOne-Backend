import {Router} from 'express'
import { userController } from '../di-container'

let router = Router()

router.get('/user', userController.getUser)
router.post('/user', userController.createUser)
router.patch('/user', userController.updateUser)

export default router