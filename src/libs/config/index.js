import nconf from 'nconf'

function Config() {
    nconf.argv().env()
    const env = nconf.get(process.env.NODE_ENV) || 'dev'
    nconf.file(env, 'src/config/config.' + env + '.json')
    nconf.file('default', 'src/config/config.default.json')

    nconf.set('app:node_env', env)
    if(process.env.JWT_SECRET) {
        nconf.set('security:jwt:secret', process.env.JWT_SECRET)
    }
    if(process.env.ACCESS_TOKEN_TTL) {
        nconf.set('security:jwt:access_token_ttl', process.env.ACCESS_TOKEN_TTL)
    }
    if(process.env.ACCESS_TOKEN_TTL_IN_SEC) {
        nconf.set('security:jwt.access_token_ttl_in_sec', parseInt(process.env.ACCESS_TOKEN_TTL_IN_SEC))
    }
    if(process.env.REFRESH_TOKEN_TTL) {
        nconf.set('security:jwt:refresh_token_ttl', process.env.REFRESH_TOKEN_TTL)
    }
    if(process.env.REFRESH_TOKEN_TTL_IN_SEC) {
        nconf.set('security:jwt.refresh_token_ttl_in_sec', parseInt(process.env.REFRESH_TOKEN_TTL_IN_SEC))
    }
}

Config.prototype.get = function(key) {
    return nconf.get(key)
}

export default new Config()