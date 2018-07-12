const request = require('request');
// const request = require('../fakeRequestThing');

const baseURL = "http://todos.demo.rootpath.io"

class TodoWrapper {
  static getTodo(id, callback) {
    console.log(`Calling: ${baseURL}/todos/${id}`)
    request.get(`${baseURL}/todos/${id}`, {json: true}, function(err, res, body) {
      callback(res.statusCode, body)
    })
  }
}

module.exports = TodoWrapper
