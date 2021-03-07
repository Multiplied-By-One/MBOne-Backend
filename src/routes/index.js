import userRouter from './user.routes' 
import authRouter from './auth.routes' 

const API_PREFIX = '/api/v1'
export function bindRoutes(app){
    app.use(API_PREFIX, userRouter);
    app.use(API_PREFIX, authRouter);
}