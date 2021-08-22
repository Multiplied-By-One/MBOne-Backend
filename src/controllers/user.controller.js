// import {getUserById} from '../services/user.service'
import NotFoundError from '../errors/NotFoundError'

/*
export async function getUser(req, res){
    if(!req || (req && !req.auth) || (req && req.auth && !req.auth.id)) {
        console.error('Error in user.controller.js getUser')
        console.error('Missing user id')
        return res.status(404).json({
            err: 'NotFoundErr',
            errmsg: 'User not found'
        })
    }

    try {
        const user = await getUserById(req.auth.id)
        if(!user) {
            return res.status(404).json({
                err: 'NotFoundErr',
                errmsg: 'User not found'
            })
        }
        
        return res.status(200).json({
            emailAddress: user.emailAddress,
        })
    } catch(err) {
        console.error('Error in user.controller.js getUser')
        console.error(err)
        return res.status(404).json({
            err: 'NotFoundErr',
            errmsg: 'User not found'
        })
    }
}

export function createUser(req, res){
    
}

export function updateUser(req, res){
    
}
*/

export const userController = ({ logger, userService }) => {
    const getUser = async (req, res, next) => {
        if(!req || (req && !req.auth) || (req && req.auth && !req.auth.id)) {
            logger('ERROR', { logMessage: 'Missing user id' })
            next(new NotFoundError('User not found'))
            return
        }
    
        try {
            const user = await userService.getUserById(req.auth.id)
            if(!user) {
                next(new NotFoundError('User not found'))
                return
            }
            
            return res.status(200).json({
                emailAddress: user.emailAddress,
            })
        } catch(err) {
            logger('ERROR', { errobj: err })
            next(new NotFoundError('User not found'))
            return
        }
    }

    const createUser = (req, res) => {
    
    }
    
    const updateUser = (req, res) => {
        
    }

    return {
        getUser,
        createUser,
        updateUser
    }
}