import UserFacingError from './UserFacingError'

export default class BadRequestError extends UserFacingError {
  constructor(message='BadRequestError', options = {}) {
    super(message, options)

    /*
        if(options.err && Array.isArray(options.err)) {
      const arrErrmsg = options.err.map(elem => elem.msg)
      this.message = arrErrmsg.join(';')
    }
    */
  }

  get name() {
    return 'BadRequestError'
  }

  get statusCode() {
    return 400
  }
}
