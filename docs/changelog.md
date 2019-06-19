# Version History

The date on a release generally reflects when the source commit was
tagged and the release build was first posted to GitHub or our alpha
channels on the Play Store and Apple's App Store.  The main rollout
to users in general on the app stores is typically a few days later.


#### Version numbering

We number our versions like so:

* Android requires a monotonically increasing integer version ID.
  Call that N.  We increment it on each release, including those that
  only go to alpha or beta.

* Then we use version numbers A.B.N, where N is that same N, and...
  * A is incremented for "a major release", whatever that means. (It's
    a bit of an arbitrary choice we make when making the release.)
  * B is reset to zero on "a major release", and otherwise incremented.


## Unreleased


## 25.6.120 (2019-06-18)

### Highlights for users

* You can now see when any message was sent by tapping on it. (#3491)

Plus, like every release, many other improvements for your Zulip
experience.


## 25.5.119 (2019-06-13)

### Highlights for users

This is a beta-only release for testing an in-development feature:

* The time each message was sent is now tucked in at the end,
  rather than sliding in when tapped. (#3488, replacing #3491)

Like every release, it comes with many other improvements for your
Zulip experience.


## 25.4.118 (2019-06-11)

(This was a beta-only release.)

### Highlights for users

* You can now see when any message was sent by tapping on it. (#3491)

Plus, like every release, many other improvements for your Zulip
experience.


## 25.3.117 (2019-06-06)

Incremental release following 25.2.116, with several bugfixes.


## 25.2.116 (2019-06-05)

Incremental release following 25.0.114, with several bugfixes.


## 25.1.115 (2019-06-04)

Alpha release; no release notes.  See Git log for detailed changes.


## 25.0.114 (2019-05-31)

### Highlights for users

Special highlights:
* Just like Zulip on the desktop and web, we now highlight
  messages that you're reading for the first time. (#3125)
* Fixed a bug that caused the app to miss some messages. (#3441)

Like every release, this contains many other improvements for
your Zulip experience.


## 24.0.113 (2019-03-29)

### Highlights for users

Many fixes and improvements, including:
* The app now fetches more messages more eagerly when scrolling
  through the message list, so you'll less often have to wait.
* Long-pressing a link in a message copies the link.
* The special `:zulip:` emoji.
* A new complete translation for Romanian, and updates for Czech,
  Turkish, and Italian.


### Full changes for users

* Touching a user's avatar or name in the app bar above a message list
  leads to their profile.
* Fetch more messages sooner, to reduce user waiting. (6ccf3a297)
* Adjusted text on "Switch account" and "Log out" buttons.
* The special `:zulip:` emoji is now supported. (#2375)
* User status / "unavailable" feature more fully supported. (#3417)
* Azure AD authentication backend supported, when enabled on server. (#3227)
* On iOS when displaying the message list, switched a major
  system-provided component ("WebView") to a newer version offering
  performance and stability improvements. (#3296)
* Complete translation into Romanian from scratch; translation updates
  for Czech, Turkish, and Italian.
* Fixed a bug on iOS where long-pressing something in the message list
  could act like a normal press after the long-press. (#3429)
* When a message contains a link, you can now copy the link by
  long-pressing it. (#3385)


### Highlights for developers

* The Android app now supports Kotlin!  In fact we're migrating to
  Kotlin -- new code will be in Kotlin.  See
  [doc](architecture/android.md#kotlin-and-java).

* The Android app now has unit tests!  Just a few so far -- but now
  that we have a model to follow, we'll write them for other code
  as appropriate.  See [doc](howto/testing.md#unit-tests-android).

* We've begun using a "crunchy shell, soft center" pattern in handling
  data from the server.  This means all parsing of messy
  data-from-the-network happens at the edge (the "crunchy shell") --
  and constructs new, clean data structures with an exactly known
  format.  Then the rest of the app can be a "soft center", with many
  fewer boring checks, so the real application logic it's expressing
  easier to read and the code is less prone to bugs.

  So far this is demonstrated in parsing of notification data
  (i.e. FCM messages) in our Android code, in [FcmMessage.kt].
  See also discussion in the commit message of f85d3250f.
  The same pattern works great in JS too, and we may gradually 
  also move to it there.

[FcmMessage.kt]: ../android/app/src/main/java/com/zulipmobile/notifications/FcmMessage.kt

* We've begun to put small single-use helper React components in the
  same file where they're used, and in general to put several React
  components in a file when that makes the code clearer.  Disabled the
  lint rule that would complain about that.  Discussion in cb418f134,
  examples in 7f7620811 and parent.


### Other changes for developers

* Types for the server API significantly reorganized: moved
  initial-data types in from app's `types.js`, and separated out model
  types and generic protocol/transport types in their own files.
  (12bc3e801^..958bc2b7e)
* Types for our Redux state separated out and organized.
  (cc945867a^..4bc77bdab)
* `Touchable` revised to more effectively cover up a subtle,
  regrettable difference between upstream RN's interfaces for the
  implementations we use on Android vs. iOS. (ec32af1a4, f44114b2b)
* Fixed most remaining violations of Flow's `strict-local`; just 8
  files remain without it. (dd03939cb^..d298669ef)


## 23.3.112 (2019-03-04)

Small Android-only bugfix release following 23.2.111.
* Fixed regression in 23.2.111 that broke autocomplete on Android.


## 23.2.111 (2019-02-28)

### Highlights for users (since 22.1.108)

Many fixes and improvements, including:
* Support for setting yourself as away/unavailable, or setting
  a status message.
* Fixed several issues in message compose and autocomplete.
* Fixed several issues in sending messages under bad network
  conditions.
* Translation updates for Portuguese, Italian, Hindi, Turkish, French,
  German, and Czech.


### Full changes for users

* Support for the new "availability" or "user status" feature (#3344;
  7d16af845^..f37856207, 130fde9fd^..7bbd09896)
* Distinct nav icons "inbox" and "world" for the unreads and
  all-messages screens, rather than both "home". (#3232)
* Fixed issue causing stuttering animation on lightbox. (#3334)
* Fixed background color below compose box on notched
  displays. (#3329)
* Fixed color of user-group icon in @-mention autocomplete in dark
  mode. (#3366)
* Support batched remove-notification events, on Android. (#3343)
* Translation updates for Turkish. (a6b548999)


### Full changes for developers

* Improved documentation for developing against a dev server.
  (e62f84f2d)
* Small improvements to Git documentation. (f018461d4)
* Almost all selectors are now annotated with types. (#3360, #3364)
* Fixed ineffective caching in many selectors. (#3015;
  2e898e745^..414e48cc6)
* New script `tools/ios` to build for iOS and upload to the App Store,
  entirely from the command line. (38f8b5da1)
* New, more streamlined and secure workflow for signing Android
  release builds. (06b53639b^..23a3c705b)


## (beta) 23.1.110 (2019-02-20)

This was a beta-only release.


### Highlights for users

Many fixes and improvements, including:
* Fixed several issues in message compose and autocomplete.
* Fixed several issues in sending messages under bad network
  conditions.
* Translation updates for Portuguese, Italian, Hindi, French,
  German, and Czech.


### Detailed changes

A terse and incomplete list:

* Numerous type improvements: actions, events, strict-local
* Fixed #3274, lightbox action sheet
* Fixed #3259, outbox reordering
* Fixed #3120 by retrying outbox
* Reducer refactor
* Fixed #3280, iOS layout at top
* Android build updates
* Compose box simpler, and fixed some latency
* Fixed double autocomplete popups
* Fixed #3295 in compose box
* Make WebViews debuggable
* Buffer thunk actions
* Fixed #2128, spamming server with notif signups
* android notif: Completely cut out wix library
* android notif: Upgrade to FCM from GCM
* Fixed #3338, by using server's `found_newest`/`found_oldest`
* Fixed caching in some selectors (#3015)
* Fixed some inefficient data structures (#3339)
* Fixed #3289, `@`-autocomplete following newline
* Cleaned up CI in several ways
* Fixed #2693, emoji cut off at bottom
* Translation updates for Portuguese, Italian, Hindi, French, German, and Czech


## (alpha) 23.0.109 (2019-02-20)

This was an alpha-only release, followed closely by 23.1.110.
See above for details.


## 22.1.108 (2019-01-15)

* Fixed regression in 22.0.107: launching the app from a notification
  would lead to a "No messages" screen.  (#3284, 5d1b5b0d8)


## 22.0.107 (2019-01-09)

### Highlights for users

Many fixes and improvements, including:
* Fixed bug: a successfully-sent message would stick around as a
  zombie, with "sending" animation.
* Evaded bug in React Native: the message list and nav bar sometimes
  failed to display.
* Redesigned language-settings screen uses each language's own name,
  drops flag images, and has search.
* Translation updates in Korean, Hindi, Ukrainian, and Chinese.


### Full changes for users

* Fixed bug: a successfully-sent message would stick around as a
  zombie, with "sending" animation. (#3203)
* Evaded bug in React Native: the message list and nav bar sometimes
  failed to display. (#3089)
* Redesigned language-settings screen uses each language's own name,
  drops flag images, and has search. (#2611, #3231)
* Don't (attempt to) stop notifications on switching accounts.
  (23e01e850)
* Fix broken layout on account details screen. (#3228)
* Paint "safe area" with appropriate background color. (#3236)
* Translation updates in Korean, Hindi, Ukrainian, and Chinese.
  (7cc9950c6, 6b4ce281c)
* Keep presence info up to date. (#3207)


### Changes for developers

#### Highlights of important updates to know

All active developers will benefit from knowing about these.  More
details on each in subsections below.

* Major typing upgrades, including:
  * Exact object types -- use them in most cases.
    Discussion in 61d2e3426.
  * Intersection types -- probably never use them.
    Discussion in ff515bc9d and 124a2f39a.
  * Read-only arrays -- use them in most cases.
    Discussion in 4c3aaa0b1.

* New patterns for getting styles: static where possible, and
  otherwise using new React context API instead of legacy one.
  All new code should follow.  Examples in a2bfcb41b, 51dd1b3b2,
  f6ddc2dba.

* The type `Account` is no longer the same as `Auth`.
  In either case, `Identity` is preferred where it suffices.
  Changed in 5738ccb6f, as part of notifications changes.

* `getAuth` and other account-related selectors no longer return
  malformed data.  Some throw; others explicitly can return
  `undefined`.  Interfaces in jsdoc in `accountsSelectors.js`;
  discussion in 33a4df218.

* We no longer lie to Redux through `areStatesEqual`!  See #3163.

* Automated refactoring is pretty great!  Discussion in e566058bf of
  one approach.  Lower-tech approaches already helped powerfully for
  migrating to exact types, and to new `styles` API.


#### Workflow improvements

* Experimented with automated refactoring: an AST-based tool
  `jscodeshift`, and lower-tech Perl one-liners.  (`jscodeshift`
  discussed in e566058bf, used in 47365203f.  Perl one-liners on
  several occasions; see `git log --grep perl`.)

* `tools/test` accepts `--diff COMMIT`: run only on files changed
  since `COMMIT` (vs. default of files changed in current branch.)
  (1fe380e1a)

* Reactotron disabled by default, because it broke basic app
  functionality. :'-( (170ed2a32, 598386524)

* New script `tools/changelog` streamlines some steps of making a
  release. (593d38d06^..9dfb52e24)


#### Architecture, interface, and quality improvements

* Most object types are now exact.  Let's do more of that.
  (Discussion in 61d2e3426; additional changes in
  a15c00e1a^..b9b48657f, 703739338, e5e57abe3^..9c1898242)

* Intersection types nearly all replaced with object spread.
  (Discussion in ff515bc9d and 124a2f39a; additional changes in
  eb3783b1a^..47365203f)

* New patterns for getting styles: static where possible, and
  otherwise using new React context API instead of legacy one.  Most
  existing code migrated; all new code should follow. (examples in
  a2bfcb41b, 51dd1b3b2, f6ddc2dba; fuller changes in
  112f99be9^..8dad2d191, 1f71edad9^..a4e0f23b3)

* Major parts of notifications code rewritten, others refactored;
  the wix `react-native-notifications` library reduced to a small
  role.  (Context in #2877.  Changes in 410041dfa^..2ed116267,
  dcbe2ac86^..d6454eb50, 034e25be8^..3a2076e0f, f1eae82d8^..233d68c40)

* Rewrote `accountsSelectors.js`.  Now `getAuth` can only return a
  real, authentication-bearing value.  (Discussion in 33a4df218;
  changes in 3706965d3^..614f56bd2, f1eae82d8)

* Removed the `connectPreserveOnBackOption` hack, where we told lies
  to Redux via `areStatesEqual`. (#3163, da6c43d4b^..cd7b25757)

* Server API bindings describe more routes (even that the app doesn't
  use); route bindings have a more uniform signature, and link to API
  docs. (1acf7d96a^..8170045d8, 0af4af22b^..6becc6e91

* We subscribe to all server events with our queue.
  (d8b36412c^..6c7fffc76)

* Logic fixes in Android notification UI code for sound and vibration;
  no visible changes yet. (125dc0806^..458ef8832)

* Don't run old migrations on first install. (863bca711)

* Don't use `console.warn`. (21f64aad7)

* More read-only array types. (4c3aaa0b1)

* Translated-message files moved out of `src/`, to `static`, to avoid
  spamming grep results. (1fc26a512)

* Upgraded RN to v0.57.8, from v0.57.1. (c03c85684^..ca759b106,
  329dd67f0)

* New script `tools/upgrade` to help systematize upgrading
  dependencies. (b64ce0023^..eb130c631)



## 21.2.106 (2018-12-12)

### Highlights for users (since 20.0.103)

Many fixes and improvements, including:
* Full support for custom emoji, including in composing messages and
  in reactions.
* Fetch updates much sooner when reopened after several minutes idle.
* Fixed bug: a message view seen shortly after starting the app could
  show "No messages".
* Fixed bug: uploading an image while viewing a stream would go to the
  wrong topic.
* Fixed bug: a draft message typed just after starting the app was
  lost.
* Complete translations for Italian and Korean.


### Full changes for users (since 21.1.105)

* Fixed a regression in 21.0.104: the autocomplete popup would sometimes
  not respond when touched. (#3209)


## (beta) 21.1.105 (2018-12-11)

This was a beta version that did not become a production release;
see above.


### Full changes for users (since 21.0.104)

* Fixed issue where a message view seen shortly after starting the app
  could show "No messages". (#3162)
* Fixed issue where uploading an image while viewing a stream would go
  to the wrong topic. (#3130)
* Fixed a regression in 21.0.104: the password input for logging into
  a server was rendered in a broken way, looking empty. (#3182)


### Full changes for developers (since 21.0.104)

#### Workflow improvements

* `tools/test` accepts a `--fix` option.  (177d3eaa9)


#### Architecture, interface, and quality improvements

* New internal API `withGetText` for acquiring a handy
  string-translating function, to use in any part of the app that
  isn't a React component. (#2812; c22dfee9b^..9eaa05c27)
* New experimental internal API for the (server) API bindings:
  `import api from ...`, then `api.sendMessage(...)` etc.
  (63ae59808^..acb979cf5)
* We no longer write `props: Props`, or where applicable
  `state: State`, at the top of each React component; the type
  arguments to `PureComponent` or `Component` express that already.
  (7e3becfba, c5df77962)
* A good swath of our uses of `any` and `Object` are replaced with
  real types, and 20 more files are marked strict-local; 60 to go.
  (9a0df7416^..60f14ed83)


## (beta) 21.0.104 (2018-12-05)

This was a beta version that did not become a production release;
see the regression fix above.


### Full changes for users

* Added full support for custom emoji ("realm emoji"), including in
  composing messages and in reactions. (#2129, #2846)
* The app now fetches updates much sooner when reopened after several
  minutes idle. (#3190)
* Fixed issue where a draft message typed just after starting the app
  was lost. (#2861)
* Complete translations for Italian and Korean. (62c8d92d8)
* Fixed missing line that made switching to Indonesian language not
  work. (d92329bb4)
* Messages pending send can now be deleted in long-press menu, like
  other messages. (#3189)
* Force-upgrade screen provides helpful App Store or Play Store
  deep-link. (#3158)
* Fixed handling of old reactions with emoji that have changed
  name. (#3169)
* Fixed misrendering of "keypad" emoji like `:zero:`. (#3129)
* Group PM conversations now show combined avatars with rounded
  corners, like individual avatars. (#3167)
* Fixed bugs causing top bar to sometimes be white instead of
  stream-colored. (#2797, #3139)
* Long-pressing a recipient bar now offers "Unmute topic" when
  appropriate. (8b60314e0 / #3156)
* Alert words are now highlighted in the message list. (#3082)
* Fixed fetching of explicit avatars (`!avatar(...)`) in messages. (#3047)
* Overflow menu in lightbox is now properly aligned. (#3024)
* Send button has larger touch target. (#2945)
* Error banners in message list show as red, rather than gray.
* Fixed oversizing of images in Dropbox inline previews. (#3136)
* Various improvements across the app for latency and performance.


### Full changes for developers

#### Workflow improvements

* Tests and linters run fast by default (<5s on a fast desktop for
  small changes, <1s for no changes), by running only on files changed
  in the current branch. (977596d9e^..bd24bd1be)
* Spell-checker results are now pure warnings, free to ignore. (ff7bc2992)
* Configuration for Reactotron, and expanded developer documentation
  on debugging. (#3109, 0e5d03631^..59967fc23)
* One-step release-mode Android builds without signing keys or
  Sentry. (#2883; 8d55447be^..ee40b3c7b)
* Detailed step-by-step instructions for setting up dev environment on
  WSL. (#3193)

#### Architecture, interface, and quality improvements

* Extensive refactoring of the message list and rendering to
  HTML. (#3156, #3170)
* New `caseNarrow` abstraction for working with narrow objects.
  (fa6134aa6^..e9fe1e801)
* Explain `Auth` vs. `Account` types, and introduce distinct
  `Identity`. (f5a2603a4^..28b1177d3)
* Applied `@flow strict-local` to most files and `@flow strict` to
  many files, fixing newly-exposed type issues. (#3164, 6efa7980c,
  2a96ede50, fa1b8a85c; 5ec1d3f9d^..597c51f6e; 5a2d49f85^..da5d519bf)
* Began to use more Flow "exact types". (01003e619, 24211fb55, others)
* Flow types on many more areas of code.
* Enable ESLint in most places where it was disabled, fixing issues.
  (ddd51e5eb^..a533fa8d8)
* Scripts run on Bash, and are moved out of package.json to their own
  files. (6c25beeb0, 3119ec697, 8d3e8ade5^..4d58c11d8)


## 20.0.103 (2018-11-12)

### Highlights

Many fixes and improvements, including:
* Mark messages you see as read, even in a short thread.
* Tapping an emoji reaction works again to add/remove your own.
* Messages you send no longer flicker when they reach the server.
* Translation updates. Complete translations for Polish and
  Portuguese, the latter nearly from scratch!


### Full

* Mark messages you see as read, even in a short thread. (#2988)
* Tapping an emoji reaction works again to add/remove your own. (#2784)
* Messages you send no longer flicker when they reach the server. (#2483)
* Translation updates.  Complete translations for Polish and
  Portuguese, the latter nearly from scratch!
* (iOS) Downloading a shared image works again. (#2618)
* (iOS) Fix multiple bugs affecting autocorrect when typing a message.
  (#3052, #3053)
* (iOS) New React Native version 0.57 no longer breaks typing in
  Chinese or Japanese. (#2434)
* (Android) New React Native version 0.57 no longer crashes when
  typing an astral-plane Unicode character, including post-2009
  emoji. (#2787)
* (Android) Fix crash when downloading a file, by requesting needed
  permissions. (#3115)
* SSO login was broken. (#3126)
* (Android, infra) Client-side support for removing notifications when
  you read the messages elsewhere. (#2634)
* (infra) Updated to React Native v0.57 (from v0.55). (#2789)


## 19.2.102 and earlier

TODO: backfill some of this information from notes in other places.
