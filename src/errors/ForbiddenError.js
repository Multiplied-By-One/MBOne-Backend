import UserFacingError from './UserFacingError'

export default class ForbiddenError extends UserFacingError {
    constructor(message, options={}) {
        super(message, options)
      }
    
      get name() {
        return 'ForbiddenError'
      }
    
      get statusCode() {
        return 403
      }
}