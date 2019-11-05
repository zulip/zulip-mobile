# Glossary

This is a scattering of terms we use that you might not be able to
readily look up on the Web.

Some are about the Zulip app as users experience it; some our
codebase; some our workflows.


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


### beta

As in sending a new version/release to beta.
See [docs](howto/release.md#terminology).


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
