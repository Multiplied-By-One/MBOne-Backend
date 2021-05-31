import jwt from 'jsonwebtoken'
import { generateTokenCookieOptions } from '../libs/cookies'
import { getUserById, updateRefreshToken } from '../services/user.service'

/**
 * Generates JWT from user object
 * @param {object} user User object
 * @param {int|string} expiresIn expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 * @returns {string} Standard JWT payload string 
 */
export function generateJWT(user, expiresIn = process.env.DEFAULT_ACCESS_TOKEN_TTL){
    return jwt.sign({
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
        console.log('Missing cookies')
        return res.status(403).json({
            err: 'AuthErr',
            errmsg: 'Forbidden',
        })
    }

    if(!req.cookies.accessToken || !req.cookies.refreshToken) {
        console.log('Missing access or refresh token')
        return res.status(403).json({
            err: 'AuthErr',
            errmsg: 'Forbidden',
        })
    }
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    if(!req.session || (req.session && !req.session.user)) {
        console.log('Error in jwt.js validateJwt')
        console.log('Missing user session')
        return res.status(403).json({
            err: 'AuthErr',
            errmsg: 'Forbidden'
        })
    }
    const { id: uid } = req.session.user
    let user = req.session.user

    try {
        const decodedJwtPayload = jwt.verify(accessToken, process.env.JWT_SECRET)
        next(null, user)
    } catch(err) {
        // access token expired; issue new access token using refresh token
        if(err.name === 'TokenExpiredError') {
            try {
                // extract stored refresh token from storage
                user = await getUserById(uid)
                if(!user) {
                    console.log('Error in jwt.js validateJwt')
                    console.log('User not found in db')
                    return res.status(403).json({
                        err: 'AuthERr',
                        errmsg: 'Forbidden'
                    })
                }

                const { refreshToken: storedRefreshToken, refreshTokenExpiryDt } = user
                if(!refreshTokenExpiryDt || storedRefreshToken !== refreshToken) {
                    console.log('Stored refresh token different from cookie refresh token')
                    return res.status(403).json({
                        err: 'AuthErr',
                        errmsg: 'Forbidden'
                    })
                }
    
                // if refresh token expired already, issue both access and refresh tokens
                // if(refreshTokenExpiryDt < new Date()) {
                if(refreshTokenExpiryDt > new Date()) {
                    // generate new refresh token
                    const newRefreshToken = generateJWT(user, process.env.DEFAULT_REFRESH_TOKEN_TTL)
                    
                    // set new refresh token in cookie
                    res.cookie('refreshToken', newRefreshToken, generateTokenCookieOptions(process.env.NODE_ENV))
    
                    // save new refresh token in storage
                    const newRefreshTokenExpiryDt = generateJwtExpiryDate(process.env.DEFAULT_REFRESH_TOKEN_TTL_IN_SEC * 1000)
                    updateRefreshToken(uid, newRefreshToken, newRefreshTokenExpiryDt)
                }
            } catch(err) {
                console.log('Error in jwt.js validateJwt')
                console.log(err)
                return res.status(403).json({
                    err: 'AuthErr',
                    errmsg: 'Forbidden'
                })
            }

            // issue access token
            const newAccessToken = generateJWT(user, process.env.DEFAULT_ACCESS_TOKEN_TTL)
            
            // set access token in cookie
            res.cookie('accessToken', newAccessToken, generateTokenCookieOptions(process.env.NODE_ENV))

            next(null, user)
        } else {
            // Errors other than TokenExpiredError are rejected
            console.log('Error in validateJwt')
            console.log('Token error other than TokenExpiredError')
            console.log(err)
            return res.status(403).json({
                err: 'AuthErr',
                errmsg: 'Forbidden'
            })
        }
    } 
}