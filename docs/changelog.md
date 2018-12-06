# Version History

The date on a release generally reflects when the source commit was
tagged and the release build was first posted to GitHub or our alpha
channels on the Play Store and Apple's App Store.  The main rollout
to users in general on the app stores is typically a few days later.


## Unreleased

### Highlights for users

Many fixes and improvements, including:
* Added full support for custom emoji, including in composing messages
  and in reactions.
* The app now fetches updates much sooner when reopened after several
  minutes idle.
* Fixed issue where a draft message typed just after starting the app
  was lost.
* Complete translations for Italian and Korean.


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
* Force-upgrade screen says "Play Store" on Android, rather than
  "App Store". (#3158)
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
