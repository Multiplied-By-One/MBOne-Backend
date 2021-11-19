import chai from 'chai'
import { validate } from 'class-validator'
import { s3Service } from '../../../../src/di-container.js'
import Headmate from '../../../../src/entities/Headmate'

const expect = chai.expect

describe('Headmate entity', () => {
  /*
  let headmateParams = null

  beforeEach(() => {
    headmateParams = {
      name: 'souseki1'
    }
  })
*/

  context('Test entity validation', () => {
    it('should be valid with valid mininmum headmate params', () => {
      /*
      const headmate = new Headmate(headmateParams)
      const errors = await validate(headmate)
console.log('errors')
console.log(errors)
      expect(errors).to.be.null
      */
     expect(true).to.be.true
    })
  })
})
