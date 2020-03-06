# Miscellaneous tips

This file exists as a place to put short writeups of miscellaneous
information we don't have a better place to put, that hopefully makes
it a bit easier to come back and find the information than it would be
someplace like a GitHub comment thread.

Generally these should be about things outside of Zulip itself -- if
the information is about Zulip, then it should go in a comment on the
relevant area of code, or in another form of our documentation.  This
file is for when the relevant system is maintained by other people and
we can't just add to its docs :-)


## Flow's `empty` means a magical shapeshifter

Sometimes `empty` appears as the type Flow has inferred for something.

This is usually a bad sign.  The type Flow calls `empty` is a subtype
of every possible type: in other words, a value of that type is a
magical shapeshifter value that can be whatever you need it to be.

In real life, of course, there is no value that can be used correctly
both as type `null`, say, and `number`.  That means there is no value
of type `empty` -- the set of values of that type is the empty set,
hence the name.

To understand this from the other direction, you could start by
defining `empty` as the type that contains no values at all.  Then if
you take something of type `empty` and, say, pass it to a function,
any function at all that accepts an argument, then Flow will accept
that as valid.  After all, because there *are no* values of type
`empty`, it's a true fact that *every* value of type `empty` is a
valid value of whatever type it is that the function expected.  In
other words, `empty` by this definition is indeed a subtype of every
type.

The net result is that if a value is supposed to have type `empty`, it
had better be true that the value really can't exist, i.e. that
whatever code thinks it has such a value is in fact unreachable.

Sometimes this is useful, for explicitly saying exactly that.  This is
what our `ensureUnreachable` function does.

When unexpected, it's a sign of trouble, and often causes type errors
elsewhere to be covered up:

* Many bugs in Flow have had as a symptom that some type gets inferred
  as `empty`.  See for example our commit e6868d833.

* When a libdef for some library API is a step or two less vague than
  calling everything `any`, it will sometimes give things a type of
  `empty`.

  See for example our commit 36ae1b91e: Flow would accept a call to
  `Array.prototype.slice` on a non-`Array` (like an
  `HTMLCollection`)... but thought that would return an array of
  magical shapeshifters, i.e. `Array<empty>`.

Further reading:
* Flow docs... unfortunately don't seem to actually define
  `empty`. :'-( It's mentioned in passing in a couple of spots:
  [here](https://flow.org/en/docs/cli/coverage/#design-space-) and
  [here](https://flow.org/en/docs/react/redux/#typing-redux-reducers-).


## React + Flow: Props in `defaultProps` get to be non-optional in `Props`

When a value for a prop is supplied in `defaultProps`, that prop
should be non-optional in `Props`.

See [documentation from Flow
upstream](https://flow.org/en/docs/react/components/#toc-using-default-props).

Here's another way to describe what's happening.  The context is that
there's really two versions of what the type of "the props of this
component" are:

* the version that applies to callers;
* the version that applies to the implementation, after `defaultProps`
  has had its say.

And then the rule is that `Props` describes the latter, inward-facing
version of "the props of this component".

(Or to speak precisely: `Props` is the name we conventionally give to
the type we pass as a type argument to `Component` or `PureComponent`.
The rule is that that type argument describes the inward-facing
version of "the props of this component".)

Flow then automatically looks at `defaultProps` and uses it to figure
out the former, outward-facing version.

Further reading:
* This is an example of how Flow has special built-in support for
  understanding how the types of React components interact.  Upstream
  docs for that support are in a series of pages at
  [here](https://flow.org/en/docs/react/), with a detailed reference
  [here](https://flow.org/en/docs/react/types/).
* Original context: [#3901
  (comment)](https://github.com/zulip/zulip-mobile/pull/3901#discussion_r388019316).
