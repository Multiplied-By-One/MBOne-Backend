import userRouter from './user.routes' 
import authRouter from './auth.routes' 
import { getConfiguredPassport } from "../auth/passport"
import { validateJwt } from '../auth/jwt'

const API_PREFIX = process.env.API_PREFIX
export function bindRoutes(app){
    app.use(API_PREFIX, authRouter);
    
    // Get a configured passport instance
    let passport = getConfiguredPassport()
    // let authenticationMiddleware = passport.authenticate('jwt', { session: false });

    //Apply JWT authentication to all registered routes
    app.use(API_PREFIX, validateJwt, userRouter);

    app.use('*', (req, res, next) => {
        let err = new Error('Page does not exist')
        next(err)
    })
}
