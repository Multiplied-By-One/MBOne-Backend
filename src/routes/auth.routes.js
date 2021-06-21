import { Router } from "express";
import { authController } from '../di-container'
import { getConfiguredPassport } from "../auth/passport"
// import jwt from 'jsonwebtoken'
// import { googleAuth, /* authController as AuthController */ } from '../controllers/auth.controller'
// import logger from '../libs/logger'

let router = Router()
let passport = getConfiguredPassport()

// const authController = AuthController({ jwt, logger })

router.get('/auth/google/callback', passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    failureRedirect: '/api/v1/auth/google/callback'
}), authController.googleAuth)

// router.post('/logout', logout)
router.get('/logout', authController.logout)

export default router