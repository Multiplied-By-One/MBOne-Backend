import { S3Client } from '@aws-sdk/client-s3'
import { ENV } from './constants'
import config from './config'


const credentials = {
  accessKeyId: config.get("aws:access_key_id"),
  secretAccessKey: config.get("aws:secret_access_key"),
}
const clientParams = {
  credentials,
  endpoint: config.get('app:node_env') === ENV.DEV ? `http://${config.get("aws:localstack:host")}:${config.get("aws:localstack:port")}` : undefined,
  region: config.get('aws:region'),
  forcePathStyle: config.get('app:node_env') === ENV.DEV ? true : false,
}

export default new S3Client(clientParams)
