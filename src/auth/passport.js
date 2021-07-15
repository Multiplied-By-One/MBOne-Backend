import passport from 'passport'
import { Strategy as StrategyGoogle } from 'passport-google-oauth20'
import { getOneOrCreateByGoogleDetails } from '../services/user.service'
import config from '../libs/config'

export function getConfiguredPassport(){
    //Setup google oauth
    passport.use(new StrategyGoogle({
            clientID: config.get('GOOGLE_OAUTH_CLIENT_ID'),
            clientSecret: config.get('GOOGLE_OAUTH_CLIENT_SECRET'),
            callbackURL: config.get('GOOGLE_OAUTH_CALLBACK_URL')
        },
        async (accessToken, refreshToken, profile, cb) => {
            return cb(null, await getOneOrCreateByGoogleDetails(profile.id, profile.emails[0].value))
        }
    ))

    return passport
}

export function bindPassportToApp(app){
    app.use(passport.initialize())
}