import { v4 as uuidv4 } from 'uuid'
import BadRequestError from '../errors/BadRequestError'
import NotFoundError from '../errors/NotFoundError'

const headmateController = ({ config, headmateService, s3Service, Headmate }) => {
  const createProfile = async (req, res, next) => {
    const { id:uid } = req.auth
    // const uid = 1
    const fields = req.body
    const filename = fields.filename
    const filetype = fields.filetype

    // validate input
    if((filename && !filetype) || (!filename && filetype)) {  
      return next(new BadRequestError('filename or filetype is missing'))
    }

    let signedUrl = ''
    let profileImgFilename = ''
    try {
      if(filename && filetype) {
        // request s3 to generate presigned url
        profileImgFilename = `${uuidv4()}-${filename}`
        signedUrl = await s3Service.generatePreSignedPutUrl({
          bucket: config.get("aws:bucket_name"),
          key: `${uid}/${profileImgFilename}`,
          contentType: filetype,
          expiresIn: config.get('aws:presigned_url_expiration_time')
        })
      }
      
      if(profileImgFilename) {
        fields['profileImgFilename'] = profileImgFilename
      }
      await headmateService.createProfile({ params: fields, headmate: new Headmate(), uid })
    } catch(err) {
      return next(new BadRequestError('failed to generate presigned url from s3', { err }))
    }

    return res.status(201).json({
      signedUrl
    })
  }

  const getProfiles = async (req, res, next) => {
    const { id:uid } = req.auth
    // const uid = 1

    try {
      const resHeadmates = await headmateService.getProfilesByUid(uid)
      const headmates = resHeadmates.map(headmate => {
        let profileImageUrl = null
        if(headmate.profileImgFilename) {
          profileImageUrl = s3Service.generateProfileImageUrl({
            env: config.get("app:node_env"),
            devHttpProto: config.get("aws:localstack:http_proto"),
            prodHttpProto: config.get("aws:http_proto"),
            devHost: config.get("aws:localstack:host"),
            prodHost: config.get("aws:host"),
            devPort: config.get("aws:localstack:port"),
            bucketName: config.get("aws:bucket_name"),
            folder: uid,
            filename: headmate.profileImgFilename
          })
        }
        return {
          id: headmate.id,
          name: headmate.hName,
          gender: headmate.hGender,
          profileImageUrl: profileImageUrl || undefined,
          info: headmate.info || undefined,
          traits: headmate.traits || undefined
        }
      })

      if(!headmates || (headmates && headmates.length === 0)) {
        return next(new NotFoundError('headmates not found'))
      }

      return res.status(200).json({
        headmates
      })
    } catch(err) {
      return next(new BadRequestError('error while retrieving headmates'), { err })
    }
  }

  const getProfile = async (req, res, next) => {
    const { id:uid } = req.auth
    // const uid = 1
    const { headmateId } = req.params
    
    try {
      const headmate = await headmateService.getProfileById(headmateId)
      if(!headmate) {
        return next(new NotFoundError('headmate not found'))
      }

      const profileImgFilename = headmate.profileImgFilename || undefined
      let profileImageUrl = null
      if(profileImgFilename) {
        profileImageUrl = s3Service.generateProfileImageUrl({
          env: config.get("app:node_env"),
          devHttpProto: config.get("aws:localstack:http_proto"),
          prodHttpProto: config.get("aws:http_proto"),
          devHost: config.get("aws:localstack:host"),
          prodHost: config.get("aws:host"),
          devPort: config.get("aws:localstack:port"),
          bucketName: config.get("aws:bucket_name"),
          folder: uid,
          filename: headmate.profileImgFilename
        })
      }

      return res.status(200).json({
        id: headmate.id,
        name: headmate.hName,
        gender: headmate.hGender,
        profileImageUrl: profileImageUrl || undefined,
        info: headmate.info || undefined,
        traits: headmate.traits || undefined
      })
    } catch(err) {
      return next(new BadRequestError('error while retrieving headmate', { err }))
    }
  }

  const editProfile = async (req, res, next) => {
    const { id:uid } = req.auth
    // const uid = 1    
    const { headmateId } = req.params
    const fields = req.body

    try {
      if((fields.filename || fields.filetype) && (!(fields.filename && fields.filetype))) {
        return next(new BadRequestError('missing filename or file type'))
      }

      const { signedUrl } = await headmateService.updateProfileById(headmateId, uid, fields)

      return res.status(200).json({
        signedUrl
      })
    } catch(err) {
      return next(new BadRequestError('failed to update headmate profile', { err }))
    }
  }

  const deleteProfile = async (req, res, next) => {
    const { id:uid } = req.auth
    // const uid = 1    
    const { headmateId } = req.params

    try {
      await headmateService.deleteProfileById(headmateId, uid)
      return res.status(204).send()
    } catch(err) {
      return next(new NotFoundError('failed to delete headmate', { err }))
    }
  }

  return {
    createProfile,
    getProfiles,
    getProfile,
    editProfile,
    deleteProfile
  }
}

export default headmateController
