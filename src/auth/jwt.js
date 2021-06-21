import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken'
import { userService } from '../di-container'
import logger from '../libs/logger'
import { generateTokenCookieOptions } from '../libs/cookies'
// import { getUserById, updateUser } from '../services/user.service'
import UnauthorizedError from '../errors/UnauthorizedError'
import ForbiddenError from '../errors/ForbiddenError'

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
export function generateJWT(user, expiresIn = process.env.DEFAULT_ACCESS_TOKEN_TTL){
    return jwtSign({
        id: user.id
    }, process.env.JWT_SECRET, {
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
        logger('ERROR', { logMessage: 'Missing cookies' })
        next(new ForbiddenError('Missing cookies'))
        return
    }

    if(!req.cookies.accessToken || !req.cookies.refreshToken) {
        logger('ERROR', { logMessage: 'Missing access or refresh token' })
        next(new ForbiddenError('Missing cookies'))
        return
    }
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    try {
        const decodedJwtPayload = jwtVerify(accessToken, process.env.JWT_SECRET)
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
                const { id: uid} = jwtVerify(refreshToken, process.env.JWT_SECRET)

                // extract stored refresh token from storage
                user = await userService.getUserById(uid)
                if(!user) {
                    logger('ERROR', { logMessage: 'User not found in db' })
                    next(new UnauthorizedError('Access token expired', { name: 'InvalidToken' }))
                    return
                }

                const { refreshToken: storedRefreshToken, refreshTokenExpiryDt } = user
                if(!refreshTokenExpiryDt || storedRefreshToken !== refreshToken) {
                    logger('ERROR', { logMessage: 'Stored refresh token different from cookie refresh token' })
                    next(new UnauthorizedError('Access token expired', { name: 'InvalidToken' }))
                    return
                }
    
                // if refresh token expired already, issue both access and refresh tokens
                if(refreshTokenExpiryDt > new Date()) {
                    // generate new refresh token
                    const newRefreshToken = generateJWT(user, process.env.DEFAULT_REFRESH_TOKEN_TTL)
                    
                    // set new refresh token in cookie
                    res.cookie('refreshToken', newRefreshToken, generateTokenCookieOptions(process.env.NODE_ENV))
    
                    // save new refresh token in storage
                    const newRefreshTokenExpiryDt = generateJwtExpiryDate(process.env.DEFAULT_REFRESH_TOKEN_TTL_IN_SEC * 1000)
                    const queryParams = uid
                    const updateParams = {
                        refreshToken: newRefreshToken,
                        refreshTokenExpiryDt: newRefreshTokenExpiryDt,
                    }
                    userService.updateUser(queryParams, updateParams)

                }
            } catch(err) {
                logger('ERROR', { errobj: err })
                next(new UnauthorizedError('Access token expired', { name: 'InvalidToken' }))
                return
            }

            // issue access token
            const newAccessToken = generateJWT(user, process.env.DEFAULT_ACCESS_TOKEN_TTL)
            
            // set access token in cookie
            res.cookie('accessToken', newAccessToken, generateTokenCookieOptions(process.env.NODE_ENV))

            attachJwtPayloadToRequest(req, {
                payload: user,
                fieldsToInclude: [ 'id' ]
            })

            // next(null, user)
            next()
        } else {
            // Errors other than TokenExpiredError are rejected
            logger('ERROR', { logMessage: 'Token error other than TokenExpiredError' })
            logger('ERROR', { errobj: err })
            next(new UnauthorizedError('Access token expired', { name: 'InvalidToken' }))
            return
        }
    } 
}