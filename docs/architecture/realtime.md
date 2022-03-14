# Real-time Updates / Events

NB: At the time this design doc is written, it describes a design that
the existing app doesn't yet consistently follow.

## Background / Introduction

An essential part of any chat app is getting updates in real time.

An essential part of any high-quality mobile app where the user
interacts with a server (*) is to remember information it's learned
from the server so it doesn't have to keep re-asking, while at the
same time taking care not to show the user information that's out of
date.

This is hard; even flagship apps from major tech companies often fall
short.  Usually this is by forgetting information (that the app knew
just a few seconds ago! but now it's sitting there with a loading
animation, argh, so frustrating), which is much less bad than the
opposite failure of showing information that's already wrong.

(*) Or other users, or anything else separated over a network.  It'd
be only a small overstatement to shorten this to "any high-quality
mobile app"; the exceptions are apps that rely only on the device's
own storage and sensors, like a camera app, or a reference app where
the data is all included with the app or is downloaded once and never
changes.

Fundamentally this is a challenge faced by any distributed system, and
complex modern webapps increasingly have to deal with it too.  The
challenge is typically more severe for mobile apps because they're
often on poor network connections -- high-latency (so blocking on a
request to the server makes a longer delay), low-bandwidth (so
downloading a lot of data pre-emptively is expensive), and flaky (so
it's often impossible to just stay up to date) -- and because they run
on memory- and power-constrained devices where the system is ruthless
in shutting them down when the user's attention goes elsewhere.

The Zulip server provides a sophisticated architecture -- the ["events
system"][subsystem-events] -- for a client to handle the problem of
remembering data while knowing when it's out of date, in a way that
provides updates in real time.  The Zulip webapp relies heavily on
this architecture, to great success.

The Zulip mobile app has often suffered from bugs both where it stops
getting real-time updates and where it shows data that's long out of
date, as well as the less-severe kind where it unnecessarily forgets
information it knew.  This is related to the fact that the mobile app
doesn't (as of this writing, in 2018-09) take good advantage of the
architecture of Zulip's events system.

This doc describes a way of thinking about how to structure a client
for an events system like Zulip's.  The [events system
doc][subsystem-events] in the Zulip developer documentation is an
important companion doc (focused on the server implementation) and
should be read for a full understanding of the system, though this doc
aims to explain the necessary points along the way to be a
self-contained description from the client perspective.

[subsystem-events]: https://zulip.readthedocs.io/en/latest/subsystems/events-system.html

## Update Machines

(NB: The exact details of this description don't correspond to the
code of any existing client, though I (Greg) believe it corresponds
conceptually with how the Zulip webapp works.  The mobile app
currently has some major discrepancies from this model; those
generally correspond with major classes of bugs in the mobile app.)

The basic structure of a client in the Zulip event-system architecture
is centered on what we'll call an **update machine**.  An update
machine consists of:

* some *application-level state*; for example, this might include the
  list of other users in the Zulip organization, the list of streams,
  or information about some messages.
* some update metadata, of which the most important is a state machine
  with two states: **stale** and **live**.

When the update machine is *stale*, the other update metadata is
simple:
* a timestamp of the last successful update from the server.

When in a stale state, the update machine retains the last
application-level state it had -- but the application must interpret
this information with caution.

When the update machine is *live*, the update metadata is more
interesting:
* an *event queue ID* and *last event ID*, referring to an event queue
  on the server; together we call these an *event finger*, like a
  finger holding a place in a book.
* a timestamp of the last attempted update from the server, and
  another of the last successful update
* perhaps a count of the number of failed update attempts in a row, or
  other data to guide backoff on repeated attempts
* when the app is in the foreground, the app maintains an *open TCP
  connection* with the server in which it [long-polls][long-polling]
  for updates, using the event finger
  * here, "in the foreground" is in the context of a mobile app,
    identifying the main context in which mobile platforms expect an
    app to be doing work; more generally, the condition is "where
    possible and appropriate"
* when in the background (more generally, when not long-polling),
  the app might periodically poll for updates

[long-polling]: https://en.wikipedia.org/wiki/Push_technology#Long_polling

### Moving between states

When *stale*, the update machine seeks to move to live.  To do this,
it makes [a `/register` API request][api-register] to the server,
which returns two things:

* A snapshot (the "initial state") of the relevant application-level
  state.
* An event finger -- the ID of a newly-created event queue, and a last
  event ID, to be used for polling at the [`/events` endpoint][api-events].

See [section "The initial data fetch"][se-initial-fetch] of the events
system doc for design background and some details on the server-side
implementation.

The key aspect of the design is this: the snapshot is *atomic* with
the finger.  That means that until an event shows up that the event
finger points to, the initial state is the 100% up-to-date version of
the state as seen by the server; and whenever an event does happen,
once we poll using the finger, get the event, and apply it to our
local version of the state, we'll be back to 100% up to date with the
state as seen by the server.

[api-register]: https://zulip.com/api/register-queue
[api-events]: https://zulip.com/api/get-events
[se-initial-fetch]: https://zulip.readthedocs.io/en/latest/subsystems/events-system.html#the-initial-data-fetch

So, when the update machine gets that `/register` response, it moves
to the following state:
* Live!
* Application-level state: the "initial state" snapshot from the
  response.
* Event finger: from response.
* Timestamps etc.: the obvious/boring now, null, etc.

When the update machine is *live*:
* If there isn't an open long-poll request, it makes one,
  [at `/events`][api-events].
* When an `/events` poll request returns successfully, we take the
  following steps:
  * We apply the received events to the application-level state: for
    example, we might add a new user, update or delete some user's
    info, mark some messages as read, or add a new message.  In the
    Zulip webapp, this is the job of `static/js/server_events.js` and
    `static/js/server_events_dispatch.js`; in the Zulip mobile app,
    this means dispatching a Redux action with a type like `EVENT_*`
    which is handled by relevant Redux reducers.
  * We update the finger's "last event ID" to the ID of the last event
    received.
  * We update timestamps etc. in the obvious ways.
  * We start a new long-poll, or perhaps schedule a future background
    poll, as appropriate.
* When an `/events` poll request fails, saying the event queue has
  been expired (which by default the server does after 10 minutes of
  not hearing from the client): we move to stale. 😢
  * This causes us to attempt to get back to live, with a `/register`
    request.
  * The Zulip webapp implements this by reloading the whole app; see
    the handling of `BAD_EVENT_QUEUE_ID` in
    `static/js/server_events.js`.  In effect, the webapp's "stale"
    state is reflected in the UI as a loading screen.  This is OK
    because while the browser tab is open, we continuously long-poll,
    even when the user is away for hours at a time, so the user
    doesn't see this often.
  * The Zulip mobile app has striven to avoid that solution, because
    it can't continuously long-poll the way the webapp does; any time
    the user opens the app after more than a few minutes away, it's
    likely to end up making this transition to stale.  The current
    implementation (see `eventActions.js`) is to dispatch a Redux
    action with a type `DEAD_QUEUE`, which causes a variety of
    effects.
* When an `/events` poll request fails some other way: we retry, with
  some appropriate backoff.
  * This is normal when there's some transient problem with the
    network connection, or on the server.
* If the timestamp of last successful update is too far in the past
  (old enough that the event queue has definitely expired), we go
  straight to stale without waiting to hear that from the server.
  * Logically this comes before deciding to make a request; it goes
    down here only for exposition.
  * Again, this causes us to attempt to get back to live, with a
    `/register` request.
  * Currently the Zulip mobile app doesn't do this and I believe nor
    does the webapp; but they should.  Happily, this is an
    optimization that isn't essential for correctness.

When the app *starts up*:
* If the app persists any of the update machine's application-level
  state in some kind of durable store:
  * The update machine's complete state must be included in that
    persistent data.
  * Until the persistent data is loaded, the update machine's state is
    simply not known.
  * Once loaded, the update machine is in whatever state was stored;
    it might be either stale or live.
  * The update machine promptly goes on to act on its state, as
    described above: a `/register` request, an `/events` poll request,
    or a transition to stale because of a hopelessly old timestamp.
* If the app doesn't persist the update machine's state, or if this is
  the first startup of the app:
  * The update machine begins in a stale state, with some appropriate
    empty/null application-level state.
    * As we said above, when the update machine is stale the
      app must interpret its app-level data with caution; this is an
      important case for that.
  * As always on finding itself in a stale state, the update machine
    promptly makes a `/register` request to attempt to transition to
    live.

## Partial Update Machines

The design described above suffices for the case where the app
maintains a complete picture of a given area of state.  This is
Zulip's approach for most kinds of information: the list of streams,
the list of other users, and the data for almost any Zulip feature
chosen at random.  But more complexity is needed for the most
voluminous information, in particular the information at the center of
what Zulip is for: the messages.

The extra challenge for an update machine that maintains message data
is that there's too much of it; the application-level state can't
simply be "all messages ever sent (that this user can see) in this
org", because for all but the tiniest orgs, it's impractical to
download that much data, even in the webapp.

Yet at the same time, any message ever sent (that this user has access
to see) *could* become data the app needs to have, if the user goes
and looks at that conversation -- perhaps following a link to go
directly to a conversation in the distant past, or perhaps taking a
peek at an active conversation in a public stream they're not
subscribed to.  And if the app does load that message's data, it then
needs to stay up to date as it changes -- as new messages come in, as
a recent message is edited by its sender, or as others add emoji
reactions to a year-old message that someone just posted a link to.
So the Update Machine (or an equivalent solution) is needed here as
much as elsewhere.

The key idea for applying the Update Machine design to this case is:
we allow the application-level state to contain *partial information*
about the relevant data.  We call such an update machine a *partial
update machine*, by analogy with the idea in mathematics of a "partial
function", which takes values on only some elements of its domain, in
contrast to a "total function" aka simply a "function".

*(More to say, but I'm now 2000^W2500 words in, it's evening, and my
wrist is starting to complain.  For now, the below is a quick sketch.)*

Any time we do this, it's important that we clearly define
* how to distinguish what's known (so the app can directly use it)
  from what's unknown (so a request to the server to fill in the
  answer is required)
