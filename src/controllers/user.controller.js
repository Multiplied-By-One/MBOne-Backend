import {getUserById} from '../services/user.service'

export function getUser(req, res){
    res.status(200)
       .send(JSON.stringify(req.user))
}

export function createUser(req, res){
    
}

export function updateUser(req, res){
    
}