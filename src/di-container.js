import jwt from 'jsonwebtoken'
import logger from './libs/logger'
import { authController as AuthController } from './controllers/auth.controller'
import { userController as UserController } from './controllers/user.controller'
import { userService as UserService } from './services/user.service'

export const userService = UserService({  })
export const authController = AuthController({ jwt, logger })
export const userController = UserController({ logger, userService })
