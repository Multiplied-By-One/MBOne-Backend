import { verify as jwtVerify } from 'jsonwebtoken'
import { generateJWT, generateJwtExpiryDate } from '../auth/jwt';
import { updateUser } from '../services/user.service'

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
    let uid = null

    if(req && req.cookies && req.cookies.accessToken) {
        try {
            const decodedJwtPayload = jwtVerify(req.cookies.accessToken, process.env.JWT_SECRET)
            uid = decodedJwtPayload.id
        } catch(err) {
            if(err.name === 'TokenExpiredError') {
                try {
                    if(req.cookies.refreshToken) {
                        const decodedJwtPayload = jwtVerify(req.cookies.refreshToken, process.env.JWT_SECRET)
                        uid = decodedJwtPayload.id
                    }
                } catch(err) {
                    console.error('Error in auth.controller.js logout')
                    console.error(err)
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
                updateUser(queryParams, updateParams)
            } catch(err) {
                console.log('Error in auth.controller.js logout')
                console.log(err)
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