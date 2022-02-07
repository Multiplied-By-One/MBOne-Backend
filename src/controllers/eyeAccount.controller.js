import NotFoundError from '../errors/NotFoundError'

export const eyeAccountController = ({ logger, eyeAccountService }) => {
  const getEyeAccount = async (req, res, next) => {
    const { eyeAccountId } = req.params
    const eyeAccount = await eyeAccountService.getEyeAccountById(eyeAccountId)
    
    if(!eyeAccount) {
      return next(new NotFoundError('eye account not found'))
    }

    return res.status(200).json(eyeAccount)
  }

  const createEyeAccount = async (req, res) => {
    const { id: uid } = req.auth
  }

  return {
    createEyeAccount,
    getEyeAccount
  }
}
