import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken'
import { userService, logger } from '../di-container'
import config from '../libs/config'
import { generateTokenCookieOptions } from '../libs/cookies'
import InvalidTokenError from '../errors/InvalidTokenError'
import TokenNotFoundError from '../errors/TokenNotFoundError'
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
// return next()    
    if(!req || (req && !req.cookies)) {
        logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Missing cookies' })
        next(new InvalidTokenError('Access token expired'))
        return
    }

    try {
        if(!req.cookies.accessToken) {
            logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Missing access token' })
            throw new TokenNotFoundError('access token cookie not found')
        }
        const accessToken = req.cookies.accessToken

        const decodedJwtPayload = await jwtVerify(accessToken, config.get('security:jwt:secret'))
        attachJwtPayloadToRequest(req, {
            payload: decodedJwtPayload,
            fieldsToInclude: [ 'id' ]
        })
        // next(null, user)
        next()
    } catch(err) {
        // access token expired; issue new access token using refresh token
        if(err.name === 'TokenExpiredError' || err.name === 'TokenNotFoundError') {
            let user = null

            if(!req.cookies.refreshToken) {
                logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Missing refresh token' })
                next(new ForbiddenError('Missing refresh token'))
                return
            }

            try {
                // retrieve user with refresh token
                const refreshToken = req.cookies.refreshToken
                user = await userService.getUser({ refreshToken })
                if(!user) {
                    logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'User not found in db' })
                    next(new InvalidTokenError('User not found'))
                    return
                }
                const { refreshToken: storedRefreshToken, refreshTokenExpiryDt } = user
                if(!refreshTokenExpiryDt || storedRefreshToken !== refreshToken) {
                    logger.log(logger.LOGLEVEL.ERROR, { logMessage: 'Stored refresh token different from cookie refresh token' })
                    next(new InvalidTokenError('Refresh token expired'))
                    return
                }
                // if refresh token expired already, issue both access and refresh tokens
                if(refreshTokenExpiryDt < new Date()) {
                    next(new InvalidTokenError('Refresh token expired'))
                    return
                }
            } catch(err) {
                logger.log(logger.LOGLEVEL.ERROR, { errobj: err })
                next(new InvalidTokenError('Refresh token expired or invalid'))
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