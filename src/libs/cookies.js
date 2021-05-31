export const generateTokenCookieOptions = runningEnv => {
    let cookieOptions = {
        secure: false,
        httpOnly: true
    }

    if(runningEnv === 'prod') {
        cookieOptions.secure = true
    }

    return cookieOptions
}