* how "unknown" interacts with "stale"

The details of these choices will be specific to the app-level data in
question.

Key examples for Zulip today:

* Messages: This is a (partial!) function from message ID to message
  data.  For any given message, our state of knowledge is a boolean:
  we don't have it, or we have complete and (if live) up-to-date
  information.

* Narrows: This is a partial function from narrow names/objects (e.g.,
  "stream `#mobile`" represented somehow) to lists of message IDs.
  Our state of knowledge here is more complex: it's described by an
  *interval of completeness*, i.e. a (start, end) pair of message IDs
  between which the list we have is (as long as we're live) complete.
  These can take special values for "very beginning" and "very end".
  * In the current mobile app, this information is reduced to the
    `caughtUp` state, a pair of booleans that indicate whether the
    special values "very beginning" and "very end" respectively apply;
    when false, the first/last known message ID is used.
  * The webapp does something else whose details I don't recall.
  * This specific design, I came up with just today while thinking
    about this overall problem.  It's more information but I think
    should actually reduce the complexity of the code.  The difference
    comes in cases where e.g. we fetch some messages not contiguous
    with the existing interval of completeness.
  * Perhaps it should actually be a list of intervals of completeness;
    usually a list of length 1, but when not it will simplify the
    behavior.

* Any "total update machine", i.e. just about anything else: our state
  of knowledge has just one value, which is "we have everything".

## Optional: surfacing more info on network state

The above doesn't help the app identify when data may be e.g. a minute
out of date because the network is failing.

(What's below is a quick sketch just to get the ideas down.)

Here's a variation.  A UM has three parts:
* some app-level data
* a *freshness state*, which is app-facing information to be used to
  condition communication to the user
  * This is a pure function of the update metadata.  For good
    structuring of the code, it might be implemented as a getter
    method whose implementation looks at the update metadata, rather
    than literally storing and updating it as additional data.
* some update metadata, which is implementation details of the UM
  engine and opaque to the application

Freshness state: several possible choices of details, but e.g.
* *"Connected"* -- corresponds to "live" above; means we have an
  active long-poll connection such that we expect to hear about any
  update within the latency of the events system (i.e. maybe 100ms)
* *"Connecting"* -- means we don't currently have a connection; might
  be accompanied with a timestamp for "last connected N minutes ago";
  includes above's "stale" but also when we've just started up and
  have a finger (so "live") but haven't yet set up a long-poll
  * In the actual UI, probably don't want to show a "Connecting..."
    banner immediately on startup if we're just going to get a
    long-poll connection established and hide the banner 100ms later.
    I.e., we should debounce the warning and only show it if after
    some period like 300ms we're still working on getting a
    connection.  Not sure if that debounce logic should live above or
    below this "freshness state" interface.
* *"Can't connect"* -- means we've had connections actually fail; the
  network, or the server, is unavailable; should probably warn the
  user data is stale

Update metadata states might be:
* **connected**, or **live**: have a finger and an outstanding
  long-poll request
* **poll failed**: have a finger, believe it still valid, but the last
  poll attempt failed; additional data includes timestamps of last
  attempt, of last success, possibly a failure count etc.; has a
  timestamp (either explicitly or as a function of the other data)
  for the planned time of retry
* **idle**: have a finger, believe it still valid, but aren't
  currently long-polling; e.g., mobile app is in background; has a
  timestamp of last successful update, possibly other similar
  metadata, and has a timestamp for planned next poll
* **registering**: have no finger, but have an outstanding
  `/register` request which hasn't completed yet
* **register failed**: have no finger, and the last `/register`
  attempt failed; logic is analogous to "poll failed"
* **stale**: have no finger, and haven't tried to make one

So "connected"/"live", "poll failed", and "idle" all count as "live"
in the description above; the others "stale".

Transitions:
* Generally a lot like above; this mainly adds some distinctions that
  were implicit in descriptions like "when stale, attempt `/register`,
  and *upon success* do ...", and the descriptions of retrying.
* In the actual implementation of an update machine, some of these
  distinctions might be reflected just as different points in the
  source code of an async function.

## TODO: React + Redux integration

What's the best way to integrate an Update Machine into a React app
where application data is managed with Redux?

We want to have the UM keep its app-level data inside the Redux state.
If the Redux state (or the relevant parts of it) are persisted with
something like `redux-persist`, then that means the update metadata
must also be persisted; perhaps cleanest to have it also live in the
Redux state so it can be persisted through the same mechanism.

Because the app-level data is in the Redux state, updating it means
dispatching Redux actions.  This is basically what the `EVENT_*`
actions in the current Zulip mobile app are.  This also means that the
UM engine, the code that's making things like long-poll requests,
needs to have access to the Redux store's `dispatch` method.

### Structure in the current app

In the current Zulip mobile app, the structure looks like
* The long-poll loop is a `redux-thunk` action, an async function
  which is provided with the Redux store's `dispatch` and `getState`.
  The code is in `eventActions.js` as `startEventPolling`, an action
  creator which takes the events finger as parameters.
* That action creator is in turn invoked within the thunk action
  created by the nullary action creator `registerAndStartPolling`
  (in `eventActions.js`), which invokes `registerForEvents`, which is
  `/register` in the API binding.
* Which is invoked by `AppDataFetcher`.  This is a Redux-`connect`ed
  component that appears near the very top of the hierarchy in
  `ZulipMobile.js`.  The component's one job is to listen for changes
  to a boolean field `needsInitialFetch` in the Redux state, and
  dispatch this action when it becomes true.
* That field, in turn, belongs to a state machine with several
  transitions:
  * On startup, it's set to true just if the persisted data contains
    authentication credentials for an account.  (It's false in
    `initialState`, and then set on a `REHYDRATE` action.)
  * It's set to true when the user logs into a server, or switches
    accounts (action types `LOGIN_SUCCESS` and `ACCOUNT_SWITCH`.)
  * It's set to true on an `DEAD_QUEUE` action -- which is dispatched
    exclusively by the long-poll loop in `startEventPolling`, when it
    finds the event queue has expired.
  * It's set to false on a `REGISTER_COMPLETE` action -- which is dispatched
    exclusively by `registerAndStartPolling`, just before it dispatches a
    `startEventPolling` action.

Essentially, the `AppDataFetcher` React component is used as a way of
listening for certain Redux actions (notably `REHYDRATE` and
`LOGIN_SUCCESS`) and firing off another one (from `registerAndStartPolling`)
when any of those happen.  And the latter action is a thunk action
which kicks off a complex series of further thunk actions.

## TODO

* Expand the description of "partial update machines".  (This is in
  Greg's head, even if not yet written up.)
* Describe in more detail how the webapp's code corresponds to this
  design and where it differs; have a section about this, at least for
  collecting the points of difference.  (Further study required.)
* Add a section about how the mobile app does correspond to this
  design, major ways it doesn't, the associated classes of bugs, and a
  sketch of how to move toward this design.  (Some of this section
  exists already in Greg's head, some requires further study.)
* Discuss using several update machines for different areas of state,
  with different properties like durable local storage and length of
  event-queue timeout.  (The mobile app already does this in at least
  one respect: presence and typing data is not durably stored, see
  `discardKeys` in `store.js`.  We've long talked about some further
  steps in this direction.)
