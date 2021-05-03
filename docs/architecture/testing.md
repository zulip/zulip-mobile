# Test architecture

See [howto/testing.md](../howto/testing.md) for most discussion of our
test suites.

This file has additional information on some areas, where it's too
detailed to fit on that page.


<div id="platform-dependent-js" />

## Platform-dependent JS code

The bulk of our JS code runs the same way on both iOS and Android, but
some of it depends on the platform:

* Some of our code checks `Platform.OS` and conditions on its value.
* Some of RN's own code (and in some RN-ecosystem libraries) is
  implemented with pairs of files `foo.ios.js` and `foo.android.js`
  rather than `foo.js`, and one or the other is used depending on the
  platform.
* Some of our code interacts with native modules not written in JS.
* The JS engine is different on each platform, so there can be
  differences in how the JavaScript language itself behaves.

In our Jest unit tests, we handle these like so:

* JS engine: Jest runs on Node, which is entirely different again from
  the JS engines we use in the actual app on either platform.  We just
  try to avoid situations where this difference affects our code's
  behavior.

* Native modules: For testing interactions with these, we need to mock
  them.  See `jest/jestSetup.js`.  Those mocks may in turn be
  conditioned on `Platform.OS`.

* Alternate source files: Jest can be configured to use the `.ios.js` files
  or the `.android.js` files; more on this below.

* `Platform.OS`: This is driven by a `Platform.ios.js` and
  `Platform.android.js` inside RN, so it automatically follows along
  with the configuration of which set of source files to use.

To control which platform-specific source files are used in our Jest
tests, pass `--platform` to `tools/test`: `--platform ios` or
`--platform android`, or `--platform both` to run the tests once each
way.  These control which Jest "projects" are run; see
`jest.config.js` for those.

Similarly, we have the option to write test files with names ending in
`-test.ios.js` or `-test.android.js`, rather than `-test.js`.  These
would then be run only when running the tests with `.ios.js` or
`.android.js` source files, respectively.  A pitfall of doing that,
though, would be that Flow will only check one version of a given
module.
