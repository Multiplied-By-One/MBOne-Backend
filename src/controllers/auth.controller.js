import { generateJWT, generateJwtExpiryDate } from '../auth/jwt';
import UnauthorizedError from '../errors/UnauthorizedError'

export const authController = ({ config, jwt, logger, userService }) => {
    const googleAuth = async (req, res, next) => {
        const DEFAULT_ACCESS_TOKEN_TTL = config.get('security:jwt:access_token_ttl')
        const DEFAULT_ACCESS_TOKEN_TTL_IN_SEC = config.get('security:jwt:access_token_ttl_in_sec')
        const DEFAULT_REFRESH_TOKEN_TTL = config.get('security:jwt:refresh_token_ttl')
        const DEFAULT_REFRESH_TOKEN_TTL_IN_SEC = config.get('security:jwt:refresh_token_ttl_in_sec')

        if(!req || (req && !req.user)) {
            logger.log(logger.LOGLEVEL.ERROR, { filename: __filename, logMessage: 'User not found in request' })
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
        if(config.get('app:node_env')=== 'prod') {
            accessTokenCookieOptions.secure = true
            refreshTokenCookieOptions.secure = true
        }
        const accessToken = await generateJWT(user, DEFAULT_ACCESS_TOKEN_TTL)
        res.cookie('accessToken', accessToken, accessTokenCookieOptions)
    
        const refreshToken = await generateJWT(user, DEFAULT_REFRESH_TOKEN_TTL)
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    
        // Store refresh token and expire info associated with this user in storage
        const queryParams = user.id
        const updateParams = {
            refreshToken,
            refreshTokenExpiryDt: generateJwtExpiryDate(DEFAULT_REFRESH_TOKEN_TTL_IN_SEC * 1000)
        }
        try {
            await userService.updateUser(queryParams, updateParams)
        } catch(err) {
            logger.log(logger.LOGLEVEL.ERROR, { errobj: err })
            next(new UnauthorizedError('Login error'))
            return
        }
    
        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            tokenType: 'bearer',
            // scope: ,
            expiresIn: DEFAULT_ACCESS_TOKEN_TTL_IN_SEC,
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
    const logout = async (req, res) => {
        const JWT_SECRET = config.get('security:jwt:secret')
        let uid = null

        if(req && req.cookies && req.cookies.accessToken) {
            try {
                const decodedJwtPayload = await jwt.verify(req.cookies.accessToken, JWT_SECRET)
                uid = decodedJwtPayload.id
            } catch(err) {
                if(err.name === 'TokenExpiredError') {
                    try {
                        if(req.cookies.refreshToken) {
                            const decodedJwtPayload = await jwt.verify(req.cookies.refreshToken, JWT_SECRET)
                            uid = decodedJwtPayload.id
                        }
                    } catch(err) {
                        logger.log(logger.LOGLEVEL.ERROR, { filename: __filename, logMessage: 'Error during logout' })
                        logger.log(logger.LOGLEVEL.ERROR, { errobj: err })
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
                    logger.log(logger.LOGLEVEL.WARN, { filename: __filename, logMessage: 'Error during logout' })
                    logger.log(logger.LOGLEVEL.WARN, { errobj: err })
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