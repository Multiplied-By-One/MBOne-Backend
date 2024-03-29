import userRouter from './user.routes' 
import authRouter from './auth.routes'
import headmateRouter from './headmate.routes'
import { getConfiguredPassport } from "../auth/passport"
import { validateJwt } from '../auth/jwt'
import errHandler from '../libs/errHandler'
import config from '../libs/config'

const API_PREFIX = config.get('app:api_prefix')

export function bindRoutes(app){
    app.use(API_PREFIX, authRouter)
    
    // Get a configured passport instance
    let passport = getConfiguredPassport()
    // let authenticationMiddleware = passport.authenticate('jwt', { session: false });

    //Apply JWT authentication to all registered routes
    app.use(API_PREFIX, validateJwt, userRouter)
    app.use(API_PREFIX, validateJwt, headmateRouter)

    // custom default error handler
    app.use(errHandler)
}
