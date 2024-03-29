import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import BadRequestError from '../errors/BadRequestError'
import { Order } from '../db/constants'
import DuplicateKeyError from '../errors/database/DuplicateKeyError'
import EntryToUpdateNotFoundError from '../errors/database/EntryToUpdateNotFoundError'

const headmateService = ({ config, entityValidate, s3Service, getConnection, Headmate }) => {
  const getHeadmateRepository = async () => {
    const connection = await getConnection()
    return {
      connection,
      repos: await connection.getRepository(Headmate),
      metadata: connection.getMetadata('Headmate')
    }
  }

/**
 * Creates a headmate profile
 * @param {Object} params - The headmate params for creating the profile.
 * @param {string} params.name - The name of the headmate.
 * @param {(M|F|U)} [params.gender] - headmate gender
 * @param {string} [params.profileImgFilename] - Profile image filename of headmate
 * @param {string} [params.info] - Additiional info input by headmate
 * @param {string} [params.traits] - (In json format) Traits the headmate descirbe himself
 * @param {number} [uid] - userId the headmate belongs to
 * @returns {Object} Created headmate object
 * 
 */
  const createProfile = async ({ params, uid }) => {
    const name = params.name
    const gender = params.gender || null
    const age = params.age || null
    const profileImgFilename = params.profileImgFilename || null
    const info = params.info || null
    const traits = params.traits ? JSON.stringify(params.traits) : null

    const {repos} = await getHeadmateRepository()

    // check if headmate name already exists
    const existingHeadmate = await repos.findOne({
      where: { userId: uid, hName: name },
      select: [ 'hName' ],
      skip: 0,
      take: 1
    })
    if(existingHeadmate) {
      throw new DuplicateKeyError(`headmate ${existingHeadmate.hName} already exists`)
    }

    const headmate = new Headmate()
    headmate.userId = uid
    headmate.hName = name
    headmate.hGender = gender
    headmate.hAge = age
    headmate.info = info
    headmate.traits = traits
    if(profileImgFilename) {
      headmate.profileImgFilename = profileImgFilename
    }
    
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

/**
 * Gets the list of headmate profiles under a specified user ID
 * @param {number} [uid] - userId the headmate belongs to
 * @returns {Array} - Array of headmate profiles
 * 
 */
  const getProfilesByUid = async (uid) => {
    const { repos } = await getHeadmateRepository()
    return repos.find({
      select: [ 'id', 'hName', 'hGender', 'hAge', 'profileImgFilename' ],
      where: {
        userId: uid
      },
      order: { hName: Order.Asc }
    })
  }

/**
 * Gets the a single headmate profile by its headmate id
 * @param {number} [headmateId] - userId the headmate belongs to
 * @returns {Object} - Headmate profile
 * 
 */
  const getProfileById = async (headmateId) => {
    const { repos } = await getHeadmateRepository()
    return repos.findOne({
      // select: [ 'id', 'hName AS name', 'hGender AS gender', 'hAge AS age', 'profileImgFilename AS profileImgFilename', 'info', 'traits' ],
      select: [ 'id', 'hName', 'hGender', 'hAge', 'profileImgFilename', 'info' ],
      where: {
        id: headmateId
      },      
    }) 
  }

/**
 * Update a headmate profile
 * @param {number} [headmateId] - Headmate ID
 * @param {number} [uid] - userId the headmate belongs to
 * @param {Object} inputFields - The headmate params for creating the profile.
 * @param {string} [inputFields.name] - The name of the headmate.
 * @param {(M|F|U)} [inputFields.gender] - headmate gender
 * @param {string} [inputFields.profileImgFilename] - Profile image filename of headmate
 * @param {string} [inputFields.info] - Additiional info input by headmate
 * @param {string} [inputFields.traits] - (In json format) Traits the headmate descirbe himself
 * @returns {Object} - Object containing the S3 presigned URL for the headmate profile image
 * @returns {string} - S3 presigned URL for the headmate profile image
 * 
 */
  const updateProfileById = async (headmateId, uid, inputFields) => {
    let fields = {}
    for (const [key, value] of Object.entries(inputFields)) {
      if(key === 'gender') {
        fields['hGender'] = value
      } else if(key === 'age') {
        fields['hAge'] = value
      } else if(key === 'name') {
        fields['hName'] = value
      } else {
        if(Array.isArray(value)) {
          fields[key] = _.clone(value)
        } else {
          fields[key] = value
        }
      }
    }

    // if field include imageUrl, request presigned url from S3
    let signedUrl = null
    let profileImgFilename = null
    const filename = fields.filename || null
    const filetype = fields.filetypes || null

    // request s3 to generate presigned url if client requests for profile image update
    if(filename) {
      profileImgFilename = `${uuidv4()}-${filename}`
      signedUrl = await s3Service.generatePreSignedPutUrl({
        bucket: config.get("aws:bucket_name"),
        key: `${uid}/${profileImgFilename}`,
        contentType: filetype,
        expiresIn: config.get('aws:presigned_url_expiration_time')
      })
      fields['profileImgFilename'] = profileImgFilename
    }

    // extract fields to update
    const { repos, metadata } = await getHeadmateRepository()
    const allowedFields = metadata.columns.map(col => col.propertyName)
    const updateParams = _.pick(fields, allowedFields)

    // ToDo: Find headmate to update
    const origHeadmate = await repos.findOne(headmateId) 
    if(!origHeadmate) {
      throw new EntryToUpdateNotFoundError('headmate to update does not exist')
    }
    
    // update headmate in db
    await repos.update(headmateId, updateParams)

    // delete previous profile image from s3 if profile has associated profile image
    if(profileImgFilename && origHeadmate.profileImgFilename) {
      s3Service.deleteObject({
        bucket: config.get("aws:bucket_name"),
        key: `${uid}/${origHeadmate.profileImgFilename}`
      })
    }

    return {
      signedUrl
    }
  }

/**
 * Deletes a headmate profile by headmate ID
 * @param {number} [headmateId] - Headmate ID
 * @param {number} [uid] - userId the headmate belongs to
 * 
 */
  const deleteProfileById = async (headmateId, uid) => {
    // find existing entry from db
    const { repos } = await getHeadmateRepository()
    const origHeadmate = await repos.findOne(headmateId)
    if(!origHeadmate) {
      throw new EntryToUpdateNotFoundError('headmate to delete not found')
    }
    const profileImgFilename = origHeadmate.profileImgFilename

    // remove entry from db
    await repos.delete(headmateId)

    // remove associated profile image from s3 if profile has associated profile image
    if(profileImgFilename) {
      s3Service.deleteObject({
        bucket: config.get("aws:bucket_name"),
        key: `${uid}/${profileImgFilename}`
      })
    }
  }

  return {
    createProfile,
    getProfilesByUid,
    getProfileById,
    updateProfileById,
    deleteProfileById
  }
}
 
export default headmateService;