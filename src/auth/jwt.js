import {sign} from 'jsonwebtoken'
// Default TTL for json web tokens in MS
const DEFAULT_JWT_TTL = "1d";

/**
 * Generates JWT from user object
 * @param {object} user User object
 * @param {int|string} expiresIn expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 * @returns {string} Standard JWT payload string 
 */
export function generateJWT(user, expiresIn = null){
    return sign({
        id: user.id
    }, process.env.JWT_SECRET, {
        expiresIn: expiresIn === null ? DEFAULT_JWT_TTL : expiresIn 
    })
}