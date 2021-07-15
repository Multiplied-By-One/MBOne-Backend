import serverless from 'serverless-http'
import bodyParser from 'body-parser'
import express from 'express'
import {bindRoutes} from './src/routes'
import {closeConnection} from './src/db/connection'
import {bindPassportToApp} from './src/auth/passport'
import cookieParser from 'cookie-parser';

const app = express()

// Setup body parsing, cookie session, and cookie parsing
app.use(bodyParser.json({ strict: false }))
app.use(cookieParser())

// Bind auth handlers
bindPassportToApp(app)

//Bind app routing
bindRoutes(app)

let handler =  serverless(app);
export async function request (event, context) {
  // you can do other things here
  const result = await handler(event, context)

  // Drop out database connection before closing connection
  await closeConnection()

  return result;
};