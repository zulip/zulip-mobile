# Glossary

This is a scattering of terms we use that you might not be able to
readily look up on the Web.

Some are about the Zulip app as users experience it; some our
codebase; some our workflows.


## Where else to look

* Find one of the relevant types, and read the jsdoc at that type's
  definition.  That's often where our discussion of a general concept
  appears.

  * See especially [src/api/modelTypes.js](../src/api/modelTypes.js)
    and [src/reduxTypes.js](../src/reduxTypes.js).

* For concepts that appear in the user experience, look in Zulip's
  user-facing docs at https://zulip.com/help/ .

* For concepts that appear in the Zulip server API, look in the Zulip
  API docs at https://zulip.com/api/ .


## Terms

### account

In our code, specifically refers to an object of type `Account` (see
[`src/types.js`](../src/types.js)).  In particular this includes an
[identity](#identity) plus a secret, the API key, which can be used to
make requests to the server on the person's behalf.

Most of the app requires an [active](#active-account),
[logged-in](#logged-in) account, and operates exclusively on that.

Compare [user](#user), which includes other people (and bots) that
exist in the same Zulip organization -- and, naturally, no API key.


### active account

The [account](#account) currently foregrounded in the UI, if any.  For
all the normal-use screens of the app, which assume there is an
active, [logged-in](#logged-in) account, this is the account whose
data they display.  See jsdoc on the selectors in
[`accountsSelectors.js`](../src/account/accountsSelectors.js).


### alpha

As in making an alpha release, or sending a release to alpha.
See [docs](howto/release.md#terminology).


### app bar

Also called the "nav bar".  This term comes [from Material
Design][material-app-bar], which is a design language we often refer
to.  Apple says ["navigation bar"][] for the corresponding concept in
their own guidelines.  See either of those docs for discussion.

[material-app-bar]: https://material.io/components/app-bars-top/
["navigation bar"]: https://developer.apple.com/design/human-interface-guidelines/ios/bars/navigation-bars/


### avatar

A user's [profile picture][help-profile-picture].  The Zulip codebase
and API use the term "avatar".

[help-profile-picture]: https://zulip.com/help/set-your-profile-picture


### beta

As in sending a new version/release to beta.
See [docs](howto/release.md#terminology).


### caught up

Refers to metadata about how completely we know various parts of the
message history.  We keep this data in the `caughtUp` subtree of our
Redux state; see jsdoc on the `CaughtUpState` type in
[`src/reduxTypes.js`](../src/reduxTypes.js).

See also our [realtime.md](architecture/realtime.md) for background
and context.


### compose box

The widget at the bottom of the [message list](#message-list) that
enables the user to compose and send a message.  This includes the
text inputs for content and possibly topic; buttons to do things like
add an image; the send button; and the area enclosing them all.

The term comes [from the Zulip webapp][rtd-compose-box], where the
corresponding widget actually looks like a box.  Sometimes also called
the "compose area".

[rtd-compose-box]: https://zulip.readthedocs.io/en/latest/subsystems/sending-messages.html#compose-area


### crunchy shell, soft center

See our [crunchy-shell.md](architecture/crunchy-shell.md).


### identity

In our code, specifically refers to an identity that the person using
the app controls in some Zulip [organization](#organization).
Represented by the `Identity` type in
[`src/types.js`](../src/types.js).

Closely related to an [account](#account), but for us an "account"
value includes the person's API key; an "identity" doesn't, and so is
safer.

Compare [user](#user), which includes other people (and bots) that
exist in the same Zulip organization.


### local echo

The feature that as soon as you hit send on a message, it shows up in
the message list, even before we hear back from the server.  The name
comes from [remote-terminal][mosh] applications which might echo back
individual keystrokes for smooth typing.

See discussion [in our webapp-oriented docs][rtd-local-echo].

To see our implementation of this in the mobile app, search for the
`Outbox` type and the reference to `zulip-markdown-parser`.

[mosh]: https://mosh.org
[rtd-local-echo]: https://zulip.readthedocs.io/en/latest/subsystems/sending-messages.html#local-echo


### logged in

In general, a person is "logged into" a system when they've already
authenticated, and are able to access their private data without
going through any further authentication.

In the Zulip mobile app, this corresponds to the app having an API
key.  We say an [account](#account) is "logged-in" if we have an API
key for it, i.e. if the API key on the `Account` object is not blank.

(If we have an API key but it's invalid, e.g. if the user has changed
their API key, then we're not "logged in" in the more abstract
sense... but the mismatch is brief, because as soon as we try to use
the invalid key we'll discover the problem and drop the key.)

All the normal-use screens of the app, which show information from the
server like messages, other users, etc., assume there is an [active
account](#active-account) and it's logged in.  See the selectors in
[`accountsSelectors.js`](../src/account/accountsSelectors.js).


### message list

This is the part of the UI that actually shows messages the user has
sent and received.  We sometimes use the term ambiguously, for any of
(in the mobile app):
* the whole screen the user sees when reading messages (see
  `ChatScreen.js`), complete with [app bar](#app-bar), [compose
  box](#compose-box), and miscellaneous other bits; or
* just the `MessageList` component inside it; or
* the browser environment inside the `WebView` that implements the
  message list, and the JS that runs inside that (see `js.js`).

In the Zulip webapp, the term has a similar meaning; see
[docs][rtd-message-lists].  There it's sometimes also called
"the feed".

[rtd-message-lists]: https://zulip.readthedocs.io/en/latest/subsystems/sending-messages.html#message-lists


### nav bar

Synonym of ["app bar"](#app-bar).


<a id="nfc" />

### NFC or `[nfc]`

"No functional change" -- used in a commit message to mean the commit
is intended to have no effect on how the code actually behaves.  Also
called a "pure refactor".

Many PR branches will have a long series of NFC commits, which do most
of the work and set things up for just one or a small handful of
commits that make the actual change in behavior.  Marking the NFC
commits as such can help a lot in immediately seeing the structure.

Generally we avoid abbreviations except when they're very well known
(like "URL".)  We make an exception for this one, specifically for use
in commit [summary lines](#summary-line), so that we can make a commit
series look like this:
```
$ git log --oneline
[...]
58028d6d1 android notif: On open when app in background, emit the event.
0feb940fb android notif [nfc]: Factor out logic to distill lifecycle status.
cb5bbeff0 android notif: Don't set initialNotification redundantly with event.
5f1af0f3f android notif [nfc]: Add detailed comments on lifecycleState.
907eba6c2 android notif [nfc]: Use an exhaustive `when` on lifecycleState.
f8054f0d6 android notif [nfc]: Check for JS instance first in emitOrLaunch.
a5a41cc9a android notif [nfc]: Move "or launch" logic inside "emit if" function.
9fa5b56cd android notif [nfc]: Factor out tryGetReactInstanceManager logic.
0a6274291 kotlin [nfc]: Convert NotifyReact.java to Kotlin.
```

The term was introduced in the LLVM community: [docs][nfc-docs],
[background][nfc-tweet].

[nfc-docs]: http://lists.llvm.org/pipermail/llvm-commits/Week-of-Mon-20140901/233938.html
[nfc-tweet]: https://twitter.com/clattner_llvm/status/1045548372134846464


### org

Abbreviates [organization](#organization).


### organization

See [realm](#realm).  This is the user-facing term for the same
concept.


### outbox message

A message we're in the process of sending, represented by a value of
type `Outbox`.  See jsdoc on that type, in
[`src/types.js`](../src/types.js).


### prod

Or "production"; as in sending a release to prod.
See [docs](howto/release.md#terminology).


### pure refactor

See [NFC](#nfc).


### realm

Also "organization".  A single Zulip discussion community; the scope
in which exist user accounts, streams, messages, and almost everything
else in the world of the Zulip app.

The name "realm" is rather odd from a user perspective, and so in
user-facing strings and docs we always say "organization".  But
"realm" is such handy monosyllabic jargon, and has such inertia, that
it remains ubiquitous in the API and the codebase.

See [subsystem doc][rtd-realms].

[rtd-realms]: https://zulip.readthedocs.io/en/latest/subsystems/realms.html


### summary line

The first line of a Git commit message.  Called the "subject" in Git
documentation, because in the traditional email-based Git workflow it
turns into the subject line of an email.

Like an email subject line, this is the part a reader will see when
scanning through a list of many commits.  That makes it an especially
valuable place to communicate key information at a glance.

See the Zulip project's [Git style guide][style-commit-messages] for
discussion of how to write a good summary line.

[style-commit-messages]: https://zulip.readthedocs.io/en/latest/contributing/version-control.html#commit-messages


### user

A Zulip user, which might be a human or a bot.  Described by objects
of type `UserOrBot` (sometimes `User`); see
[`src/api/modelTypes.js`](../src/api/modelTypes.js).  (This set of
types and their names can probably be improved.)

A user object includes a variety of information about the user --
everything we might use to present them in the UI or to interact with
them on the server.  Generally the app maintains one of these for each
user that exists in the current [realm](#realm).

Contrasts with [identity](#identity) and [account](#account), which
for us refer specifically to identities/accounts controlled by the
person using the app, potentially across several different realms.
