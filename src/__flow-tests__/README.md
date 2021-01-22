# Type-tests

This directory contains tests of our types.

This code never gets run, but it does get type-checked.  We use it to
test that some of our more complex types behave in the way we expect.

Mostly this means checking that using the types in certain ways that
should give errors, does give errors.  (Checking that things that
should be OK, are OK, is generally well covered by where we simply use
the types, in our main app code.)

The key tool for confirming that something does give an error is to
write `$FlowExpectedError`.  As far as Flow is concerned (see [Flow
docs][https://flow.org/en/docs/errors/]), this has exactly the same
effect as `$FlowFixMe`: it suppresses the error, and conversely it
means that if we ever stop getting an error at that spot, we start
getting a warning about the unused suppression.

The difference between `$FlowFixMe` and `$FlowExpectedError` is purely
for the human reader: the latter communicates that the error is
intended, not something we want to get rid of, and in particular that
if it ever goes away then that's itself a problem which we should
investigate.
