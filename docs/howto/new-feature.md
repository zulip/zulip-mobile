# Adding a new feature

This guide describes how to add support in the Zulip mobile app for
a new feature in Zulip.


## Adding to our API types and bindings

We describe in `src/api/` the Zulip server's API.  Any new feature
typically involves a change somewhere in the API, so the first step is
to update our API code to reflect that.

The server API is documented at https://zulip.com/api/.  (For a very
recently merged change, within the past week or so, you might find
https://chat.zulip.org/api/ has it while https://zulip.com/api/
doesn't.)  Changes are documented at
https://chat.zulip.org/api/changelog, so that's a good first place to
look, and it should link to the pages with the details.

Depending on the nature of the API change, places you might update
include:

 * `src/api/initialDataTypes.js` reflects the data returned by
   `/api/register-queue`, which is the initial snapshot of server data
   that we then keep up to date through the Zulip event system.

 * `src/api/eventTypes.js` reflects the data in those Zulip server
   events, returned by `/api/get-events`.
   * Some existing event types are described instead in
     `src/actionTypes.js`, so for changes to those you'll make the
     update there.
   * Any new event type should go in `eventTypes.js`, following the
     examples of the existing event types there.

 * `src/api/modelTypes.js` defines types such as `User`, `Message`,
   `Stream`, `Subscription`, that appear in the API and describe
   things in the Zulip data model.

 * Any new endpoint is reflected as a small file imported and
   re-exported in `src/api/index.js`.  See that file's imports for
   examples; see in particular `git log -p --full-diff src/api/index.js`
   for recent examples.


Some general points about updating the API code:

 * Each chunk of the API code should have a link to the relevant part
   of the docs.
   * For an endpoint binding (one of those functions re-exported by
     `src/api/index.js`), this means linking to the page for that
     endpoint.
   * For an event, this means linking to the relevant section in
     `/api/get-events`, like
     https://zulip.com/api/get-events#realm-update .  (When browsing
     that page, click on a heading to get a direct link to it.)
   * For the `/api/register-queue` response in `initialDataTypes.js`,
     there isn't a good way to do this.

 * Our API code describes the full range of behavior we expect from
   the different Zulip server versions we support.  This means:

   * The type should cover both the new API and the old API.  For
     example, when an object the server returns gains a new property,
     the property should be marked as optional.
     * This makes Flow able to check that our code handles both
       possibilities.

   * A comment should explain how the behavior differs by server
     version.
     * Include a mention of the Zulip feature level, as seen in
       `/api/changelog`.  This helps the reader find the change on
       that page; it's also what we'd use to condition, if necessary,
       on whether we expect the server to support the feature.
     * Include a marker like `TODO(server-x.y):`, referring to the
       first server version that has the new behavior.  We'll use this
       to find this condition and simplify it away in the future when
       that version (or a later one) becomes the oldest we support.


## Getting the data into Redux

### Making Redux actions

We turn Zulip server events into Redux actions in
`src/eventToAction.js`.  The action types are defined in
`src/actionTypes.js`.

 * For a new event type, add it to `GenericEventAction` in
   `actionTypes.js`, and add a `case` line to `eventToAction.js`
   following the example of `case EventTypes.restart:`.

 * For changes to an existing event type, check if any updates are
   needed in `actionTypes.js` and `eventToAction.js`.


Other parts of the API are reflected as Redux actions like so:

 * The initial data from `/api/register-queue` goes in a
   `REGISTER_COMPLETE` action (from `src/fetchActions.js`), which is
   transparent to any changes made to the type.

 * New endpoints generally are used only for making changes on the
   server, not for getting information back from it -- this is part
   how the Zulip event system maintains a consistent, up-to-date
   picture of the data on the server.  So they don't result in Redux
   actions.


### The Redux state type

