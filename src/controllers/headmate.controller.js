import BadRequestError from '../errors/BadRequestError'

const headmateController = ({ headmateService, s3ImageUploadService, Headmate }) => {
  const createProfile = async (req, res, next) => {
    // const { id:uid } = req.auth
const uid = 1
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

  return {
    createProfile,
  }
}

export default headmateController
