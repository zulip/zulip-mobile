# Testing

Run `tools/test` to run all our test suites.  This command is
typically quite fast (5-10s, sometimes less), because it only rechecks
tests related to the files you've changed.

You can run all our tests with `tools/test --full`.

## Unit tests
`tools/test jest` runs the unit test suite.

Our tests are written using [Jest](https://facebook.github.io/jest/).

To write a test, place a Javascript file with the `-test.js` suffix in the
`__tests__` directory inside of any subfolder of `/src`. The test will be
automatically picked up by the test runner.

Use [deepFreeze](https://github.com/substack/deep-freeze) to test functions which access redux state. This won't allow the object to be mutated and hence will eventually fail tests in case of mutation.

## Functional tests
Functional tests have not been set up. We plan to use [Appium](http://appium.io/).

## Linting
`tools/test lint` checks your changes against our linting rules. We're using
the AirBnB [ES6](https://github.com/airbnb/javascript) and
[React](https://github.com/airbnb/javascript/tree/master/react) style guides.

## Type checking with Flow
Use [Flow](https://flowtype.org/) and [flow-typed](https://github.com/flowtype/flow-typed) to find and prevent type related issues.
