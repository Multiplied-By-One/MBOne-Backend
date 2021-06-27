import userRouter from './user.routes' 
import authRouter from './auth.routes' 
import { getConfiguredPassport } from "../auth/passport"

const API_PREFIX = '/api/v1'
export function bindRoutes(app){
    app.use(API_PREFIX, authRouter);
    
    // Get a configured passport instance
    let passport = getConfiguredPassport()
    let authenticationMiddleware = passport.authenticate('jwt', { session: false });

    //Apply JWT authentication to all registered routes
    app.use(API_PREFIX, authenticationMiddleware, userRouter);
    
}