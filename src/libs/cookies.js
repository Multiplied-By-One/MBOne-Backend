export const generateTokenCookieOptions = (runningEnv='prod', opts={}) => {
    let secure = true
    if(runningEnv !== 'prod') {
        secure = false
    }
    const cookieOptions = {
        httpOnly: true,
        secure
    }

    return Object.assign({}, cookieOptions, opts)
}