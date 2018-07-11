class FakeRequestThing {
  static get(string, options, callbackFunction) {
    let fakeRes = {
      statusCode: 200
    }

    let fakeBody = {
      id: 168,
      title: "fix website",
      due: new Date("2020-06-06"),
      notes: "!do this!"
    }
    callbackFunction(undefined, fakeRes, fakeBody)
  }
}

module.exports = FakeRequestThing
