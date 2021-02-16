import router from './user.routes' 

export function bindRoutes(app){
    app.use('/api/v1', router);
}