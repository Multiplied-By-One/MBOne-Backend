import UserFacingError from './UserFacingError'

export default class UnauthorizedError extends UserFacingError {
    constructor(message='Unauthorized error', options={}) {
        super(message, options)
      }
    
      get name() {
        return 'UnauthorizedError'
      }
    
      get statusCode() {
        return 401
      }
}