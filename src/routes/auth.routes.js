import { Router } from "express";
import { authController } from '../di-container'
import { getConfiguredPassport } from "../auth/passport"

const router = Router()
const passport = getConfiguredPassport()

router.get('/auth/google/callback', passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    failureRedirect: '/api/v1/auth/google/callback'
}), authController.googleAuth)

router.get('/logout', authController.logout)

export default router