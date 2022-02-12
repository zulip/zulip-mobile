# Architecture

## Data and state: Redux

**zulip-mobile** uses Redux for state management and data flow. Please
read the [Redux docs](http://redux.js.org) for more information on the
Redux architecture and terminology (such as actions, reducers, and
stores).  Briefly:
* Global app state is stored in a central place, the Redux store.
* At any time, the Redux state is a large tree of objects, all
  treated as immutable.
* To make changes, the whole state is replaced with a new state
  object.  (This sounds extravagant but isn't: because everything's
  immutable, the old and new states can share all the sub-objects that
  didn't change.)

See [our React/Redux architecture doc](architecture/react.md) for a more
detailed explanation as applied to our app.

We use selectors to extract (or select) data from the Redux store. [Learn more
about the concept of selectors](http://redux.js.org/docs/recipes/ComputingDerivedData.html)
Some selectors are memoized, using [Reselect](https://github.com/reactjs/reselect).

For the structure of our Redux state tree, see `GlobalState` in
[`src/reduxTypes.js`](../src/reduxTypes.js), and follow interesting
types to their definitions: `Message`, `User`, `Account` and many
others have detailed jsdoc comments.

For large parts of the Redux state tree, we persist the data to the
app's local storage on the device, using
[`redux-persist`][redux-persist].  See `storeKeys` and `cacheKeys` in
[`src/boot/store.js`](../src/boot/store.js) for which parts of the
tree we persist, which we don't, and why.  See also the logic handling
`REHYDRATE` actions in a few reducers, for additional wrinkles on the
persisted data.

[redux-persist]: https://github.com/rt2zz/redux-persist
