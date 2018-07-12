function capitalizeName(name, myCallbackFunction) {
  setTimeout(function () {
    newName = name.toUpperCase()
    myCallbackFunction(newName)
  }, 4000)
  console.log('Hello')
}

capitalizeName('danny', function (myNewFancyName) {
  console.log(myNewFancyName)
})
