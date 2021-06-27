import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken'
import { userService, logger } from '../di-container'
import config from '../libs/config'
import { generateTokenCookieOptions } from '../libs/cookies'
import InvalidTokenError from '../errors/InvalidTokenError'
import ForbiddenError from '../errors/ForbiddenError'

const ACCESS_TOKEN_TTL = config.get('security:jwt:access_token_ttl')

const attachJwtPayloadToRequest = (req, { requestProperty='auth', payload, fieldsToInclude=[] }) => {
    req[requestProperty] = {}
    fieldsToInclude.forEach(fieldname => {
      return req[requestProperty][fieldname] = payload[fieldname]
    })
  }

/**
 * Generates JWT from user object
 * @param {object} user User object
 * @param {int|string} expiresIn expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 * @returns {string} Standard JWT payload string 
 */
export async function generateJWT(user, expiresIn = ACCESS_TOKEN_TTL){
    return jwtSign({
        id: user.id
    }, config.get('security:jwt:secret'), {
        expiresIn
    })
}

/**
 * Generates JWT expirty date
 * @param {int} expiryTtl Number of milliseconds from current time
 * @returns {Date} Calculated expiry datetime
 */
export const generateJwtExpiryDate = expiryTtl => new Date(new Date().getTime() + parseInt(expiryTtl))

/**
* Middleware for validating jwt token to protect protected routes
* @param {Object} req Request object
* @param {Object} res Response object
* @param {Function} next next function
*/
export const validateJwt = async (req, res, next) => {
    if(!req || (req && !req.cookies)) {
        logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Missing cookies' })
        next(new ForbiddenError('Missing cookies'))
        return
    }

    if(!req.cookies.accessToken || !req.cookies.refreshToken) {
        logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Missing access or refresh token' })
        next(new ForbiddenError('Missing access or refresh token'))
        return
    }
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    try {
        const decodedJwtPayload = await jwtVerify(accessToken, config.get('security:jwt:secret'))
        attachJwtPayloadToRequest(req, {
            payload: decodedJwtPayload,
            fieldsToInclude: [ 'id' ]
        })
        // next(null, user)
        next()
    } catch(err) {
        // access token expired; issue new access token using refresh token
        if(err.name === 'TokenExpiredError') {
            let user = null

            try {
                // extract user id from refresh token
                const { id: uid} = await jwtVerify(refreshToken, config.get('security:jwt:secret'))

                // extract stored refresh token from storage
                user = await userService.getUserById(uid)
                if(!user) {
                    logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'User not found in db' })
                    next(new InvalidTokenError('Access token expired'))
                    return
                }
                const { refreshToken: storedRefreshToken, refreshTokenExpiryDt } = user
                if(!refreshTokenExpiryDt || storedRefreshToken !== refreshToken) {
                    logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Stored refresh token different from cookie refresh token' })
                    next(new InvalidTokenError('Access token expired'))
                    return
                }
    
                // if refresh token expired already, issue both access and refresh tokens
                if(refreshTokenExpiryDt < new Date()) {
                    // generate new refresh token
                    const newRefreshToken = await generateJWT(user, config.get('security:jwt:refresh_token_ttl'))
                    
                    // set new refresh token in cookie
                    res.cookie('refreshToken', newRefreshToken, generateTokenCookieOptions(config.get('app:node_env')))
    
                    // save new refresh token in storage
                    const newRefreshTokenExpiryDt = generateJwtExpiryDate(config.get('security:jwt:refresh_token_ttl_in_sec') * 1000)
                    const queryParams = uid
                    const updateParams = {
                        refreshToken: newRefreshToken,
                        refreshTokenExpiryDt: newRefreshTokenExpiryDt,
                    }
                    userService.updateUser(queryParams, updateParams)
                }
            } catch(err) {
                logger.log(logger.LOGLEVEL.ERROR, { errobj: err })
                next(new InvalidTokenError('Access token expired'))
                return
            }

            // issue access token
            const newAccessToken = await generateJWT(user, config.get('security:jwt:access_token_ttl'))
            
            // set access token in cookie
            res.cookie('accessToken', newAccessToken, generateTokenCookieOptions(config.get('app:node_env')))

            attachJwtPayloadToRequest(req, {
                payload: user,
                fieldsToInclude: [ 'id' ]
            })

            // next(null, user)
            next()
        } else {
            // Errors other than TokenExpiredError are rejected
            logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Token error other than TokenExpiredError' })
            logger.log(logger.LOGLEVEL.ERROR, { errobj: err })
            next(new InvalidTokenError('Access token expired'))
            return
        }
    } 
}