The data we maintain that comes from the server is described by
`PerAccountState`, in `src/reduxTypes.js`.  So when that data changes,
you'll want to make an update there.

 * Typically this will be inside one of the existing subtrees of that
   type; `RealmState` is the home of miscellaneous data like
   realm/org-level settings.

 * A small amount of data is actually (pending issue #5006) not in
   `PerAccountState` but rather in the `Account` type, which is found
   under `state.accounts`.

 * The Redux state types reuse some of the API model types from
   `modelTypes.js`, like `Message` and `User` and `Stream`.  So if the
   updates you made in the API code were purely in `modelTypes.js`,
   then the state type may not need any further changes beyond that.
   (We'll still want a migration; see below.)


#### Redux state migrations

We store much of our Redux state persistently between runs of the app.
So whenever the type of the Redux state changes, we'll want a
migration to update any existing data, to ensure the data we end up
working with is actually of the specified type.

The migrations live in `src/storage/migrations.js`.  Add any new
migration to the end of the list there.

For most updates that reflect a change to the server API, the
migration will be simply `dropCache`.  This applies whenever the
change to the state type is purely in the parts of the state that
reflect data we can always re-fetch from the server.

We have unit tests for our migrations, in
`src/storage/__tests__/migrations-test.js`.  For a `dropCache`
migration, you'll make a small update there; for anything more
complex, add test cases as needed to cover it.  For examples,
see:
`git log --stat -p src/storage/migrations.js src/storage/__tests__/migrations-test.js`


### Reducers

Each subtree of our Redux state is maintained by a corresponding
sub-reducer, in a file `src/*/*Reducer.js` or `src/*/*Model.js`.
(The "model" way of organizing this code is more recent.)  These
are orchestrated by the overall reducer in `src/boot/reducers.js`.

 * When you've made a change to the state type, you'll typically also
   need to update the corresponding sub-reducer to maintain the new
   type.

 * When you've made a change to the `/api/register-queue` data in
   `initialDataTypes.js`, and hence to the contents of a
   `REGISTER_COMPLETE` action, you'll typically need to update one or
   several sub-reducers where they handle the affected data.  To see
   examples, use a search like: `git grep -A4 'case REGISTER_COMPLETE:`

 * When you've made a change to an existing action type -- in
   particular, when you've added a new event type or changed an
   existing one -- you'll typically need to update any reducers that
   handle that action type, and perhaps add a new case for it in other
   reducers.  To find existing references, try a search like
   `git grep -A4 'case EVENT_UPDATE_MESSAGE:'` (for events with their
   own legacy action types in `src/actionTypes.js`), or
   `git grep -A4 'case EventTypes.stream:'` (for events where we use
   `GenericEventAction`.)

 * For any change to reducers, be sure to add test cases to cover it.

 * If your change is purely to a type in `modelTypes.js`, like
   `Message` or `User` or `Subscription`, then the reducers might be
   transparent to the change and require no updates themselves.


### Selectors

For most new features, there's no need for a new selector function:

 * If the new feature adds (or changes) properties on a type like
   `Message` or `User` or `Subscription`, then code that consumes the
   data will get the message or user etc. from the state, and then
   refer to properties on it directly.

 * If the new feature is in settings, reflected in Redux by a new or
   changed property on `state.settings` or `state.realm`, then code
   that consumes the data will use the selector `getSettings` or
   `getRealm` respectively, and then refer to the property directly.


The main case in which a new selector or getter function is needed is
when the data from the server requires some interpretation that it's
useful to centralize, or when we maintain it in the form of a
nontrivial data structure so that we want to encapsulate an accessor
for that data structure.  For a simple example of the latter, see
`src/mute/muteModel.js` (and the definition of `MuteState` it
imports.)


## UI

### React

Most of our UI, we manage with React.  To get data from the state when
rendering a React component, use the functions in
`src/react-redux.js`.

 * Most often this means `useSelector`.  To see existing usage, try a
   search like `git grep 'useSelector\('`.

 * If the React component type you're working on is a class component,
   this may mean `connect` (and there will typically already be a call
   to that, which you'll add to.)


### The message list, in a WebView

The most important part of our UI that isn't in React is the message
list, which we show in a WebView.

 * The HTML for the message list is generated in `src/webview/html/`,
   for which the entry point is
   `src/webview/html/messageListElementHtml.js`.  This code is passed
   a message along with some other relevant data.

   * If you need here some data from the state that isn't in the
     message, then typically it should go into the `BackgroundData`
     type.

 * Your new feature may require some new CSS to style the new HTML.
   See `src/webview/static/base.css` and `src/webview/css/cssNight.js`.

 * If your new feature involves any interaction inside the message
   list, it may require some JS logic running inside the WebView.
   See `src/webview/js/js.js`.

   * That file is kind of giant.  New features should typically go in
     a separate file in that directory, imported from that file.

   * If you need an interaction inside the WebView to result in
     something happening outside of it, this is expressed with a
     "WebView outbound event".
     * See `src/webview/handleOutboundEvents.js` for where these are
       handled from the main RN environment outside the WebView, and
       for where the type `WebViewOutboundEvent` is defined.
     * Inside the WebView, call `sendMessage` to send such an event.
       See its call sites for examples.
     * Most of the call sites are inside our `click` (press) handler
       and our long-press handler.  If you're also responding to a
       press or long-press, add your new logic there, following the
       surrounding examples.


### Action sheets

The main example of a part of our UI that's neither in React nor the
message-list WebView (… other than the UI that's outside of React
Native entirely, which is basically just notifications) is action
sheets.  These are the menus we bring up when you long-press on many
surfaces in the app, offering ways to interact with a particular
stream, topic, message, etc.

Our action sheets are all constructed in `src/action-sheets/index.js`.
If you're adding a feature there that needs some data it doesn't
already have, then typically it should go into the `BackgroundData`
type.
