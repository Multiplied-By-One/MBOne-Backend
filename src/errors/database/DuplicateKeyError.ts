import DatabaseError from './DatabaseError'

export default class DuplicateKeyError extends DatabaseError {
  constructor(message:string='DuplicateKeyError', options:object={}) {
    super(message, options)
  }

  get name() {
    return 'DuplicateKeyError'
  }
}
