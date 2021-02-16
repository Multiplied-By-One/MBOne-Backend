import {Router} from 'express'
import { getUser, createUser, updateUser } from '../controllers/user.controller'

let router = Router()

router.get('/user/:userId', getUser)
router.post('/user/:userId', createUser)
router.patch('/user/:userId', updateUser)

export default router