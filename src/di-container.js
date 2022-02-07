import jwt from 'jsonwebtoken'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { validate as entityValidate } from 'class-validator'
import getConnection, { closeConnection } from './db/connection'
import Logger from './libs/logger'
import config from './libs/config'
import s3Client from './libs/s3Client'
import { authController as AuthController } from './controllers/auth.controller'
import { userController as UserController } from './controllers/user.controller'
import {eyeAccountController as EyeAccountController} from './controllers/eyeAccount.controller'
import HeadmateController from './controllers/headmate.controller'
import { userService as UserService } from './services/user.service'
import HeadmateService from './services/headmate.service'
import S3Service from './services/s3.service'
import EyeAccountService from './services/eyeAccount.service'
import { Headmate } from './entities/Headmate'
import { EyeAccount } from './entities/EyeAccount'

// Services
export const logger = Logger({})
export const s3Service = S3Service({ s3Client, PutObjectCommand, DeleteObjectCommand, getSignedUrl })
export const userService = UserService({  })
export const headmateService = HeadmateService({ config, entityValidate, s3Service, getConnection, closeConnection, Headmate })
export const eyeAccountService = EyeAccountService({getConnection, EyeAccount})

// Controllers
export const authController = AuthController({ config, jwt, logger, userService })
export const userController = UserController({ logger, userService })
export const headmateController = HeadmateController({ config, headmateService, s3Service, Headmate })
export const eyeAccountController = EyeAccountController({ logger, eyeAccountService })