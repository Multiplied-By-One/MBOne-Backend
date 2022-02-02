import nconf from 'nconf'
import { ENV } from '../constants'

function Config() {
    nconf.argv().env()
    const env = nconf.get(process.env.NODE_ENV) || ENV.DEV
    nconf.file(env, 'src/config/config.' + env + '.json')
    nconf.file('default', 'src/config/config.default.json')

    nconf.set('app:node_env', env)
    // access token
    if(process.env.JWT_SECRET) {
        nconf.set('security:jwt:secret', process.env.JWT_SECRET)
    }
    if(process.env.ACCESS_TOKEN_TTL) {
        nconf.set('security:jwt:access_token_ttl', process.env.ACCESS_TOKEN_TTL)
    }
    if(process.env.ACCESS_TOKEN_TTL_IN_SEC) {
        nconf.set('security:jwt:access_token_ttl_in_sec', parseInt(process.env.ACCESS_TOKEN_TTL_IN_SEC))
    }
    if(process.env.REFRESH_TOKEN_TTL_IN_SEC) {
        nconf.set('security:jwt:refresh_token_ttl_in_sec', parseInt(process.env.REFRESH_TOKEN_TTL_IN_SEC))
    }

    // aws credentials info
    if(process.env.AWS_ACCESS_KEY_ID) {
        nconf.set('aws:access_key_id', process.env.AWS_ACCESS_KEY_ID)
    }
    if(process.env.AWS_SECRET_ACCESS_KEY) {
        nconf.set('aws:secret_access_key', process.env.AWS_SECRET_ACCESS_KEY)
    }
}

Config.prototype.get = function(key) {
    return nconf.get(key)
}

export default new Config()