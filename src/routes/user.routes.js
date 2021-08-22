import {Router} from 'express'
// import { getUser, createUser, updateUser } from '../controllers/user.controller'
import { userController } from '../di-container'

let router = Router()

router.get('/user', userController.getUser)
router.post('/user', userController.createUser)
router.patch('/user', userController.updateUser)

export default router