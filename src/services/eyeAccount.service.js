export const eyeAccountService = ({getConnection, EyeAccount}) => {
  const getEyeAccountRepository = async () => {
    const connection = await getConnection()
    return {
      connection,
      repos: await connection.getRepository(EyeAccount),
      metadata: connection.getMetadata('EyeAccount')
    }
  }

  /**
   * Fetches a single Eye account with a given ID  
   * @param {number} [eyeAccountId] - userId the headmate belongs to
   * @returns {Object} - Eye account
   * 
   */
  const getEyeAccountById = async (eyeAccountId) => {
    const { repos } = await getEyeAccountRepository()
    return repos.findOne({
      select: [ 'id', 'userId', 'headmateId', 'eyeName', 'hFont', 'hFontsize', 'mFont', 'mFontsize', 'pWord'],
      where: {
        id: eyeAccountId
      },      
    }) 
  }

  return {
    getEyeAccountById
  }
}

export default eyeAccountService

