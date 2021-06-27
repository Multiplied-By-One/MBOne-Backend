import {Router} from 'express'
import { getUser, createUser, updateUser } from '../controllers/user.controller'

let router = Router()

router.get('/user', getUser)
router.post('/user', createUser)
router.patch('/user', updateUser)

export default router