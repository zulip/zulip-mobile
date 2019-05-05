# Testing

Run `tools/test` to run all our test suites.  This command is
typically quite fast (5-10s, sometimes less), because it only rechecks
tests related to the files you've changed.

You can run all our tests with `tools/test --full`.

To see all options, run `tools/test --help`.


## Unit tests: JS

`tools/test jest` runs the unit test suite.

Our tests are written using [Jest](https://facebook.github.io/jest/).

To write a test, place a Javascript file with the `-test.js` suffix in the
`__tests__` directory inside of any subfolder of `/src`. The test will be
automatically picked up by the test runner.

Use [deepFreeze](https://github.com/substack/deep-freeze) to test
functions which access redux state. This won't allow the object to be
mutated and hence will eventually fail tests in case of mutation.


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
  * (A "local unit test" is Android jargon for a genuine,
    self-contained unit test, specifically a test that doesn't require
    an Android device to run on.  All our unit tests are "local unit
    tests".)

Other sources which might be helpful to read or refer to:
* Truth docs: [homepage][Truth], [FAQ][truth-faq]
* JUnit docs: e.g. [Assertions javadoc], [user guide][junit5-user-guide]
* Good blog-style articles from "Baeldung":
  on [JUnit in Kotlin][baeldung-junit-kotlin]
  and on [Truth][baeldung-truth].

[JUnit 4]: https://junit.org/junit4/
[Assertions javadoc]: https://junit.org/junit5/docs/current/api/org/junit/jupiter/api/Assertions.html
[junit5-user-guide]: https://junit.org/junit5/docs/current/user-guide/
[Truth]: https://google.github.io/truth/
[truth-faq]: https://google.github.io/truth/faq
[principles of testing]: https://developer.android.com/training/testing/fundamentals
[local unit tests]: https://developer.android.com/training/testing/unit-testing/local-unit-tests
[baeldung-junit-kotlin]: https://www.baeldung.com/junit-5-kotlin
[baeldung-truth]: https://www.baeldung.com/google-truth


## Functional tests

Functional tests have not been set up. We plan to use [Appium](http://appium.io/).


## Linting

We use [ESLint] to catch many kinds of style issues, together with
[Prettier] to maintain consistent formatting.

[ESLint]: https://eslint.org/
[Prettier]: https://prettier.io/

Our [lint config] starts from the Airbnb guides
([for ES6][airbnb-base] and [for React][airbnb-react]),
with a number of specific changes.

[lint config]: ../../.eslintrc.yaml
[airbnb-base]: https://github.com/airbnb/javascript
[airbnb-react]: https://github.com/airbnb/javascript/tree/master/react

Prettier is an "opinionated" tool, which is a euphemism for having
virtually no configuration options; and unfortunately a few of its
unchangeable "opinions" are outright harmful.  So we use
[prettier-eslint] to overrule it on those points; the details are in a
[small, formatting-only ESLint config file][formatting.eslintrc].

[prettier-eslint]: https://github.com/prettier/prettier-eslint
[formatting.eslintrc]: ../../tools/formatting.eslintrc.yaml

For proper results, always run ESLint or Prettier through our
canonical interfaces:
* `tools/test` (or `tools/test lint prettier` for these steps alone);
* `tools/test --fix`, to actually modify the files to fix issues where
  possible; or
* in your editor, with our [recommended editor config](editor.md).

If you find another interface more convenient, please send a PR and/or
mention it in chat!  We'll be interested to learn about it, and to see
what we can do to support it.


## Type checking with Flow

We use [Flow](https://flowtype.org/) and
[flow-typed](https://github.com/flowtype/flow-typed) to find and
prevent type related issues.
