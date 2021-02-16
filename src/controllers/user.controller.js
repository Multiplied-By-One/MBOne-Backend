import {getUserById} from '../services/user.service'

export function getUser(req, res){
    let user = getUserById(res.params)
}

export function createUser(req, res){
    
}

export function updateUser(req, res){
    
}