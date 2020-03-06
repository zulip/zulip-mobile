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
