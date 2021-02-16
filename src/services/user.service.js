import getConnection from '../db/connection'
import {User} from '../entities/User.ts'

export async function getUserById(id){
    let connection = await getConnection()
    let repository = connection.getRepository(User)
    let user = await repository.findOne(1)
    await connection.close();
    return user
}

export async function createUser(evt){
    let connection = await getConnection()
}

export async function updateUser(evt){
    let connection = await getConnection()
}