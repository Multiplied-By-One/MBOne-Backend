import { ENV } from '../libs/constants'

const s3Service = ({ s3Client, PutObjectCommand, DeleteObjectCommand, getSignedUrl }) => {
/**
 * Generates a profile image URL
 * @param {Object} params - Params for generate the profile image URL
 * @param {string} params.env - Environment variable representing the current platofrm (e.g. dev, testing, production)
 * @param {(http|https)} params.devHttpProto - http protocol (http or https) of dev environment
 * @param {(http|https)} params.prodHttpProto - http protocol (http or https) of production environment
 * @param {string} params.devHost - hostname of the profile image URL on localstack
 * @param {string} params.prodHost - hostname of the profile image URL on AWS S3
 * @param {number} params.devPort - port number of localstack
 * @param {string} params.bucketName - bucketname of the profile image URL
 * @param {string} params.folder - folder name of the profile image URL
 * @param {string} params.filename - folder name of the profile image URL
 * @returns {string} - profile image URL on localstack or AWS S3
 * 
 */
  const generateProfileImageUrl = ({
    env,
    devHttpProto,
    prodHttpProto,
    devHost,
    prodHost,
    devPort,
    bucketName,
    folder,
    filename
  }) => {
    return env === ENV.DEV ?
    `${devHttpProto}://${devHost}:${devPort}/${bucketName}/${folder}/${filename}` :
    `${prodHttpProto}://${prodHost}/${bucketName}/${folder}/${filename}`
  }

/**
 * Relays request to AWS S3 for generated presigned URL for uploading file to S3
 * @param {Object} params - Params for requesting presigned URL
 * @param {string} params.bucket - bucketname of the object to be uploaded to
 * @param {string} params.key - S3 key of the object to be uploaded to (uid/filename)
 * @param {string} params.contentType - Content type of the object to be uploaded
 * @param {number} [params.urlExpiresIn=60] - Expiry time of the presigned URL in seconds
 * @returns {string} - presigned URL returned from AWS S3 or localstack
 * 
 */
  const generatePreSignedPutUrl = async ({ bucket, key, contentType, urlExpiresIn=60 }) => {  
    const putObjectParams = {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }
    const command = new PutObjectCommand(putObjectParams)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: urlExpiresIn })

    return presignedUrl
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deleteobjectcommand.html
/**
 * 
 * @param {Object} params - Params for deleting an object on AWS S3 or localstack
 * @param {string} params.bucket - bucket name of the object to be deleted
 * @param {string} params.key - S3 key of the object to be deleted (uid/filename)
 * @param {string} params.contentType - Content type of the file to be uploaded
 * @param {number} [params.urlExpiresIn=60] - Expiry time of the presigned URL in seconds
 * 
 */
  const deleteObject = async ({ bucket, key }) => {
    const deleteObjectInput = {
      Bucket: bucket,
      Key: key,
    }
    const command = new DeleteObjectCommand(deleteObjectInput)
    await s3Client.send(command)
  }

  return {
    generateProfileImageUrl,
    generatePreSignedPutUrl,
    deleteObject
  }
}

export default s3Service