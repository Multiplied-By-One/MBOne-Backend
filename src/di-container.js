import jwt from 'jsonwebtoken'
import { PutObjectCommand} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { validate as entityValidate } from 'class-validator'
// import { getConnection, closeConnection } from './db/connection'
import getConnection, { closeConnection } from './db/connection'
import Logger from './libs/logger'
import config from './libs/config'
import s3Client from './libs/s3Client'
import { authController as AuthController } from './controllers/auth.controller'
import { userController as UserController } from './controllers/user.controller'
import HeadmateController from './controllers/headmate.controller'
import { userService as UserService } from './services/user.service'
import HeadmateService from './services/headmate.service'
import S3ImageUploadService from './services/s3ImageUpload.service'
import { Headmate } from './entities/Headmate'

export const logger = Logger({})
export const userService = UserService({  })
export const headmateService = HeadmateService({ entityValidate, getConnection, closeConnection, Headmate })
export const s3ImageUploadService = S3ImageUploadService({ config, s3Client, PutObjectCommand, getSignedUrl })
export const authController = AuthController({ config, jwt, logger, userService })
export const userController = UserController({ logger, userService })
export const headmateController = HeadmateController({ config, headmateService, s3ImageUploadService, Headmate })