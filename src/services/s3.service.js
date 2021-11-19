const s3Service = ({ config, s3Client, PutObjectCommand, DeleteObjectCommand, getSignedUrl }) => {
  const generatePreSignedPutUrl = async ({ bucket, key, contentType, urlExpiresIn }) => {  
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
  const deleteObject = async ({ bucket, key }) => {
    const deleteObjectInput = {
      Bucket: bucket,
      Key: key,
    }
    const command = new DeleteObjectCommand(deleteObjectInput)
    await s3Client.send(command)
  }

  return {
    generatePreSignedPutUrl,
    deleteObject
  }
}

export default s3Service