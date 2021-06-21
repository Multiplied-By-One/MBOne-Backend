// import { verify as jwtVerify } from 'jsonwebtoken'
import { generateJWT, generateJwtExpiryDate } from '../auth/jwt';
import { userService } from '../di-container'
import { updateUser } from '../services/user.service'
import { generateLogString } from '../libs/logger'
import UnauthorizedError from '../errors/UnauthorizedError'

export const authController = ({ jwt, logger }) => {
    const googleAuth = async (req, res, next) => {
        const DEFAULT_ACCESS_TOKEN_TTL = process.env.DEFAULT_ACCESS_TOKEN_TTL
        const DEFAULT_REFRESH_TOKEN_TTL = process.env.DEFAULT_REFRESH_TOKEN_TTL

        if(!req || (req && !req.user)) {
            logger('ERROR', { filename: __filename, logMessage: 'User not found in request' })
            next(new UnauthorizedError('Login error'))
            return
        }
    
        // generate login hash from username
        const user = req.user
     
        // Sets access and refresh token cookies and loginHash cookie from authenticated google user
        const accessTokenCookieOptions = {
            secure: false,
            httpOnly: true,
        }
        const refreshTokenCookieOptions = {
            secure: false,
            httpOnly: true,
        }
        if(process.env.NODE_ENV === 'prod') {
            accessTokenCookieOptions.secure = true
            refreshTokenCookieOptions.secure = true
        }
        const accessToken = generateJWT(user, DEFAULT_ACCESS_TOKEN_TTL)
        res.cookie('accessToken', accessToken, accessTokenCookieOptions)
    
        const refreshToken = generateJWT(user, DEFAULT_REFRESH_TOKEN_TTL)
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    
        // Store refresh token and expire info associated with this user in storage
        const queryParams = user.id
        const updateParams = {
            refreshToken,
            refreshTokenExpiryDt: generateJwtExpiryDate(process.env.DEFAULT_REFRESH_TOKEN_TTL_IN_SEC * 1000)
        }
        try {
            // await updateUser(queryParams, updateParams)
            userService.updateUser(queryParams, updateParams)
        } catch(err) {
            logger('ERROR', { errobj: err })
            next(new UnauthorizedError('Login error'))
            return
        }
    
        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            tokenType: 'bearer',
            // scope: ,
            expiresIn: process.env.DEFAULT_ACCESS_TOKEN_TTL_IN_SEC,
        })
    }

    /**
     * 
     * Logout json
     * @typedef {Object} LogoutJson
     * @property {string} message
     */

    /**
     * Delete user refresh token from db and clear access and
     * refresh tokens from cookies.
     * 
     * @param {Object} req Request object
     * @param {Object} res Response object
     * @returns {LogoutJson}
     */
    const logout = (req, res) => {
        let uid = null

        if(req && req.cookies && req.cookies.accessToken) {
            try {
                const decodedJwtPayload = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET)
                uid = decodedJwtPayload.id
            } catch(err) {
                if(err.name === 'TokenExpiredError') {
                    try {
                        if(req.cookies.refreshToken) {
                            const decodedJwtPayload = jwt.verify(req.cookies.refreshToken, process.env.JWT_SECRET)
                            uid = decodedJwtPayload.id
                        }
                    } catch(err) {
                        logger('ERROR', { filename: __filename, logMessage: 'Error during logout' })
                        logger('ERROR', { errobj: err })
                    }
                }
            }

            if(uid) {
                try {
                    // delete user refresh token from storage
                    const queryParams = uid
                    const updateParams = {
                        refreshToken: null,
                        refreshTokenExpiryDt: null,
                    }
                    userService.updateUser(queryParams, updateParams)
                } catch(err) {
                    logger('ERROR', { filename: __filename, logMessage: 'Error during logout' })
                    logger('ERROR', { errobj: err })
                }
            }
        }

        req.logout()

        // remove cookies from browser
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        res.status(200).json({
            message: 'Log out successful'
        })
    }

    return {
        googleAuth,
        logout
    }
}