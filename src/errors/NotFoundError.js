import UserFacingError from './UserFacingError'

export default class NotFoundError extends UserFacingError {
    constructor(message, options={}) {
        super(message, options)
      }
    
      get name() {
        return 'NotFoundError'
      }
    
      get statusCode() {
        return 404
      }
}