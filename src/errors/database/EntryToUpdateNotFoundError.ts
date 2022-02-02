import DatabaseError from './DatabaseError'

export default class DbEntryToUpdateNotFoundError extends DatabaseError {
  constructor(message:string='DbEntryToUpdateNotFoundError', options:object={}) {
    super(message, options)
  }

  get name() {
    return 'DbEntryToUpdateNotFoundError'
  }
}
