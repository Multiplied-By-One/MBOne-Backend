import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import express from 'express';
import {bindRoutes} from './src/routes';
import {bindPassportToApp} from './src/auth/passport';

const app = express()

app.use(bodyParser.json({ strict: false }));

// Bind auth handlers
bindPassportToApp(app)

//Bind app routing
bindRoutes(app)

let handler =  serverless(app);
export async function request (event, context) {
  // you can do other things here
  const result = await handler(event, context);
  // and here
  return result;
};