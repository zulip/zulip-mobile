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

Our "Pure Component Principle" says `render` is a pure function of props,
state, *and context*.  But `PureComponent` only checks for changes to props
and state, and skips re-render when just those two are unchanged.  Doesn't
that open up bugs if just `this.context` changes?

[Yes, it
would](https://reactjs.org/docs/legacy-context.html#updating-context).  For
this reason, when something provided in context is updated, we force the
entire React component tree under that point (in our usage of `context`,
this is nearly the entire tree) to re-render.  This means we use `context`
sparingly -- only for things where its benefit for code readability is very
large, and where updates are rare so we're OK with that global re-render.

In `StylesProvider`, for example, this is done with a `key`.

Relatedly, the `this.context` API we use is a legacy API.  Recent React
versions offer a [new context API](https://reactjs.org/docs/context.html)
that works much more like Redux and `connect`, above.

### The exception: `MessageList`

We have one React component that we wrote (beyond `connect` calls) that
deviates from the above design: `MessageList`.  This is the only
component that extends plain `Component` rather than `PureComponent`, and
the only component that implements `shouldComponentUpdate`.

In fact, `MessageList` does adhere to the Pure Component Principle -- its
`render` method is a pure function of `this.props` and `this.context`.  So
it could use `PureComponent`, but it doesn't -- instead we have a
`shouldComponentUpdate` that always returns `false`, so even when `props`
change quite materially (e.g., a new Zulip message arrives which should be
displayed) we don't have React re-render the component.

The specifics of why not, and what we do instead, deserve an architecture
doc of their own.  In brief: `render` returns a single React element, a
`WebView`; on new Zulip messages or other updates to the props, we choose
not to have React make a new `WebView` and render it in the usual way;
instead, we use `WebView#postMessage` to send information to the JS code
running inside the `WebView`, and that code updates the DOM accordingly.
