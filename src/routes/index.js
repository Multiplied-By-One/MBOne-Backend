import userRouter from './user.routes' 
import authRouter from './auth.routes'
import { validateJwt } from '../auth/jwt'
import errHandler from '../libs/errHandler'

const API_PREFIX = "/api/v1"

export function bindRoutes(app){
    app.use(API_PREFIX, authRouter);
    
    //Apply JWT authentication to all registered routes
    app.use(API_PREFIX, validateJwt, userRouter);

    // custom default error handler
    app.use(errHandler)
}
