import getConnection from '../db/connection'
import {User} from '../entities/User.ts'
import { Equal } from "typeorm";

/**
 * Supplies a new google account based on a newly authed user's google account ID.
 * If a account with the ID exists it will be fetched and returned. 
 * Otherwise a new account will be created and returned.
 * 
 * @param {int} googleAccountId 
 * @param {string} googleAccountEmail 
 */
export async function getOneOrCreateByGoogleDetails(googleAccountId, googleAccountEmail){
    let rep = await getUserRepository()
    let targetUser = await rep.findOne({googleAccountId: googleAccountId})

    if(targetUser === undefined){
        return await createUser({
            googleAccountId: googleAccountId,
            emailAddress: googleAccountEmail
        })
    }

    return targetUser
}

export async function getUserRepository(){
    let connection = await getConnection()
    return connection.getRepository(User)
}

export async function getUserById(id){
    let rep = await getUserRepository()
    return await rep.findOne({id: id})
}

/**
 * Creates a new user object persists it to the DB then returns it
 * @param {int|null} fields.googleAccountId The google account Id for the new user
 * @param {string|null} fields.emailAddress The email address of the new user to create
 * @returns {Object} User
 */
export async function createUser(fields){
    let rep = await getUserRepository()
    let user = new User
    user.googleAccountId = fields.googleAccountId
    user.emailAddress = fields.emailAddress
    await user.save()
    return user
}

export async function updateUser(evt){
    let connection = await getConnection()
}