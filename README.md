# Simple Mocking Demo - JavaScript

## Callbacks

This is why we need callbacks. Explain what `setTimeout` does and the fact that it is async. Create a file and run it with `node timeout.js`.

```js
setTimeout(function() {
  console.log('first')
}, 100)
console.log('second')
```

Bump up the timeout so the pause is more obvious.

Now let's look at an example. We'll build a function called `capitalizeName` which takes a name and then does some asyncronous work - in this case calling the `setTimeout` function (which is async) and setting a `newName`. We'll try to return the `newName`.

```js
function capitalizeName(name) {
  // Do something asynchronous
  setTimeout(function() {
    newName = name.toUpperCase(); // Do some work
    console.log('Just defined newName')
  }, 4000)

  console.log('second')
  return newName
}

console.log(capitalizeName('danny'))
```

This will fail, because `newName` hasn't been assigned yet! The execution carried on but the async setTimeout function hadn't finished yet.

There's not much we can do about this. Instead of trying to log the return value (which will always be `undefined`), let's make our function work differently:

```js
capitalizeName('danny', function() { console.log('Hello')})
```

We're now passing a second parameter (which is an anonymous function) that just logs 'Hello'. This is a pattern you will have seen lots already (`describe` and `it` work like this, so does `express.get`).

**Question**: How do we make our `capitalizeName` function execute this anonymous function when it's done assigning the newName variable?
**Answer**: We need to adust the method signature to accept another argument. Inside our `capitalizeName` function, `myCallback` now _contains_ the function we passed in, just like the `name` _caontains_ the string `'danny'`. All we need to do now is call it after we've done the asynchronous work. We know how to call functions... just `()`!

```js
function capitalizeName(name, myCallback) {

  setTimeout(function() {
    newName = name.toUpperCase(); // Do some work
    myCallback()
  }, 4000)
}
```

This works as expected!

Next, we want to log the `newName` instead of just 'Hello'. In other words, we want to pass the `newName` from the innards of `capitalizeName` to the anonymous function.

We know how to pass things to functions already...

```js
function capitalizeName(name, myCallback) {

  setTimeout(function() {
    newName = name.toUpperCase(); // Do some work
    myCallback(newName)
  }, 4000)
}
```

Now that we're passing `newName` as an argument, we just need to use it in our anonymous function. We know how to use arguments in functions already too...

```js
capitalizeName('danny', function(fancyPantsName) { console.log(fancyPantsName)})
```

**Instructor**: Summarise callbacks.

# Mocking

## Making a call to an API

**Instructor**: Open the code in `TodoWrapper` and explain the async test for it. If possible, live-code the project in a new empty directory based on this code. Demonstrate it calling the API and the test passing.

What happens, though, if the API goes offline or someone removes the todo with ID168? We're buggered. Our tests fail **even though we're not trying to test the API**. We're just trying to test our `TodoWrapper.getTodo` method. Making API calls will also slow our test suite down.

How do we avoid this then?

Let's look at the `request` thing. This is provided by a npm package and has loads of features, but we're currently only using one function on it: `get()`.

Let's progressively build a fake version of this request thing that _behaves_ like a real one, at least as far as we need it to for this project. It's kinda like a **Stunt Double**.

```js
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
```

Now, we can just replace the `request = require('request')` with our fake request thing and our test will still pass. Even if we are offline. This demonstares what a **Stub** is.

**Instructor**: Show this working and swap between the fake and real things a few times.

This demonstrates one occasion when stubbing is useful. To elimenate external dependancies (on APIs, Database calls etc).

## Applying this to the Hotel Project

Here's the HotelCollection test for the `sortedHotels()` method. Look at all the setup we need to do...

