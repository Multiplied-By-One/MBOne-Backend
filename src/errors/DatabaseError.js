export default class DatabaseError extends Error {
    constructor(message, options={}) {
      super(message)
      this.name = 'DatabaseErr'
      this.message = 'Data-related error'
      this.statusCode = 500
      this.err = null
  
      if(options) {
        for (const [key, value] of Object.entries(options)) {
          this[key] = value
        }
      }
  /*
      if(this.err && this.err.name === 'MongoError') {
        if(this.err.message) {
          const mesageWords = this.err.message.split(' ')
          if(mesageWords[0] === 'E11000') {
            this.statusCode = 400
            this.message = 'Duplicate key error'
          }
        }
      }
      */
    }
  }