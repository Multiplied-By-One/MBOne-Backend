import userRouter from './user.routes' 
import authRouter from './auth.routes'
import { getConfiguredPassport } from "../auth/passport"
import { validateJwt } from '../auth/jwt'
import errHandler from '../libs/errHandler'
import config from '../libs/config'

const API_PREFIX = config.get('app:api_prefix')

export function bindRoutes(app){
    console.log(`[API PREFIX]: ${API_PREFIX}`)
    app.use(API_PREFIX, authRouter);
    
    //Apply JWT authentication to all registered routes
    app.use(API_PREFIX, validateJwt, userRouter);

    // custom default error handler
    app.use(errHandler)
}
