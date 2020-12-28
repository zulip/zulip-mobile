# React, etc.

This doc describes how we use React and closely related libraries like
Redux, and how we apply the architectural ideas associated with them.

Best read in combination with [the React
Guide](https://reactjs.org/docs/hello-world.html).

## Pure components

We use React plus Redux in a highly "pure" style, meaning that we observe
the following principle with few exceptions:

* (**Pure Component Principle**) Each React component we write gets its data
  entirely from its props, its `context`, and its own state.

Put another way:

* (**Pure Component Principle**, equivalently) Each `render` function is a
  *pure function* of `this.props`, `this.context`, and `this.state`.  In
  other words: any two calls with the same props, context, and state will
  give the same result.

This principle greatly simplifies reasoning about the application.  It's one
of the central powerful ideas in React as an architecture.

One important payoff from that ease of reasoning is the following
performance optimization.  Each React component that follows the Pure
Component Principle gets to inherit from `PureComponent`.  That means that
when a parent component re-renders, React will [check if this component's
props or state have
changed](https://reactjs.org/docs/optimizing-performance.html#avoid-reconciliation)
-- and if not, will skip `render` for this component and its entire subtree.
This is correct so long as `render` really is a pure function, which means
calling it again with the same props and state (what about context, you ask?
[see below](#context)) would just give the same result as last time.

### Immutability

There's actually another important assumption that `PureComponent` makes: it
only does a *shallow* equality check on the old and new `props` and the old
and new `state`, which just means a *reference equality* check for each
property of `props` and each property of `state`.  If that says things are
unchanged, it assumes they're really unchanged.

So to avoid forgetting to update when we should, we need that when these
values are reference-equal, that means they're really *equal* as values all
the way down.  That comes down to treating them as *immutable*:

* A value of a primitive type (string, number, boolean, null, undefined) is
  always treated as immutable.  (JS provides no way to mutate them.)

* An object or array is **treated as immutable** just if (a) we never modify
  it, only use it to make new objects or arrays; and (b) all its
  elements/values are treated as immutable.

So to keep things correct, we observe the following companion principles:

* (**Immutable Props Principle**) Every value passed as a prop to our React
  components is treated as immutable.

* (**Immutable Substate Principle**) Every value used as a property on the
  state of one of our React components (i.e., `this.state.foo` for every
  name `foo`) is treated as immutable.  (Of course, `this.state` itself is
  not!)

### Where state comes from: `connect`

Of course, lots of components in our app need to pull bits of data out of
the global state -- like the unread messages in a conversation, or the name
and avatar of another user.  How do we make that work with the Pure
Component Principle?

The answer is that our React component tree is *full of non-pure components*
-- we just *keep them carefully separate* from the components that are full
of a bunch of custom code we have to reason about.  The non-pure components
are created with Redux's `connect`, and the code of ours that's involved is
typically highly structured and pretty short, as in this example:

```
export default connect((state: GlobalState) => ({
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
}))(IconUnreadConversations);
```

This supplies values for `unreadHuddlesTotal` and `unreadPmsTotal`, which
then get passed as props to the nice pure `IconUnreadConversations`
component on the inside.

Because these `connect` calls are so highly structured, all will be well as
long as the code adheres to core Redux principles:

* The functions like `getUnreadHuddlesTotal` are good Redux selectors: pure
  functions of `state`, which is the global Redux state.

* The selectors are good Redux selectors: every value they return is treated
  as immutable (allowing us to maintain the Immutable Props Principle).  To
  guarantee this, the selectors typically rely on the reducers being good
  Redux reducers and treating every `state` value (and hence all its
  elements' elements, etc.) as immutable.

### Context

We're on board with the current API where possible; there's a
third-party library we use that isn't there yet.

#### Current Context API

We should use the [current Context
API](https://reactjs.org/docs/context.html) instead of the [legacy
one](https://reactjs.org/docs/legacy-context.html) in our own code,
and avoid libraries that haven't updated yet. The new API aggressively
ensures consumers will be updated (re-`render`ed) on context changes,
and the old one doesn't. From the [new API's
doc](https://reactjs.org/docs/context.html):

> All consumers that are descendants of a Provider will re-render
> whenever the Provider’s `value` prop changes.

It's so aggressive that there's a potential "gotcha" with the new API:
context consumers are the first occurrence of the following that we're
aware of (from the [doc on
`shouldComponentUpdate`](https://reactjs.org/docs/react-component.html#shouldcomponentupdate)):

> In the future React may treat `shouldComponentUpdate()` as a hint
> rather than a strict directive, and returning `false` may still
> result in a re-rendering of the component.

We gather this from the following (in the [new API's
doc](https://reactjs.org/docs/context.html)):

> The propagation from Provider to its descendant consumers (including
> [`.contextType`](https://reactjs.org/docs/context.html#classcontexttype)
> [...])
> is not subject to the shouldComponentUpdate method

Concretely, this means that our `MessageList` component updates
(re-`render`s) when the theme changes, since it's a `ThemeContext`
consumer, *even though its `shouldComponentUpdate` always returns
`false`*. So far, this hasn't been a problem because the UI doesn't
allow changing the theme while a `MessageList` is in the navigation
stack. If it were possible, it would be a concern: setting a short
interval to automatically toggle the theme, we see that the message
list's color scheme changes as we'd want it to, but we also see the
bad effects that `shouldComponentUpdate` returning `false` is meant to
prevent: losing the scroll position, mainly (but also, we expect,
discarding the image cache, etc.).

### The exception: `MessageList`

We have one React component that we wrote (beyond `connect` calls) that
deviates from the above design: `MessageList`.  This is the only
component that extends plain `Component` rather than `PureComponent`,
and it's the only component in which we implement
`shouldComponentUpdate`.

In fact, `MessageList` does adhere to the Pure Component Principle -- its
`render` method is a pure function of `this.props` and `this.context`.  So
it could use `PureComponent`, but it doesn't -- instead we have a
`shouldComponentUpdate` that always returns `false`, so even when `props`
change quite materially (e.g., a new Zulip message arrives which should be
displayed) we don't have React re-render the component. (See the note
on the current Context API, above, for a known case where our
`shouldComponentUpdate` is ignored.)

The specifics of why not, and what we do instead, deserve an architecture
doc of their own.  In brief: `render` returns a single React element, a
`WebView`; on new Zulip messages or other updates to the props, we choose
not to have React make a new `WebView` and render it in the usual way;
instead, we use `WebView#postMessage` to send information to the JS code
running inside the `WebView`, and that code updates the DOM accordingly.
