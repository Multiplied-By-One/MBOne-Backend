import serverless from 'serverless-http'
import bodyParser from 'body-parser'
import express from 'express'
import {bindRoutes} from './src/routes'
import {closeConnection} from './src/db/connection'
import {bindPassportToApp} from './src/auth/passport'
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session'

const app = express()

// Setup body parsing, cookie session, and cookie parsing
app.use(bodyParser.json({ strict: false }))
const cookieSessionOptions = {
  name: 'session',
  keys: [ process.env.COOKIE_SESSION_KEY1, process.env.COOKIE_SESSION_KEY2 ],
  secure: false,
  httpOnly: true,
}
if(process.env.NODE_ENV === 'prod') {
  cookieSessionOptions.secure = true
}
app.use(cookieSession(cookieSessionOptions))
app.use(cookieParser())

// Bind auth handlers
bindPassportToApp(app)

//Bind app routing
bindRoutes(app)

// custom default error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    err: 'InternalErr',
    message: 'Internal error'
  })
})

let handler =  serverless(app);
export async function request (event, context) {
  // you can do other things here
  const result = await handler(event, context)

  // Drop out database connection before closing connection
  await closeConnection()

  return result;
};