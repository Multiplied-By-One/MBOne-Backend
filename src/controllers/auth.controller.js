import { generateJWT, generateJwtExpiryDate } from '../auth/jwt';
import { updateUser, updateRefreshToken } from '../services/user.service'

export const googleAuth = async (req, res) => {
    const DEFAULT_ACCESS_TOKEN_TTL = process.env.DEFAULT_ACCESS_TOKEN_TTL
    const DEFAULT_REFRESH_TOKEN_TTL = process.env.DEFAULT_REFRESH_TOKEN_TTL

    if(!req || (req && !req.user)) {
        console.log('User not found in request')
        return res.status(401).json({
            err: 'AuthErr',
            errmsg: 'Login error',
        })
    }

    // store user info into session cookie
    const user = req.user
    req.session.user = user

    // Sets access and refresh token cookies from authenticated google user
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
    const accessToken = generateJWT(req.user, DEFAULT_ACCESS_TOKEN_TTL)
    res.cookie('accessToken', accessToken, accessTokenCookieOptions)

    const refreshToken = generateJWT(req.user, DEFAULT_REFRESH_TOKEN_TTL)
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions)

    // Store refresh token and expire info associated with this user in storage
    const queryParams = user.id
    const updateParams = {
        refreshToken,
        refreshTokenExpiryDt: generateJwtExpiryDate(process.env.DEFAULT_REFRESH_TOKEN_TTL_IN_SEC * 1000)
    }
    try {
        await updateUser(queryParams, updateParams)
    } catch(err) {
        console.log('Error in googleAuth')
        console.log(err)
        return res.status(401).json({
            err: 'AuthErr',
            errmsg: 'Login error'
        })
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
export const logout = (req, res) => {
    if(req && req.session && req.session.user) {
        const { id: uid } = req.session.user
        if(uid) {
            try {
                // delete user refresh token from storage
                updateRefreshToken(uid, null, null)
            } catch(err) {
                console.log('Error in auth.controller.js logout')
                console.log(err)
            }
        }
    }

    req.logout()
    req.session = null

    // remove cookies from browser
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(200).json({
        message: 'Log out successful'
    })
}