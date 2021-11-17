import { v4 as uuidv4 } from 'uuid'

const s3ImageUploadService = ({ config, s3Client, PutObjectCommand, getSignedUrl }) => {
  const generatePreSignedPutUrl = async (fileName , fileType, uid) => {
    const randomStr = uuidv4()
    const putObjectParams = {
      Bucket: config.get("aws:bucket_name"),
      Key: `${uid}/${randomStr}-${fileName}`,
      ContentType: fileType,
    }
    const command = new PutObjectCommand(putObjectParams)
    
    return getSignedUrl(s3Client, command, { expiresIn: config.get('aws:presigned_url_expiration_time') })
  }

  return {
    generatePreSignedPutUrl
  }
}

export default s3ImageUploadService