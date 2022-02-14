# Testing

Run `tools/test` to run all our test suites.  This command is
typically quite fast (5-10s, sometimes less), because it only rechecks
tests related to the files you've changed.

You can run all our tests with `tools/test --all`.  We run them this
way in our CI, e.g. when you send a PR.

To see all options, run `tools/test --help`.


## Unit tests: JS

`tools/test jest` runs our JS unit tests.  These are written using
[Jest](https://facebook.github.io/jest/).

To write a test, place a Javascript file with the `-test.js` suffix in the
`__tests__` directory inside of any subfolder of `/src`. The test will be
automatically picked up by the test runner.

The bulk of our JS code runs the same way on both iOS and Android, but
some of it conditions on the platform.  By default, `tools/test` runs
our Jest tests just once, picking the platform arbitrarily, to avoid
taking twice as long.  (See
[architecture/testing.md](../architecture/testing.md#platform-dependent-js)
for more discussion.)  If you're testing code that does depend on the
platform, use the `--all` or `--platform` option (see `tools/test --help`
for details) to be sure to exercise the case of the relevant platform,
or both of them.


### Test style guide

* New test files should be `@flow strict-local`, just like all our
  non-test code.

* Tests should use the `exampleData` module as needed to produce
  objects of type `User`, `Message`, `GlobalState`, and our many other
  data types.

  * This typically allows a test to write out only the details
    relevant to it -- far less tedious than writing out lots of other
    properties that the application code expects to exist, but the
    given test doesn't care about the specific value of.

  * If `exampleData` doesn't already have code to produce the type you
    need, add to it.

* Lots of existing tests aren't marked with `@flow`.  If making
  substantial changes to a test file, first bring it up to our normal
  typing standards: add `@flow strict-local` and make it pass Flow.

  * Most of these tests build example data by hand, and to stay at a
    bearable level of tedium they leave out a lot of properties the
    real non-test objects would have, causing type errors.

    To convert such code to well-typed code, you'll want to use
    `exampleData` as described above.

* We sometimes use [deepFreeze](https://github.com/substack/deep-freeze)
  when constructing fragments of Redux state.  This would throw an
  error, causing a test failure, if some of our code wrongly attempted
  to mutate that data.

  * Generally don't worry about doing this -- this isn't a very likely
    class of bug in the first place, plus our types should tell Flow
    not to allow this anyway.

  * But do use it in the `exampleData` module, and other shared places
    where we make test data for many tests to use, because it's cheap
    to do.


## Native-code tests

### Android

We have a small, nascent suite of unit tests for our Android-native
(Kotlin and Java) code.

`tools/test native` runs this suite, as well as building all the
Android code.

Tests are written in Kotlin, using [JUnit 4][] and the [Truth][] library.
If you're writing Android unit tests:
* Definitely read the short Android guide on [principles of testing][]
  -- it's a good writeup.
* Definitely also read the short Android guide on [local unit tests][],
  which has more concrete details about the APIs we use here.
  * (A "local unit test" is Android jargon for a genuine,
    self-contained unit test, specifically a test that doesn't require
    an Android device to run on.  All our unit tests are "local unit
    tests".)

Other sources which might be helpful to read or refer to:
* Truth docs: [homepage][Truth], [FAQ][truth-faq]
* JUnit docs: e.g. [Assertions javadoc][], [user guide][junit5-user-guide]
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


### iOS

We don't yet have native-code tests for iOS. We should try it out! A
good incremental step will be to at least check that the build
completes without errors.


## End-to-end tests

We don't currently have any automated end-to-end tests.

It would be nice to have some of these.  See [chat thread][pirlo-chat-thread]
on an experiment we did in this area in 2019.

[pirlo-chat-thread]: https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/end-to-end.20testing/near/788968


## Linting

We use [ESLint][] to catch many kinds of style issues, together with
[Prettier][] to maintain consistent formatting.

[ESLint]: https://eslint.org/
[Prettier]: https://prettier.io/

Our [lint config][] starts from the Airbnb guides
([for ES6][airbnb-base] and [for React][airbnb-react]),
with a number of specific changes.

[lint config]: ../../.eslintrc.yaml
[airbnb-base]: https://github.com/airbnb/javascript
[airbnb-react]: https://github.com/airbnb/javascript/tree/master/react

Prettier is an "opinionated" tool, which is a euphemism for having
virtually no configuration options; and unfortunately a few of its
unchangeable "opinions" are outright harmful.  So we use
[prettier-eslint][] to overrule it on those points; the details are in a
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

We use the [Flow][] type-checker on our JS code, and [flow-typed][]
for community-maintained type definitions for many dependencies.

If you're spending any significant time in our JS codebase, it's worth
taking a look through two key areas of the Flow docs:
* [Type Annotations][flow-doc-types], which describes much of the type
  system and the syntax.  (Not just that one page, but the whole guide
  it's part of: see the table of contents at the side or bottom, and
  in particular "Primitive Types", "Object Types", "Union Types", and
  "Utility Types".)
* [Type System][flow-doc-lang], which describes key concepts of the
  type system with less focus on the specific syntax.  (Again, not
  just the one page but the whole set of them, up through at least
  "Type Refinements".)

Flow is not among the world's best-documented software, though.  If
you look for something in its docs and don't find it there, ask about
it in chat in `#mobile` or `#mobile-team`.  If none of us know, some
good places we might look are:
* searching [its issues][flow-issues] (including closed issues);
  sometimes a valuable feature is undocumented and the best discussion
  of it is where someone offers it as a workaround in an issue thread.
* scanning this ["cheat sheet"][flow-cheat-sheet] maintained by
  another Flow user, which provides an index of features both
  documented and undocumented.

[Flow]: https://flow.org/
[flow-typed]: https://github.com/flowtype/flow-typed
[flow-doc-types]: https://flow.org/en/docs/types/
[flow-doc-lang]: https://flow.org/en/docs/lang/
[flow-issues]: https://github.com/facebook/flow/issues?q=is%3Aissue
[flow-cheat-sheet]: https://www.saltycrane.com/flow-type-cheat-sheet/latest/
