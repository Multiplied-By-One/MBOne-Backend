import BadRequestError from '../errors/BadRequestError'
// import getConnection from '../db/connection'

const headmateService = ({ entityValidate, getConnection, Headmate }) => {
  const getHeadmateRepository = async () => {
    let connection = await getConnection();
    return connection.getRepository(Headmate);
  }

  const createProfile = async ({ params, uid }) => {
    const name = params.name
    const gender = params.gender || null
    const age = params.age || null
    const profileImgUrl = params.filename && params.filetype ? params.filename : null

    await getHeadmateRepository()
    const headmate = new Headmate()

    headmate.userId = uid
    headmate.hName = name
    headmate.hGender = gender
    headmate.hAge = age
    headmate.nProfileImgFilename = profileImgUrl

    // validate entity
    const errors = await entityValidate(headmate)
    if(errors && errors.length > 0) {    
      throw new BadRequestError('Headmate entity validation failed', {
        err: {
          entityErr: errors
        }
      })
    }

    await headmate.save()

    return headmate
  }

  return {
    createProfile,
  }
}
 
export default headmateService;