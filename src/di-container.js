import jwt from 'jsonwebtoken'
import Logger from './libs/logger'
import config from './libs/config'
import { authController as AuthController } from './controllers/auth.controller'
import { userController as UserController } from './controllers/user.controller'
import { userService as UserService } from './services/user.service'

export const logger = Logger({})
export const userService = UserService({  })
export const authController = AuthController({ config, jwt, logger, userService })
export const userController = UserController({ logger, userService })