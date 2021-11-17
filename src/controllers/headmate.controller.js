import BadRequestError from '../errors/BadRequestError'
import NotFoundError from '../errors/NotFoundError'
import { ENV } from '../libs/constants'

const headmateController = ({ config, headmateService, s3ImageUploadService, Headmate }) => {
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
    try {
      if(filename && filetype) {
        signedUrl = await s3ImageUploadService.generatePreSignedPutUrl(filename, filetype, uid) // request s3 to generate presigned url
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

    try {
      const resHeadmates = await headmateService.getProfilesByUid(uid)
      const headmates = resHeadmates.map(headmate => {
        return {
          id: headmate.id,
          name: headmate.hName,
          gender: headmate.hGender,
          profileImgFilename: headmate.nProfileImgFilename || undefined
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
//    const { id:uid } = req.auth
const uid = 1
    const { headmateId } = req.params
    
    try {
      const headmate = await headmateService.getProfileById(headmateId)
      if(!headmate) {
        return next(new NotFoundError('headmate not found'))
      }

      const profileImgFilename = headmate.nProfileImgFilename || undefined
      let imageUrl = null
      if(profileImgFilename) {
        imageUrl = config.get("app:node_env") === ENV.DEV ?
        `${config.get("aws:localstack:http_proto")}://${config.get("aws:localstack:host")}:${config.get("aws:localstack:port")}/${config.get("aws:bucket_name")}/${profileImgFilename}` :
        `${config.get("aws:http_proto")}://${config.get("aws:host")}/${config.get("aws:bucket_name")}/${profileImgFilename}`
      }

      return res.status(200).json({
        id: headmate.id,
        name: headmate.hName,
        gender: headmate.hGender,
        imageUrl: imageUrl || undefined,
        info: headmate.info || undefined,
        traits: headmate.traits || undefined
      })
    } catch(err) {
      return next(new BadRequestError('error while retrieving headmate', { err }))
    }
  }

  return {
    createProfile,
    getProfiles,
    getProfile,
  }
}

export default headmateController
