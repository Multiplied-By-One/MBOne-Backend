import { validate } from 'class-validator'
import getConnection from '../../../../src/db/connection'
import { Headmate } from '../../../../src/entities/Headmate'

const getHeadmateRepository = async () => {
  const connection = await getConnection()
  return {
    connection,
    repos: await connection.getRepository(Headmate),
    metadata: connection.getMetadata('Headmate')
  }
}


describe('Headmate entity', () => {
  let headmateParams = null

  beforeEach(() => {
    headmateParams = {
      userId: 1,
      hName: 'souseki1'
    }
  })

  describe('Test entity validation', () => {
    test('should be valid with valid mininmum headmate params', async () => {
      const expected = []

      await getHeadmateRepository()
      const headmate = new Headmate()
      headmate.userId = headmateParams.userId
      headmate.hName = headmateParams.hName

      const errors = await validate(headmate)
      expect(errors).toEqual(expected)
    })
  })
})
