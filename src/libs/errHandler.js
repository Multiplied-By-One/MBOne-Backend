import UserFacingError from '../errors/UserFacingError';
import DatabaseError from '../errors/DatabaseError';

const errHandler = (err, req, res, next) => {
    console.error(err.name)
    console.error(err.message)
    console.error(err.stack)

    if(err instanceof UserFacingError) {
      if(err.name === 'InvalidTokenError') {
        return res.status(err.statusCode)
        .set('WWW-Authenticate', `Bearer err="${err.name}" errmsg="${err.errmsg}"`)
        .json({
            err: err.name,
            errmsg: err.errmsg
        })
      }

      return res.status(err.statusCode).json({
        err: err.name,
        errmsg: err.message
      })
    } else if(err instanceof DatabaseError) {
      return res.status(err.statusCode).json({
        err: err.name,
        errmsg: err.message
      })      
    }
  
    return res.status(500).json({
      err: 'InternalServerErr',
      errmsg: 'Internal server error'
    })
}

export default errHandler