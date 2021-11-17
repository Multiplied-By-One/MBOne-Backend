import UserFacingError from '../errors/UserFacingError';
import DatabaseError from '../errors/DatabaseError';

/*
  [
  {
    message: '"filename" with value "img1*.1jpg" fails to match the required pattern: /^[\\w,\\s-]+\\.[A-Za-z]{3}$/',
    path: [ 'filename' ],
    type: 'string.pattern.base',
    context: {
      name: undefined,
      regex: /^[\w,\s-]+\.[A-Za-z]{3}$/,
      value: 'img1*.1jpg',
      label: 'filename',
      key: 'filename'
    }
  },
  {
    message: '"filetype" must be one of [image/jpeg, image/png, image/svg+xml, image/webp]',
    path: [ 'filetype' ],
    type: 'any.only',
    context: {
      valids: [Array],
      label: 'filetype',
      value: 'image/jpg',
      key: 'filetype'
    }
  }
]
*/
const processInputErr = (err) => {
  if(!(err && err.error && err.error.details && Array.isArray(err.error.details) && err.error.details.length !== 0)) {
    return ''
  }

  const reducer = (prevVal, currVal) => `${prevVal} ${currVal.message}; `
  return err.error.details.reduce(reducer, '')
}

const processEntityErr = (err) => {
  let entityErr = null

  if(err) {
    if(err.err) {
      if(err.err.err) {
        if(err.err.err.err) {

        } else if(err.err.err.entityErr) {
          entityErr = err.err.err.entityErr
        }
      } else if(err.err.entityErr) {
        entityErr = err.err.entityErr
      }
    } else if(err.entityErr) {
      entityErr = err.entityErr
    }
  }

  if(!entityErr) {
    return ''
  }

  const reducer = (prevVal, currVal) => {
    if(currVal && typeof currVal.constraints === 'object') {
      const arrConstraints = Object.values(currVal.constraints)
      const addedErrmsg = arrConstraints.join('; ')
      return `${prevVal}${addedErrmsg}`
    }
    
    return prevVal
  }

  return entityErr.reduce(reducer, '')
}

const errHandler = (err, req, res, next) => {
  // input error from express-joi-validation
  const inputErrmsg = processInputErr(err)
  if(inputErrmsg) {
    return res.status(400).json({
      err: 'BadRequestError',
      errmsg: inputErrmsg,
    })
  }

  // entity validation errors (typeorm class-validator)
  const entityErrmsg = processEntityErr(err)
  if(entityErrmsg) {
    return res.status(400).json({
      err: 'BadRequestError',
      errmsg: entityErrmsg,
    })
  }

  // print error detail
  if(err) {
    console.error(err.name)
    console.error(err.message)
    console.error(err.stack)
    if(err.err) {
      console.log(err.err)
    }
  }

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