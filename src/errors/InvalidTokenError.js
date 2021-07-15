import UnauthorizedError from './UnauthorizedError'

export default class InvalidTokenError extends UnauthorizedError {
    constructor(message, options={}) {
        super(message, options)
    }

    get name() {
        return 'InvalidToken'
    }
}