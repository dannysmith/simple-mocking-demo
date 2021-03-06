const chai = require('chai')
const expect = chai.expect

const TodoWrapper = require('../lib/todoWrapper')

describe('TodoWrapper', function() {
  it('should get a single Todo', function(done) {
    let todoID = 87549
    let todoDescription = 'Practice falcony'

    TodoWrapper.getTodo(todoID, function(status, body) {
      console.log(`-------------------------`)
      console.log(`Status Code: ${status}`)
      console.log(`Description: ${body.title}`)
      console.log(`Due: ${body.due}`)
      console.log(`Notes: ${body.notes}`)
      console.log(`-------------------------`)

      expect(status).to.equal(200)
      expect(body.title).to.equal(todoDescription)
      done()
    })
  })
})
