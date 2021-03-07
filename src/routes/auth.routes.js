import { Router } from "express";
import { getConfiguredPassport } from "../auth/passport"
import googleAuth from "../controllers/auth.controller"

let router = Router()
let passport = getConfiguredPassport()

router.get('/auth/google/callback', passport.authenticate("google", {
    scope: ["profile", "email"]
}), googleAuth)

export default router