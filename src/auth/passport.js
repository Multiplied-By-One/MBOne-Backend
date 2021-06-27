import passport from 'passport'
import {Strategy as PassportJWTStrategy} from 'passport-jwt';
import { Strategy as StrategyGoogle } from 'passport-google-oauth20'
import { async } from 'regenerator-runtime'
import { getOneOrCreateByGoogleDetails, getUserById } from '../services/user.service'

export function getConfiguredPassport(){
    //Setup google oauth
    passport.use(new StrategyGoogle({
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, cb) => {
            return cb(null, await getOneOrCreateByGoogleDetails(profile.id, profile.emails[0].value))
        }
    ))

    //Setup google authentication
    passport.use(new PassportJWTStrategy({
        jwtFromRequest: req => req.cookies.jwt,
        secretOrKey: process.env.JWT_SECRET,
    }, async (jwt_payload, done) => {
        // Load user by id if we have one!
        try{
            let user = await getUserById(jwt_payload.id)
            return done(null, user)
        } catch (e){
            return done(e, false)
        }
    }))

    return passport
}

export function bindPassportToApp(app){
    app.use(passport.initialize())
}