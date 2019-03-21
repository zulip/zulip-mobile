# Testing

Run `tools/test` to run all our test suites.  This command is
typically quite fast (5-10s, sometimes less), because it only rechecks
tests related to the files you've changed.

You can run all our tests with `tools/test --full`.

## Unit tests: JS

`tools/test jest` runs the unit test suite.

Our tests are written using [Jest](https://facebook.github.io/jest/).

To write a test, place a Javascript file with the `-test.js` suffix in the
`__tests__` directory inside of any subfolder of `/src`. The test will be
automatically picked up by the test runner.

Use [deepFreeze](https://github.com/substack/deep-freeze) to test functions which access redux state. This won't allow the object to be mutated and hence will eventually fail tests in case of mutation.

## Unit tests: Android

We have a small, nascent suite of unit tests for our Android-native
(Kotlin and Java) code.

`tools/test android` runs this suite, as well as building all the
Android code.

Tests are written in Kotlin, using [JUnit 4] and the [Truth] library.
If you're writing Android unit tests:
* Definitely read the short Android guide on [principles of testing]
  -- it's a good writeup.
* Definitely also read the short Android guide on [local unit tests],
  which has more concrete details about the APIs we use here.
* Potentially also helpful:
  * Truth docs: [homepage][Truth], [FAQ][truth-faq]
  * JUnit docs: e.g. [Assertions javadoc], [user guide][junit5-user-guide]

[JUnit 4]: https://junit.org/junit4/
[Assertions javadoc]: https://junit.org/junit5/docs/current/api/org/junit/jupiter/api/Assertions.html
[junit5-user-guide]: https://junit.org/junit5/docs/current/user-guide/
[Truth]: https://google.github.io/truth/
[truth-faq]: https://google.github.io/truth/faq
[principles of testing]: https://developer.android.com/training/testing/fundamentals
[local unit tests]: https://developer.android.com/training/testing/unit-testing/local-unit-tests


## Functional tests
Functional tests have not been set up. We plan to use [Appium](http://appium.io/).

## Linting
`tools/test lint` checks your changes against our linting rules. We're using
the AirBnB [ES6](https://github.com/airbnb/javascript) and
[React](https://github.com/airbnb/javascript/tree/master/react) style guides.

## Type checking with Flow
Use [Flow](https://flowtype.org/) and [flow-typed](https://github.com/flowtype/flow-typed) to find and prevent type related issues.
