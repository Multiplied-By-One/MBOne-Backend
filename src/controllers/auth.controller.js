import {generateJWT} from '../auth/jwt';
import {StatusCodes, ReasonPhrases} from 'http-status-codes';

export default function googleAuth(req, res){

    //Sets jwt from authenticated google user
    res.cookie('jwt', generateJWT(req.user))

    //Set a cookie to add the jwt auth
    return  res.send(ReasonPhrases.NO_CONTENT)
}