```js
////// SETUP //////
c = new HotelCollection

hotel1 = new Hotel("Crowne Plaza", "Leeds")
hotel1.addReview(new Review(1, "Very Bad", "2018-01-01"))
hotel1.addReview(new Review(3, "Okay", "2018-01-01"))
c.addHotel(hotel1) // Avg Rating 2

hotel2 = new Hotel("Hilton Metropole", "London")
hotel2.addReview(new Review(5, "V Good", "2018-01-01"))
hotel2.addReview(new Review(5, "V Good", "2018-01-01"))
c.addHotel(hotel2) // Avg Rating 5

////// Execution //////
sorted = c.sortedHotels()

////// Verification //////
expect(sorted[0].rating()).to.eql(5)
expect(sorted.slice(-1)[0].rating()).to.eql(2)
```

We had to create a hotel collection (which is fine), then we had to create two hotels (which is fine), but we also had to create *FOUR* Reviews, even though the class we are testing knows nothing about Reviews at all (they are never mentioned in its source).

**Question**: Why do we need the reviews?
**Answer**: Because the Hotel uses them to calculate the average `rating()` for the hotel, which is needed for the `sort` function.

Applying what we've learned from the API stub, lets see what the `sort()` method **Actually needs to know about the hotels``.

1. Each hotel must respond to the `rating()` function with an integer.
2. That's it.

Let's make a fake hotel class to use in this test, which only exposes that method:

```js
class HotelStuntDouble {
  constructor(fakeRating) {
    this.fakeRating = fakeRating
  }
  rating() {
    return this.fakeRating
  }
}
```

Now let's use it in our test:

```js
hotel1 = new HotelStuntDouble(2)
c.addHotel(hotel1) // Avg Rating 2

hotel2 = new HotelStuntDouble(5)
c.addHotel(hotel2) // Avg Rating 5

sorted = c.sortedHotels()
expect(sorted[0].rating()).to.eql(5)
expect(sorted.slice(-1)[0].rating()).to.eql(2)
```

We could even go a step further and replace these fake hotels with plain JS objects:

```js
hotel1 = {rating: function(){ return 2 }}
c.addHotel(hotel1) // Avg Rating 2

hotel2 = {rating: function(){ return 5 }}
c.addHotel(hotel2) // Avg Rating 5

sorted = c.sortedHotels()
expect(sorted[0].rating()).to.eql(5)
expect(sorted.slice(-1)[0].rating()).to.eql(2)
```

By doing this, we remove the dependancy between the `HotelCollection` and `Review` in the tests. The downside is that we need to remember to update our _test double_ when we update our actual review (ie if we renamed `rating()` to `averageRating()`, for instance).

## Mocks vs Stubs

So far, we've looked at reasonably simple fake objects that return static values. These are usually called stubs or doubles. Mocks are a little bit more complicated, and can do stuff inside them.

It's also possible to use a library called [Sinon](http://sinonjs.org/) to override or add methods to existing objects.

```js
sinon = require('sinon')
////// SETUP //////
c = new HotelCollection

hotel1 = new Hotel("Crowne Plaza", "Leeds")
sinon.stub(hotel1, "rating").callsFake(function () { return 2 })
c.addHotel(hotel1) // Avg Rating 2

hotel2 = new Hotel("Hilton Metropole", "London")
sinon.stub(hotel1, "rating").callsFake(function () { return 5 })
c.addHotel(hotel2) // Avg Rating 5

////// Execution //////
sorted = c.sortedHotels()

////// Verification //////
expect(sorted[0].rating()).to.eql(5)
expect(sorted.slice(-1)[0].rating()).to.eql(2)
```

Sinon is a very powerful library that does a lot of stuff. You should look at the documentation if you're interested.

That's a brief intoroduction to Mocking and Stubbing, but it's a much bigger topic really.

## Summary

* Callbacks
* The concept of a Stub - it's a Stunt double
* Why we need mocks and stubs

## Further Reading

* https://semaphoreci.com/community/tutorials/best-practices-for-spies-stubs-and-mocks-in-sinon-js
* https://learn.co/lessons/javascript-mocks-and-stubs
* https://stackoverflow.com/questions/3459287/whats-the-difference-between-a-mock-stub
* https://www.harrymt.com/blog/2018/04/11/stubs-spies-and-mocks-in-js.html
* http://robdodson.me/mocking-requests-with-mocha-chai-and-sinon/
