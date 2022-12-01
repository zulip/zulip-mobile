# Version History

The date on a release generally reflects when the source commit was
tagged and the release build was first posted to GitHub or our alpha
channels on the Play Store and Apple's App Store.

The main rollout to users in general on the app stores is typically a
few days later.  See announcements in [#announce > mobile releases][].

[#announce > mobile releases]: https://chat.zulip.org/#narrow/stream/1-announce/topic/mobile.20releases


#### Version numbering

We number our versions like so:

* Android requires a monotonically increasing integer version ID.
  Call that N.  We increment it on each release, including those that
  only go to alpha or beta.

* Then we use version numbers 27.N, where N is that same N.
  * Before v27.154 (in 2020), we had a more complicated scheme of
    A.B.N, where A counted "major" releases.


#### "Resolved issues"

The list of "Resolved issues" on each release is intended to be
* comprehensive,
* as a list of issues we believe were resolved by changes in that
  release -- a bug fixed, feature implemented, or desired change made.

It doesn't include
* duplicate issues
* issues we determined had been fixed, but don't know when
* issues we closed because we decided not to make the requested
  change, or couldn't make use of the bug report


## Unreleased

### Highlights for users

* You can now quote a message to reply to it, just like on the web. (#1975)

* Links in user profiles now respect the "Open links with in-app browser"
  setting. (#5558)

* (iOS) Removed a blank strip between the compose box and the keyboard.
  (#3370)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* CI no longer skips Prettier on .js.flow type definitions. (#5546, and
  fixup in PR #5569 for a bug in `tools/test lint`, #5574)

* Ran `yarn upgrade`. (PR #5543)

* Followed some Expo 43–44 template-app changes, belatedly. (PR #5550)

* Upgraded to Gradle 7 and Android Gradle Plugin (AGP) 7. (#5377)

* Upgraded to Expo SDK 45. (PR #5507)

* Upgraded to Flow v0.170. (PR #5570)

* Resolved issues: #5570, #5508, #3370, #5377, #1975, #5550, #5558, #5546,
  #4325, #5492, #3423


## 27.195 (2022-11-22)

This is an Android-only stable release in the v27.193 series, with
cherry-picked changes atop v27.194.


### Highlights for users

* (Android) Fixed a bug where the "No Internet connection" notice was
  shown when it shouldn't have been. (#5568)


## 27.194 (2022-11-16)

This is a stable release in the v27.193 series, with cherry-picked
changes atop v27.193.


### Highlights for users

* You can now mark messages as unread.  This makes it easy to return
  to a conversation later if you don't have time to read it carefully,
  or to follow up on action items. (#5364)


## 27.193 (2022-11-10)

### Highlights for users

* (Android) If you've configured additional trusted CA certificates on your
  device, Zulip now trusts those too. (#3312)
* Support for invisible mode, an upcoming Zulip Server 6 feature that
  replaces "Set yourself to away"
  (https://zulip.com/help/status-and-availability#invisible-mode). (#5445)
* The profile view now shows the user's email address, subject to privacy
  settings. (#5400)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Fixed a sudden build breakage caused by changes in React Native's release
  management. (PR #5535)

* Updated for the new Transifex client. (PR #5541)

* Converted `MessageList` to a function component with Hooks. (PRs #5524,
  #5544)

* Fixed a bug where the message list didn't update when messages were marked
  unread from another client. (#5536)

* Resolved issues: #5536, #5541, #5535, #5445, #3312, #5400


## 27.192 (2022-10-21)

### Highlights for users

* Support for upcoming Zulip Server 6 features:
  * We now show the "Pronouns" custom profile field. (#5517)
  * You can now see who has read a message, subject to privacy settings
    (https://zulip.com/help/read-receipts). (#5367)
* A link to a message no longer breaks when the message is moved or its
  topic is resolved/unresolved. (#5306)
* (iOS) Fixed a bug with the position of the no-Internet notice. (#5491)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Converted many React class components to function components. (#5509)

* Resolved issues: #5367, #5517, #5306, #5363


## 27.191 (2022-09-06)

### Highlights for users

* The "Mark messages as read on scroll" setting has a new option: "Only in
  conversation views". (#5241)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* We now respect new servers' "mark as unread" events. (#5361)

* For the set of available Unicode emoji, we now use the new
  `server_emoji_data_url`, present in the `/register` response since server
  feature level 140. (PR #5460, PR #5464)

* Updated confirmation dialogs to better align with the web app. (PR #5439)

* Upgraded to Expo SDK 44! (PR #5441)

* Enabled `react-native-screens`. (#4111)

* Enabled a new Flow feature: enums! (PR #5444)

* Continued to develop our `tsflower` workflow. (PRs #5442, #5478)

* Added "fastlane" metadata, used by F-Droid. (PR #5462)

* Resolved issues: #5241, #5444, #5439, #5411, #5464, #5462, #5448, #5361,
  #4111, #5424, #5431, #5435


## 27.190 (2022-08-23)

### Highlights for users

* Fixed an issue where a crafted, malformed image link in a message
  sent by an authenticated user could lead to credential disclosure if
  a user taps on the image to expand it.  (CVE-2022-35962)

This issue was discovered internally by the Zulip developers.  We
analyzed all message history on Zulip Cloud and determined it has
never been exploited there.

Zulip server administrators should also upgrade to Zulip Server 5.6 or
later, to make this issue impossible to exploit on their servers.


## 27.189 (2022-07-01)

### Highlights for users

* Fixed a bug where reacting to a message with 🎉 would sometimes fail.
  (#5430)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Upgraded to React Native v0.67! (#5232)

* Removed the brittle `needsInitialFetch` subsystem. (PR #5300)

* Resolved issues: #5427, #5430, #5232


## 27.188 (2022-06-23)

### Highlights for users, vs. v27.186 (last prod release)

* Users' custom profile fields are now shown in the profile view. These can
  include pronouns, social-media usernames, job titles, etc. (#2900)
* Support for a new display setting, to be released in Zulip Server 6:
  "Display names of reacting users when few users have reacted to a
  message." (#5348)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for users, vs. v27.187 (last beta release)

* Fixed a regression in v27.187 that prevented the app from working with
  Zulip Server versions before 2.1. (Note that those versions are officially
  unsupported. Affected users should still get their server upgraded.)
  (#5418)
* Support for a new display setting, to be released in Zulip Server 6:
  "Display names of reacting users when few users have reacted to a
  message." (#5348)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Fixed a flake in waitingPeriodThreshold tests. (#5404)

* Fixed a flake in message-list-diffing tests. (#5414)

* Removed most definitions in navActions.js, to help reduce our use of the
  deprecated NavigationService approach. (#4417)

* Replaced our uses of Flow's $PropertyType and $ElementType with the new,
  more concise index-access syntax. (PR #5406)

* We're now running the latest versions of ESLint and Prettier. (PR #5393)

* Resolved issues: #5348, #5418, #4139, #5414, #5404, #4417, PR #5393, #4254


## 27.187 (2022-06-09)

This was a beta-only release.


### Highlights for users

* Users' custom profile fields are now shown in the profile view. These can
  include pronouns, social-media usernames, job titles, etc. (#2900)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Upgraded to React Native v0.66! (#5231)

* We now maintain React Navigation's type definitions as patched
  translations of the TypeScript definitions upstream, using TsFlower.
  (#5391)

* Synced `Message` type with the API doc at FL 132. (#5401)

* Resolved issues: #2900, #5391, #5231


## 27.186 (2022-05-25)

### Highlights for users, vs. v27.183 (last prod release)

* Support for creating web-public streams. (#5250)
* We now offer the app in Mongolian. Many thanks to our kind volunteer
  translators!
* In the Home tab, topics with unread @-mentions are now highlighted with
  "@". (#4857)
* When searching for an emoji, you can now separate words with spaces,
  rather than having to type underscores. (#4636)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for users, vs v27.185 (last beta)

* (Android) Fixed a bug where the app sometimes wouldn't start. (#5383)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers, vs. v27.185

* Migrated to use servers' new `user_settings` object when possible. (#4933)

* Improved various types to better model the server API. (PRs #5373, #5374,
  #5376, #5379, #5384, #5386, #5388)

* Resolved issues: #5250, #5386, #4658, #5383, #4933, #5199


## 27.185 (2022-04-28)

This was a beta-only release.


### Highlights for users, vs. v27.183 (last prod release)

* In the Home tab, topics with unread @-mentions are now highlighted with
  "@". (#4857)
* When searching for an emoji, you can now separate words with spaces,
  rather than having to type underscores. (#4636)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for users, vs v27.184 (last beta)

* In the Home tab, topics with unread @-mentions are now highlighted with
  "@". (#4857)
* When searching for an emoji, you can now separate words with spaces,
  rather than having to type underscores. (#4636)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers, vs. v27.184

* Fixed an incompatibility between React Navigation 5 and React Native
  v0.65. We'd taken the RN 65 upgrade in v27.184, the previous release,
  which was beta-only. (#5368)

* Our development environment, and CI, now use Node v16. (#4263)

* Synced API types with the API doc at FL 121: `api.createStream` and
  `api.updateStream` (#5341); `ApiResponseServerSettings`,
  `InitialDataRealm`, `RealmDataForUpdate` (#5349, #5354);
  `StreamUpdateEvent` (#5346); `User` and `CrossRealmBot` (#5351).

* `RootErrorBoundary` will now send all of `errorInfo` to Sentry. (#5357)

* Resolved issues: #5368, #4636, #5166, #4263, #4857, #5347


## 27.184 (2022-04-19)

This was a beta-only release because we found an incompatibility between
React Navigation 5 and React Native v0.65; we fixed it in #5368.


### Highlights for users

* The badge for unread @-mentions at the top of the Home tab now looks
  better. (#5278)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Upgraded to React Native v0.65! See commit 72583b13c for how to resolve an
  expected error from CocoaPods when you run `yarn`. (#5230)

* Bumped to server-3.0 (a.k.a. server-2.2) the threshold for warning users
  of unsupported old servers. (PR #5334)

* Bumped @sentry/react-native to ^3.3.3 to fix an issue in the release
  process. (#5335)

* Resolved issues: #5185, #5230, #5278, PR #5334


## 27.183 (2022-04-12)

### Highlights for users

* Fixed a bug where you couldn't paste an org URL from the clipboard when
  logging in. (#5228)
* When choosing an emoji, popular ones now appear at the top of the list,
  including :tada:, :smile:, and :heart:. (#4636)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* We now store persistent data in a sound way! (#4841)

* We now use `typeahead.sort_emojis` from `@zulip/shared`, for sorting
  emojis in the picker and autocomplete. (PR #5326, toward #4636)

* New setup for using custom icons in @zulip/shared. (#5307)

* Type coverage has increased to 98%. (#5323)

* ComposeBox is now a function component using React Hooks. (#5312)

* Resolved issues: #4841, #5228, PR #5312, #5307, PR #5310


## 27.182 (2022-03-16)

### Highlights for users

* Support for new Zulip Server 5.0 features:
  * You can now set your status with an emoji. (#4925)
  * You can now mark a topic as resolved. (#5202)
* New options "Copy link to topic" and "Copy link to stream" when you
  long-press on a topic or stream. (#4863, #5154)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* (Android) Our GitHub release now has a separate APK for each ABI, instead
  of one bigger APK. (#5295)

* Server-version logging tags are now set before reducers handle
  REGISTER_COMPLETE. (PR #5261)
* Sentry will now split "Unhandled Zulip API event type" into separate
  issues per event type. (PR #5243)
* Breadcrumbs are now sent to Sentry with the `type` and `op` of Zulip
  events: https://zulip.com/api/get-events (PR #5239)

* For VS Code users, we now properly specify what auto-formatter the project
  uses. (PR #5285)
* We've finished switching from stream names to stable IDs for identifying
  streams, as far as server support allows. (#3918)
* No more runtime import cycles, enforced with linting. (PR #5266)
* Updated to v0.0.9 of @zulip/shared. (#5292)

* Resolved issues: #3710, #5295, PR #5285, #5022, #4925, #5202, #5255,
  #5154, #4863, #3918, #5251, #2688, PR #5266, PR #5261, PR #5258, PR #5253,
  #3767, #5014, PR #5243, PR #5239


## 27.181 (2022-02-11)

### Highlights for users, vs v27.178 (last prod release)

* (Android) Notifications have a distinct sound, show more context,
  and expand to individual conversations. (#2691, #4842, #5136, #3150)
* Fixed one cause of slow startup times. (#5226)
* Fixed a family of bugs when a stream is renamed while you're looking
  at it. (#4333)
* Wordle players rejoice: Zulip fully supports the emoji for large
  green, yellow, and black squares. (#5220)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers, vs. 27.177 (last release from main)

* Platforms and dependencies:
  * Bumped targetSdkVersion to 31, aka Android 12.
    Almost a year ahead of deadline! (#5101)
  * Upgraded to Flow v0.141.0. (#5219)
  * Upgraded to React Native v0.64.3 from v0.64.2, so a new
    minor release. (#5167)
  * Migrated to Expo modules, from their "unimodules".  This unblocks
    upgrading Expo packages more generally, and we did. (#5133, #5203)

* Server versions and API:
  * We warn to Sentry on server versions before server-3.0.  The
    minimum supported version, the threshold for warning users,
    remains server-2.1. (#5218)
  * Our code now relies on server-1.9, i.e. Zulip Server 1.9+,
    released in 2018.  These changes affected only comments and tests;
    future changes to rely on 2.0 and later will change actual
    behavior, as did the change in v27.177 to rely on
    server-1.8. (#5192)
  * In `update_message` events for server stealth-edits, we handle a
    possible future protocol with `user_id: null` instead of omitted.
    (#5194)

* We link separately to /policies/ on zulip.com and on the current
  server, rather than only to /terms/ and /privacy/ on the current
  server. (#5168)

* Types and data structures:
  * Our migrations for our Redux data now have tests.  These found a
    year-old migration didn't work; it's fixed. (#5190)
  * We now use stream IDs instead of stream names to identify streams
    in most places, including the Narrow type. (#5183, #5205, #4333,
    #5223, toward #3918)
  * We now use $ReadOnlyArray and read-only object types in lots more
    places, including all the array and object types in our actions
    and other Redux-related types. (#5186)

* Resolved issues: #5145, #4840, #5168, #5156, #5162, #5171, #5101,
  #5187, #4687, #5195, #5206, #5133, #4333, #5130, #5218, #5220,
  #3150, #5223, #5226
  * Of these, #4840, #5156, and #5162 were also in the two cherry-pick
    releases v27.178 and v27.179.
  * #5206 was a regression in v27.180, not present in any beta or
    production release.
  * User-visible fixes not detailed in user highlights include: #5187,
    #5195, #5223, plus #5068 (in beta v27.176 highlights), plus see
    v27.177 and v27.176.


## 27.180 (2022-01-25)

This was an alpha-only release for testing notification sounds.

It included a draft version of PR #5221 atop a current version
of the main branch.


## 27.179 (2021-12-21)

This is a stable release in the v27.176 series, with cherry-picked
changes atop v27.176.

This was a beta-only release.


### Highlights for users, vs. v27.176

* Fix bug where unreads screen could lead to an empty list of messages
  if topic was edited (#4840)
* Add a "Mark all as read" button in PM conversations, just like
  in topics and streams (#5156)
* (iOS) Fix behavior when you have "Prefer Cross-Fade Transitions"
  chosen in system settings (#5162)


### Highlights for developers, vs. v27.176

* Resolved issues: #4840, #5156, #5162


## 27.178 (2021-12-21)

This is a stable release in the v27.174 series, with cherry-picked
changes atop v27.175.


### Highlights for users, vs. v27.175

* Fix bug where unreads screen could lead to an empty list of messages
  if topic was edited (#4840)
* Add a "Mark all as read" button in PM conversations, just like
  in topics and streams (#5156)
* (iOS) Fix behavior when you have "Prefer Cross-Fade Transitions"
  chosen in system settings (#5162)


### Highlights for developers, vs. v27.175

* Resolved issues: #4840, #5156, #5162


## 27.177 (2021-12-07)

This was an alpha-only release.


### Highlights for users, vs v27.175 (last prod release)

* (Android) Notifications have been reworked to be more informative and
  easier to read. (#2691, #4842, #5136)
* (Android) The app no longer restarts when you switch between split-view
  mode and fullscreen mode. (#5068)


### Highlights for users, vs v27.176 (last alpha)

* (Android) New vibration pattern for notifications. (#5136)
* (Android) Fixed a regression where some notifications were dropped.
  (#5138)


### Highlights for developers, vs. 27.176

* We now warn the user when the server isn't registered for push
  notifications. (#1507)

* The tools/checkout-keystore script, used in preparing the published
  builds, now decrypts the keystore with Sequoia PGP rather than GPG.
  (PR #5144)

* Resolved issues: #5136, #1507, #4631, #5138, #5031, #5140, #5143,
  #5153
  * User-visible fixes not detailed in user highlights include: #4631,
    #5143


## 27.176 (2021-11-16)

This was a beta-only release.

For the release with cherry-picked changes atop this one, see
v27.179 above.


### Highlights for users

* (Android) Notifications have been reworked to be more informative and
  easier to read. (#2691, #4842)
* (Android) The app no longer restarts when you switch between split-view
  mode and fullscreen mode. (#5068)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* (Android) Dropped support for Android versions older than Android 7.
  (PR #5114)

* Dropped some legacy compatibility code, to rely on server-1.8.
  (PR #5100)

  Also now fully upgraded to take advantage of server-1.6, released
  in 2017.  (The code affected here was only a line in the types.)

* Made more progress on preparing our Flow types for better multi-account
  support. (#5066, #5083, #5105, #5113)

* Resolved issues (earliest first): #4239, #5081, #2691, #4633, #5068,
  #5119, #5120, #5098
  * User-visible fixes not detailed in user highlights include: #5098


## 27.175 (2021-10-28)

This is substantially the same as the previous beta release v27.174,
but with a fix for a Sentry misconfiguration.

For the release with cherry-picked changes atop this one, see
v27.178 above.


## 27.174 (2021-10-26)

This was a beta-only release. (Note to maintainers: Events from this release
won't show up in Sentry because of a misconfiguration.)


### Highlights for users, vs v27.171 (last prod release)

* The settings menu has moved from the bottom nav bar to the Profile tab.
  (#4929)
* The app now respects the server's "mandatory topics" setting. (#4378)
* (Android) When sharing content from other apps, you can now send it to
  just yourself. (#5020)
* New translation for Sinhala. (#5071)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for users, vs v27.172 (last beta)

* (Android) Fixed a bug where "No Internet connection" sometimes showed
  when it shouldn't. (#5065)
* The settings menu has moved from the bottom nav bar to the Profile tab.
  (#4929)
* The app now respects the server's "mandatory topics" setting. (#4378)
* (Android) When sharing content from other apps, you can now send it to
  just yourself. (#5020)
* New translation for Sinhala. (#5071)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers, vs v27.173

* Resolved issues (earliest first): #5075, #5076, part of #3814,
  #5018, #5071


## 27.173 (2021-10-22)

This was an alpha-only release. An issue was identified and fixed, with
#5075 and #5076, before this release was promoted to beta.


### Highlights for users, vs v27.171 (last prod release)

* The settings menu has moved from the bottom nav bar to the Profile tab.
  (#4929)
* The app now respects the server's "mandatory topics" setting. (#4378)
* (Android) When sharing content from other apps, you can now send it to
  just yourself. (#5020)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for users, vs v27.172 (last beta)

* (Android) Fixed a bug where "No Internet connection" sometimes showed
  when it shouldn't. (#5065)
* The settings menu has moved from the bottom nav bar to the Profile tab.
  (#4929)
* The app now respects the server's "mandatory topics" setting. (#4378)
* (Android) When sharing content from other apps, you can now send it to
  just yourself. (#5020)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Set `targetSdkVersion` to 30 and switched over to "scoped storage".
  (#4283, #4284)
* Upgraded @sentry/react-native to 3.1.1, the latest. (#5050)
* Improved our Flow types in src/generics.js and wrote tests for them, with
  demos for writing more tests. (#5043, #5053, #5054)

* Resolved issues (earliest first): #5050, part of #5038, #4929, #4866,
  #4811, #4812, #4378, #4747, #3998, #5020, #5061, #5065, #5060, #4283, #4284


## 27.172 (2021-10-12)

This was a beta-only release.


### Highlights for users

* Added a new action sheet on long-pressing a stream name. (#4899)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for developers

* (ios) Fixed some build issues with Xcode 13. (#5028)

* Fixed a Jest test flake on ZulipAsyncStorage. (#4994)

* Cleaned up some code in src/utils/recipients.js. (#5011)

* Made progress on preparing our Flow types for better multi-account
  support. (#5016, #5017, #5023, #5030)

* Fixed an edge case in our new persisting logic. (#5025)

* Removed the apparently idle BackNavigationHandler component. (#5033)

* Formatted the redux-persist code so it's closer to our style. (#5040)

* Resolved issues (earliest first): #4994, #5012, #5011, #5016, #5017,
  #5003, #5028, #5025, #5023, #5030, #4899, #5021, #5033, #5035, #5040


## 27.171 (2021-09-17)

### Highlights for users

* (iOS) Fixed bug that could cause notifications to make sound with
  device in silent mode. (#4897)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Sentry is now fully set up for Android-native code. (PR #4996)

* The types PmOutbox and StreamOutbox are now distinguished more fully.
  (PR #4998)

* We now require sender_id, server, and realm_uri in notification data,
  rejecting forms from servers we no longer support. (PR #4967)

* We've prepared the persistent-data storage code so it's easier to add
  transaction logic and make it sound: #4841. We've also narrowed the race
  window to mitigate the symptoms of that issue, by using
  `AsyncStorage.multiSet` and by separating the serialization step from the
  storage step. (PR #4694)

* Outbox values now have a stream_id. (PR #5000)

* We've improved the Sentry logging for an unexpected report from the
  invariant in RawLabel. (PR #5004)

* When reporting API errors to Sentry, the invalid-JSON case is now a bit
  more explicit. (PR #5002)

* Resolved issues (earliest first): #4897, PR #4996, PR #4998, PR #4967,
  PR #4934, PR #4694, PR #5000, PR #5004, PR #5002


## 27.170 (2021-09-09)

### Highlights for users

* Improved input-focus behavior in the compose box. (#4981)
* Messages that @-mention you now appear even if you've muted their
  topic or stream. (#3472)
* Fixed a "Failed to send" bug when scrolled far up in some message
  views. (#4973)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for developers

* The Git branch for the project has been renamed from "master" to
  "main", as part of the shift in the broader Git community toward this more
  inclusive convention. Please see "#announce > Git branch renamed to ‘main’"
  on the Zulip community server (CZO) to learn more.

* Upgraded to React Native v0.64! (#4426)

  This introduces two new warnings, and you can ignore them both: one
  when you run `yarn`, and one when you run Jest. Those will disappear
  once we use a version of `jest-expo` that targets RN v0.64. (We
  expect a release from them soon.)

* Resolved issues (earliest first): PR #4973, PR #4831, PR #4981,
  #4907, #4951, #4909, #3472, #4426, PR #4992


## 27.169 (2021-08-30)

### Highlights for users

* Messages are no longer marked as read when scrolling in search,
  @-mentions, and starred-message views (#4852).
* We now offer a more complete translation for Chinese (Taiwan) (PR #4285).
  Many thanks to our kind volunteer translators!

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for developers

* (Android) Dropped support for Android versions older than Android 6 (PR
  #4938).
* Bumped to server-2.1 the threshold for warning users of unsupported
  old servers. (PR #4962)
* Over a dozen dependencies upgraded across major versions (PRs #4949,
  #4950, #4952); also other minor/patch upgrades, and some deps removed.
* Resolved issues (earliest first): #4852, #4890, #4938, #4964, #4285,
  #4870, #4764, PR #4864

  * Relative to the beta-only release v27.166, also #4921 (cherry-picked
    into beta-only release v27.167); and PRs #4960, #4959, and #4965
    (cherry-picked into stable release v27.168).


## 27.168 (2021-08-20)

### Highlights for users, vs v27.165 (last prod release)

* (Android) You can now share content from other apps to Zulip. (#117)
* Fixed a bug where network or server issues could cause an infinite
  full-screen loading spinner. It now times out after 60 seconds. (#4165)
* New setting to not mark messages as read when you view them, which is
  useful for certain workflows. (#4850)
* Basic support for polls. More to come! (#3205)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for developers, vs v27.167 (last beta)

* Fixed regression from #4165 fix that could kick a user to the
  pick-account screen at startup. (PR #4965)
* Filled in missing migration for `state.settings.language` rename
  made in v27.166. (PR #4959)
* Resolved issues (earliest first): PR #4960, PR #4959, PR #4965


## 27.167 (2021-08-05)

This was a beta-only release.


### Highlights for users, vs v27.165 (last prod release)

* (Android) You can now share content from other apps to Zulip. (#117)
* Fixed a bug where network or server issues could cause an infinite
  full-screen loading spinner. It now times out after 60 seconds. (#4165)
* New setting to not mark messages as read when you view them, which is
  useful for certain workflows. (#4850)
* Basic support for polls. More to come! (#3205)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for users, vs v27.166 (last beta)

* Fixed a glitch on Android where alert text was the wrong color in dark
  mode. (#4921)


## 27.166 (2021-07-21)

This was a beta-only release. (Note to maintainers: Events from this release
won't show up in Sentry because of a misconfiguration.)

### Highlights for users

* (Android) You can now share content from other apps to Zulip. (#117)
* Fixed a bug where network or server issues could cause an infinite
  full-screen loading spinner. It now times out after 60 seconds. (#4165)
* New setting to not mark messages as read when you view them, which is
  useful for certain workflows. (#4850)
* Basic support for polls. More to come! (#3205)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for developers

* All object types are now exact or explicitly inexact. (#3452)
* We're now using @react-native-community/push-notifications-ios instead of
  two different libraries. (#4115)
* `tools/test jest` now picks Android or iOS codepaths at random, rather
  than always iOS. (#4795)
* Resolved issues (latest to earliest): part of #3472 (PR #4807),
  #117, #4165, #4858, #4850,
  #4849, #3205, part of #4309 (PR #4817), #4635, #3452, parts of
  #4540 and #2366 (PR #4590), #4657, PR #4797, PR #4815, PR #4820, PR #4821,
  #4795, #4115

  * Relative to the beta-only release v27.164, also #4818, which was
    cherry-picked into stable release v27.165.


## 27.165 (2021-06-24)

### Highlights for users, vs v27.163 (last prod release)

* Initial support for muted users. (#4655)
* New color scheme to match the new Zulip logo. (PR #4544)
* (Android) Fixed a bug where the app sometimes opened to a wrong
  conversation. (#4758)
* Fixed a glitch where the add-server screen sometimes flashed by before the
  auth screen. (#4604)
* (Android) Now available on the Play Store to devices without cameras.
  (#4722)
* Fixed bugs with keypad and letter emoji. (#3517, #3395)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for users, vs v27.164 (last beta)

* Fixed crash on opening a notification. (#4818)


### Highlights for developers

* Resolved issue: #4818


## 27.164 (2021-06-16)

This was a beta-only release.


### Highlights for users

* Initial support for muted users. (#4655)
* New color scheme to match the new Zulip logo. (PR #4544)
* (Android) Fixed a bug where the app sometimes opened to a wrong
  conversation. (#4758)
* Fixed a glitch where the add-server screen sometimes flashed by before the
  auth screen. (#4604)
* (Android) Now available on the Play Store to devices without cameras.
  (#4722)
* Fixed bugs with keypad and letter emoji. (#3517, #3395)

Plus, like every release, many other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Started warning users when server older than server-2.0. (PR #4750)
* Extended Jest coverage to include Android-only codepaths. (#4700)
* Ran `yarn upgrade` to take all semver-compatible upgrades, as of
  2021-06-07. (It had been almost two years since the last one.) (PR #4789)
* Fixed new iOS build failures. (PRs #4721, #4634)
* `restart` events can now cause updates to `zulipVersion` and
  `zulipFeatureLevel` in `state.accounts[0]`. (PR #4707)
* Increased test coverage of our storage logic, and continued cleaning up
  `redux-persist`. (#4709)
* Fixed a bug where `CaughtUp` state was being wrongly overwritten. (PR
  #4698)
* In dev mode only, a user-facing string passed to a `_: GetText` will now
  be highlighted in the UI if it doesn't have an entry in
  `messages_en.json`. (#4728)
* Improved documentation for the release process. (PR #4690)
* We tried out Dependabot and decided not to use it for now. (#4787)

* Resolved issues (latest to earliest): #4801, #4726, PR #4707, #4715,
  PR #4777, most of #4655, PR #4750, #4758, PR #4761, PR #4717,
  PR #4710, PR #4749, #4722, #4604, PR #4728, #3540, #4323, #4734,
  PR #4721, #4264, PR #4716, PR #4634, PR #4697, PR #4544, PR #4698,
  PR #4686, PR #4689, #3517, #3395


## 27.163 (2021-06-04)

### Highlights for users, vs v27.161 (last prod release)

* A message is now marked as read when you scroll to the bottom of it,
  not just the top. (#4561)
* Fixed bug with entering the emoji :smile: and :zero:, :one:, …,
  :ten:. (#4638)
* (Android) Fixed bug in sharing an image from the lightbox. (#4539)
* More parts of the app now offer a menu when you make a long press,
  with options like muting or unmuting a topic. (#3473, #4532)

Plus, like every release, numerous other fixes and improvements for
your Zulip experience.


### Highlights for users, vs v27.162 (last beta)

* Fixed endless loading screen after logging out. (#4723)


### Highlights for developers, vs v27.162

* Resolved issues (latest to earliest): #4723


## 27.162 (2021-04-20)

(This was a beta-only release.)


### Highlights for users

* A message is now marked as read when you scroll to the bottom of it,
  not just the top. (#4561)
* Fixed bug with entering the emoji :smile: and :zero:, :one:, …,
  :ten:. (#4638)
* (Android) Fixed bug in sharing an image from the lightbox. (#4539)
* More parts of the app now offer a menu when you make a long press,
  with options like muting or unmuting a topic. (#3473, #4532)

Plus, like every release, numerous other fixes and improvements for
your Zulip experience.


### Highlights for developers

* Upgraded Flow to v0.126.  In particular this means exact object
  types work correctly with indexer properties: `{| [string]: Foo |}`.
  (PR #4518)

* Dropped iOS 11 support; now iOS 12+. (PR #4664)

* (Windows) Fixed issue affecting postinstall script at end of
  `yarn install`. (#4427)

* Error handling:
  * Exceptions from inside the WebView now report the browser version
    in the Sentry event. (#4452)
  * An error in handling an event now affects just that one event.
    (PR #4611)

* The `state.unread.streams` model is now an efficient data structure
  using Immutable.js.  The time we spend handling a stream message
  being marked as read, in a representative many-unreads case, is
  about 1.5-2x faster: measured as 150-200ms vs 300ms. (#4438, PR #4685)

* Resolved issues (latest to earliest): PR #4664, PR #4685, #4532,
  #3473, PR #4468, PR #4654, #4638, #4427, #3996, #4614, #4238,
  PR #4611, PR #4612, #4539, PR #4561, #4491, #2694, #4595, #4416,
  #4415, #4425, #4579, PR #4547, #4017, PR #4542, #4438, #4521, #4530,
  #4496, #4185, PR #4518, #4451, #4210, #4452, #3961

  * Relative to v27.159, also #4587, #4584, #4560, which were
    cherry-picked into stable releases v27.160 and v27.161.


## 27.161 (2021-04-02)

This is a stable release in the v27.159 series, with cherry-picked
changes including a critical bug fix.


### Highlights for users

* Fixed issue that could cause a persistent white screen at startup.
  (#4587)


### Highlights for developers

* Added a React "error boundary" so that white-screen failures show
  an error message and stack trace. (#4584)


## 27.160 (2021-03-29)

This was an Android-only release, with a cherry-picked fix atop v27.159.


### Highlights for users

* (Android) Fixed issue causing notifications not to arrive. (#4560)


## 27.159 (2021-02-25)

### Highlights for users, vs v27.157 (last prod release)

* Fixed crash which affected some users at startup. (#4453)
* (iOS) Viewing a conversation now takes you to the right point in the
  history, including the first time. (#3457, #4357)
* (iOS) Scrolling through lots of messages is now fast. (#3557)
* The PM-conversations tab now shows many more conversations. (#3133)
* Support the Zulip "spoilers" feature. (#4155)
* People's avatars now show up crisply, without pixelation. (#4305)

Plus, like every release, many other fixes and improvements for your
Zulip experience.


### Highlights for users, vs v27.158 (last beta)

* Fixed crashes which affected some users at startup. (#4453, #4458)
* Fixed crash in previous version on certain @-mentions. (#4422)
* The PM-conversations tab now shows many more conversations. (#3133)

Plus, like every release, many other fixes and improvements for your
Zulip experience.


### Highlights for developers

* Upgraded to React Native v0.63 -- the current latest version! (#4245)

* We've significantly refactored how we handle navigation, aiming to
  make it simpler and better support changes we want to make.  This
  came in PRs #4443, #4441, #4440, #4428, #4430, following PR #4393
  which upgraded us to React Navigation v5 (issue #4296).
  More to come.

* Improvements to our data structures continue:
  * Most uses of emails to identify users have been switched to
    user IDs. (PR #4424; mostly completes #3764)
  * `state.messages` is an `Immutable.Map`. (#4390)
  * Our various Redux sub-reducers now receive the global Redux state,
    allowing us to optimize some algorithms and drop some hacks we'd
    had for partial versions of the same thing. (PR #4437)
  * User IDs have a distinct `UserId` type: simply `number` at
    runtime, but the type-checker tracks the distinction. (PR #4421)

* Sentry error reports didn't include the Zulip server version in the
  case of uncaught exceptions; now they do. (PR #4493)

* Development on Windows was broken, and works again. (#4297)

* We have new, detailed instructions for profiling and benchmarking
  the app. (PR #4314)

* Resolved issues (latest to earliest): PR #4485, PR #4493, #4453,
  #4458, #4460, #4405, #4469, PR #4467, #4449, #4267, #4083, #4365, #4245,
  #4422, #4369, #4296, #4401, #4297, #4232, #4306, #3133, #4385.


## 27.158 (2021-01-07)

(This was a beta-only release.)


### Highlights for users

* (iOS) Viewing a conversation now takes you to the right point in the
  history, including the first time. (#3457, #4357)
* (iOS) Scrolling through lots of messages is now fast. (#3557)
* Support the Zulip "spoilers" feature. (#4155)
* People's avatars now show up crisply, without pixelation. (#4305)

Plus, like every release, many other fixes and improvements for your
Zulip experience.


### Highlights for developers

* The representation of narrows, and particularly of PM conversations,
  has been greatly refactored.  It should now be much simpler to write
  and understand code dealing with them, and especially to write it
  without introducing subtle bugs. (PRs #4382, #4368, #4364, #4361,
  #4356, #4346, #4342, #4339, #4335, #4332, #4330)
  * A new Narrow type straightforwardly follows the structure of the
    information we're representing, in place of the old data
    structures which mirrored the wire format for the much more
    complex get-messages API of the server. (PRs #4346, #4342, #4339)
  * PM conversations are represented with the users' IDs, not
    emails. (PR #4382, PR #4346)
  * The `recipient` module offers a suite of functions for explicitly
    translating between the remaining different ways that different
    data structures encode PM conversations. (#4035, PR #4356,
    PR #4335, PR #4332)

* We now use GitHub Actions for our CI, instead of Travis CI.  This
  should be a much more stable platform; it's faster (builds take
  about 8-9 minutes, vs. 9-12 minutes on Travis); and it may also help
  us make it run faster still and produce clearer output. (#4174)
* Sentry error reports now include the Zulip server version. (#3745)
* Developer scripts now support NixOS (by using `#!/usr/bin/env`.)
  (PR #4366)

* Resolved issues (latest to earliest): #4388, PR #4387, #4155, #4174,
  PR #4373, #4357, #3457, PR #4367, PR #4366, PR #4350, #4035, #3557,
  #2750, #4338, #4157, #4305, #4307, #3745.


## 27.157 (2020-11-12)

### Highlights for users

* Fixed several bugs related to opening a notification. (#4290, #4293,
  PR #3922)

Plus, like every release, many other fixes and improvements for your
Zulip experience.


### Highlights for developers

* We no longer tie in our navigation with Redux; we no longer use
  react-navigation-redux-helpers. (#3804)
* Bumped targetSdkVersion to 29, aka Android 10. (#3665)
* Dropped iOS 10 support; now iOS 11+. (c953bc336)
* Resolved issues (latest to earliest): #4303, #4298, #4301, #3804,
  #4293, #3324, #4290, PR #3922, #3665, #2756 (at 78a62b249), #4281,
  #4100.


## 27.156 (2020-10-10)

* Fixed crashes in the pre-alpha release 27.155. (#4270, #4275)

For other changes since last production release, see 27.155.


## (pre-alpha) 27.155 (2020-09-23)

(This release was distributed as a pre-alpha only, due to #4270.)


### Highlights for users

* Added support for the new "timezone-aware times" in messages that
  mention them. (#4162)
* Animated GIFs work again (broken in last release.) (#4212)

Plus, like every release, many other fixes and improvements for your
Zulip experience.


### Highlights for developers

* #3782: Upgraded to RN v0.62!
* #3649, #4248: Upgraded to react-navigation v4, from v2.
* a0d838338, #3547: Experimental support for building an
  Android App Bundle instead of a single APK.


## 27.154 (2020-07-24)

### Highlights for users

* Updated icons for the new Zulip logo. (#4200)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* #4151: Upgraded to RN v0.61!
* PR #4204: New script tools/run-android to replace
  `react-native run-android`, which turns out to have never quite
  worked correctly (even with the hacks we'd had to try to help it.)


## 26.30.153 (2020-07-06)

### Highlights for users

* You can now sign in with an Apple ID. (#3964)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* #4180: Added logging for the message-list WebView taking a long time
  to load.


## 26.29.152 (2020-06-24)

### Highlights for users

* (Android) Fixed bug in downloading an image from a message. (#3124)
* (Android) Fixed bug in viewing a file attached to a message. (#3303)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

(Note that although #3124 and #3303 are related, and the news on both
is for Android users only, their status on iOS differs: with #3124 the
bug was Android-only, but with #3303 a second bug #4136 still stands
in the way on iOS.)

* #3548: Upgraded to RN v0.60!
* #4026: Started using RN's new "autolinking" feature.
* PR #3852: Updated to use AndroidX.
* #3809: Resumed uploading to Sentry the info it needs to interpret
  stack traces.
* #4081: Added a `URL` polyfill; prefer this over trying to handle
  URLs as strings.


## 26.28.151 (2020-05-06)

### Highlights for users

* Fixed longstanding issue that caused the message list to scroll
  slightly back from the end. (#3301)
* Fixed issue causing profile icon to show as blank when first logging
  into an account. (#4077)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

(With this version we return to shorter "highlights" summaries.
For a complete list of changes, see `git log` as always.)

* #3950, PR #4047: We now customize how our Redux state is serialized
  for storage, which means we can begin to keep data structures of our
  choice in Redux.


## 26.27.150 (2020-04-13)

This is a stable release on top of 26.26.149, with one cherry-picked
fix for a critical bug.


### Highlights for users

* Fixed bug introduced in 26.24.147 that could cause the app to crash
  on launch. (#4038)


### Highlights for developers

User-facing:
* #4038: crash at launch involving group PMs
* #3985: bad arithmetic in colorHashFromString; root cause of #4038


## 26.26.149 (2020-04-07)

### Highlights for users

* Fixed bug from previous release: you can again search for a person,
  stream, or emoji when writing a message by typing "@", "#", or ":"
  and starting to type the name. (#4019)


### Highlights for developers

User-facing:
* #4019: auto-complete popup was hidden behind message list

Developer-facing:
* #3983, 954fbe5e2^..8b4b78443: use CocoaPods to manage iOS build
    with RN and other dependencies; greatly clean up Xcode project.


## 26.24.147 and 26.25.148 (2020-04-02)

This version of the app was published as 26.24.147 for iOS
and as 26.25.148 for Android.

(On Android, the version number 26.24.147 was used in a broken build
which was uploaded to Google Play but not published.)


### Highlights for users

* You can now write math formulas using LaTeX, just like Zulip on the
  web. (#2660)
* Where someone was @-mentioned in a message, you can tap to see their
  profile. (#3879)
* Searching for emoji now looks for your query in the middle of each
  emoji's name, as well as at the start. (#3948)

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues, user-facing:
  * #2660: support writing math with LaTeX
  * #3716: some emoji didn't render in the "who reacted" list
  * #3857: "N unreads" notice was half-visible when compose box tall
  * #3977: keep open some of message view even when compose box tall
  * #3879: show a user's profile on tapping an @-mention of them
  * #3986: fix color contrast in language-picker screen in dark mode
  * PR #3974: use contrasting color on group PM pseudo-avatars
  * #3948: emoji autocomplete searches inside name, not just start
  * PR #3967: fix initial scrolling on entering a muted stream

* Resolved issues, developer-facing:
  * Docs:
    cdb850ffd: state machine for presence Heartbeat class

  * 95d5e8278^..680489f85: more getUser* selectors, especially for
    lookup by user ID; more jsdoc


## 26.23.146 (2020-03-09)

### Highlights for users

* The app is now much clearer about when data is still being updated
  from the server. (#3802, #3025, #3387)
* (iOS) Opening a notification didn't take you to the conversation if
  the app was already running but in the background. (#3647)
* New complete translation for Persian, and updates for 21 other
  languages.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues, user-facing:
  * #3647: (iOS) opening a notification when in background didn't work
  * #3387, #3025: loading banner across the app when data stale
  * PR #3897, PR #3959: offer full set of translated languages in
    settings
  * #3699: app could report presence when in background
  * #3806: support "delete topic"
  * #3874: garbled title in long-press UI in certain circumstances
  * #3802: don't say "No messages" when in fact we're loading messages
  * #3860: (Android) on loading screen, status bar was gray, not green
  * 3799aed94 long-overdue translation sync: complete new translation
    for Persian, and updates for Arabic, Bulgarian, Catalan, Czech,
    German, Spanish, Finnish, French, Hungarian, Indonesian, Italian,
    Korean, Lithuanian, Norwegian (Bokmål), Portuguese, Russian,
    Swedish, Turkish, Ukrainian, Chinese (Simplified), and Chinese
    (Traditional).

* Resolved issues, developer-facing:
  * Docs:
    * 21c415123: jsdoc on state.session.loading
    * 49e253dd3: archeological results on Zulip's APNs payloads
    * f3694dce2^..368bbfc0b: some tips, in experimental new format
    * 0a1f00107^..2fed12775: more build/run troubleshooting,
      especially for old versions of the app
    * 664ee092e: some docs on `GlobalState` and redux-persist
    * c4c06fc34: docs on `unread` state
    * b5ce1e91b^..b1a0e85e9: partial docs on the various notions of
      "recipients"
    * 930a55bb6^..8bf489397: docs on "account", "user", and friends
    * 6775b4f44, 756a7c268, 1d05c703a: expand docs on translation infra

  * Tests:
    * 6d1d1df89^..6dea1330d, 79fc8a1af^..16c1687f0: add Lolex, to mock
      the clock in tests
    * 87042c30e: well-type notification-test.js
    * 4b5b76231: well-type accountsReducer-test.js
    * 4670210f8: well-type messageActionSheet-test.js

  * abc043253: embrace inline styles, disable lint rule against them
  * #3910: cleanly parse notification data, especially in iOS case
  * 33562dab1^..2e2355cde: several JSONable-related types
  * db7c42f73: better solution for running dev notification code on iOS
  * PR #3839: store Zulip server version in Redux, and parse it
  * #3015: all `createSelector` caches now actually cache
  * #3451: fix all type errors hidden by connectFlowFixMe!

* Resolved issues, server-facing:
  * #3672: (iOS) extraneous nonsense push tokens were sent to server


## 26.22.145 (2020-02-11)

### Highlights for users

* A bug in the PM conversations screen caused it not to show
  certain conversations when they first started.
* (iOS) In dark mode, when moving from one screen to another the app
  would show a white flash.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues, user-facing:
  * #3871: put "Add a reaction" always as first option on long-press
  * #3729: couldn't send to stream with a comma in its name
  * #3654: PMs from new sources weren't immediately shown in PMs list
  * #3857: unread notice had slight overlap with a very tall compose box
  * #3743: strip leading/trailing whitespace from topic on send
  * #3816: crash at user profile when user's timezone unrecognized
  * #2914: screen flashed white at navigation on iOS, in dark mode
  * #3788: show error message when deleting a message fails
  * #3813: crash on trying to use camera when iOS permission denied
  * #3449: stream notification settings reflect user's global choice
           of default

* Resolved issues, developer-facing:
  * #3888: log malformed APNs device tokens
  * 60807bde2: document CrossRealmBot
  * 1eb4ae068^..f254f45f8: document Outbox, and "caught up"
  * ba8928209^..7a3a84547: correct jsdoc on FIRST_UNREAD_ANCHOR


## 26.21.144 (2020-01-31)

### Highlights for users

* Animated GIFs now animate, even when shown full-screen.
* When you type a very long message, the input box no longer overflows
  the screen.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues, user-facing:
  * #3497: animated GIFs in lightbox
  * #3551: show in user profile when user is deactivated
  * #3760: UI glitch in "create stream" flow
  * #3614: keep compose box appropriately sized when message is long
  * #3528: drop "Reply" in message action sheet for PM or topic narrow

* Resolved issues, developer-facing:
  * #3768: Flow bug affecting `connect`
  * #3801: document how to use React DevTools
  * #3827: type fixes for upcoming Flow upgrade
  * #3783: build failure on macOS
  * #3777: build failure on Windows
  * 555721cf4: new type JSONable, for JSON-clean values


## 26.20.143 (2020-01-07)

### Highlights for users

* When a topic's name is too long to fit in the UI, you can long-press
  the topic to show it in full.
* Links to conversations now work correctly for streams and topics
  with names that go beyond ASCII characters.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

This is a regular release from the main branch following 26.18.141.
In addition to the changes mentioned here, it includes the changes
that were cherry-picked for 26.19.142.

* New test suite `pirlo` (#3669), which runs an end-to-end smoketest
  of an Android release build in the cloud using pirlo.io.

* Improvements to Sentry logging (#3733): instead of interpolating
  details of an event into the message string, we now typically use
  the Sentry "extras" mechanism to attach the data, and leave the
  message string constant.  This causes Sentry to keep the events
  grouped as a single issue even when the data varies.

* Resolved issues: #3570, #3711, #3715, #3631 (showing long topic
  names), #3752, #3739 (decoding non-ASCII in narrow-links)


## (iOS) 26.19.142 (2019-12-11)

### Highlights for users

(iOS-only release.)

Fixes and improvements for your Zulip experience.


### Highlights for developers

This is a cherry-pick release atop 26.17.140, with selected small
changes.  It does not include the changes made in 26.18.141.

* Resolved issues: 30018d7d7 (on welcome-help text)


## (Android) 26.18.141 (2019-12-05)

### Highlights for users

(Android-only release.)

Fixes and improvements for your Zulip experience.


### Highlights for developers

* Upgraded Sentry from v0.x to v1.x, take 2.

* Resolved issues: #3585


## 26.17.140 (2019-12-04)

### Highlights for users

* You can now see who left emoji reactions on a message!  Just
  long-press on the message or reaction.

* If your Zulip server uses SAML authentication, the app now supports
  it.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues: #2252, #3670, e438f82b2


## 26.16.139 (2019-11-22)

### Highlights for users

Fixes and improvements for your Zulip experience.


### Highlights for developers

(Some important fixes were backported for a cherry-pick release
26.15.138, and are described there.)

* We tried upgrading Sentry from v0.x to v1.x, but reverted the
  upgrade for now.  See issue #3585, PR #3676, and commit 57e08f789.

* New convention and lint rule: props types for our React components
  are read-only.  See 821aa44fd^..760cfa9cf, aka PR #3682.

* New (tiny) test suite: `tools/test deps`, which runs
  `yarn-deduplicate`.  See 8b155e92b.

* Resolved issues: #3689


## 26.15.138 (2019-11-19)

### Highlights for users

* Fixed an issue that affected notifications if you reset your API key.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

This is a bugfix release atop 26.14.137, with small cherry-picked
changes.

* Resolved issues: #3695, 7caa4d08e


## (iOS) 26.14.137 (2019-11-07)

### Highlights for users

(iOS-only release.)

* Fixed an issue affecting certain models of iPad, which caused
  messages not to promptly appear.


### Highlights for developers

* Resolved issues: #3657


## 26.13.136 (2019-11-05)

(This release went to prod on Android but on iOS only to beta.)


### Highlights for users

* When the app hasn't been able to reach the server, the
  PM-conversations tab now shows cached data like most of the app,
  rather than a loading spinner.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Bumped minimum Android version to Android 5 Lollipop, API 21;
  dropped support for Android 4.4 KitKat.  (b3eced058)

* Resolved issues: #3602, #3242


## 26.12.135 (2019-10-22)

### Highlights for users

(The last release supporting Android 4.4 KitKat.)

Fixes and improvements for your Zulip experience.


### Highlights for developers

* Bumped targetSdkVersion to 28!  Aka Android 9 Pie.  (#3563)

* Started importing certain code directly from the webapp: see #3638
  and its companion zulip/zulip-mobile#13253.  (This also fixed some
  quirks in our sending of typing-status events.)

* Resolved issues: #3563 (modulo beta feedback).


## 26.11.134 (2019-10-17)

### Highlights for users

* If you use multiple Zulip accounts, the app now switches to the
  right one when you open a notification.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues: much of #2295 (via PR #3648); and issue described
  in PR #3084.


## (Android) 26.10.133 (2019-10-14)

### Highlights for users

(Android-only release.)

Fixes and improvements for your Zulip experience.


### Highlights for developers

* In f65b50c85 (#3644), fixed an issue affecting the message list on
  very old Chrome versions.  (Found on Android K, L, and M on the
  small fraction of devices where the WebView implementation hasn't
  been getting updated.)


## 26.9.132 (2019-10-10)

### Highlights for users

* (Android) Fixed issue where opening a notification wouldn't go to
  the specific conversation if the app was already running in the
  background.

* Fixed issue where we didn't set your availability to "active" until
  one minute after launching the app.

Plus, like every release, other fixes and improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues: #3582, #3590, #2902


## 26.8.131 (2019-09-25)

### Highlights for users

* Fixed issue where search results would be based on an incomplete
  version of your query.

Plus, like every release, many other improvements for your Zulip
experience.


### Highlights for developers

* Resolved issues: #3591, #3592, #2209, #3058

* Started sending typing "stop" events when message sent.


## 26.7.130 (2019-08-27)

### Highlights for users

Bugfixes and other improvements for your Zulip experience.


### Highlights for developers

* Reverted the client-side fix for #3594; it's now fixed on the server
  side, and this keeps us compatible with servers running Zulip
  versions from before the original change.

* Resolved issues: #3369, #3509


## (beta) 26.6.129 (2019-08-26)

### Highlights for users

* Updated Google auth process to match a recent change in the
  Zulip server.


### Highlights for developers

* Resolved issues: #3594


## 26.5.128 (2019-08-22)

### Highlights for users (since 26.1.124 / 26.2.125)

* Highlight colors for code blocks now match the webapp and
  offer more contrast, especially in night mode.

Plus, like every release, many other improvements for your Zulip
experience.


### Highlights for developers

* Logging to the device log (via `console`) is now enabled in release
  builds as well as debug.

* Resolved issues: d6f497bd6


## (beta) 26.4.127 (2019-08-21)

### Highlights for users (since 26.1.124 / 26.2.125)

* Highlight colors for code blocks now match the webapp and
  offer more contrast, especially in night mode.

Plus, like every release, many other improvements for your Zulip
experience.


### Highlights for developers

* Logging added on connection failure at RealmScreen.

* Resolved issues: #3568, #3515, #3524


## (beta) 26.3.126 (2019-08-19)

### Highlights for users

* (iOS) Fixed issue where new users couldn't log in (yikes!)


### Highlights for developers

* Upgraded to react-navigation v2 (part of #3573).

* Resolved issues: #3588


## (iOS) 26.2.125 (2019-08-16)

### Highlights for users

* Fixed issue where new users couldn't log in (yikes!)


### Highlights for developers

This release is identical to 25.8.122, except for the version number.
It was released for iOS only, as a stopgap fix for #3588.

Reintroduces two issues (excluding Android-only issues): #2760, #3176.
Also returns us to RN v0.57.


## 26.1.124 (2019-08-09)

### Highlights for users

* Links to other Zulip conversations were broken; now they work again.

* On Android you can now upload any file from your device, in addition
  to photos.


### Highlights for developers

* Resolved issues: #2760, #3184


## 26.0.123 (2019-07-26)

### Highlights for users (since 25.6.120)

* Upgrades across most of the third-party software we use to help
  make the app.

Plus, like every release, many other improvements for your Zulip
experience.


### Highlights for developers

* Upgraded React Native to v0.59! (#3399)

* Resolved issues: #3399, #3323, #3176, #3574


## (beta) 25.8.122 (2019-07-24)

### Highlights for users

Bugfixes and other improvements for your Zulip experience.


### Highlights for developers

* Upgrades to lots of dependencies, and other changes in preparation
  for the RN v0.59 upgrade #3399.

* Dropped iOS 9 support; now iOS 10.3+.

* Resolved issues: #3106, #3565, #3550, #3518


## (beta) 25.7.121 (2019-07-19)

(This was a beta-only, and Android-only, release.)


### Highlights for users

Bugfixes and other improvements for your Zulip experience.


### Details

Resolved issues: #3553, #3539, #3196


## 25.6.120 (2019-06-18)

### Highlights for users

* You can now see when any message was sent by tapping on it. (#3491)

Plus, like every release, many other improvements for your Zulip
experience.


## Details

Resolved issues: #3264, #3526, #3516


## (beta) 25.5.119 (2019-06-13)

### Highlights for users

This is a beta-only release for testing an in-development feature:

* The time each message was sent is now tucked in at the end,
  rather than sliding in when tapped. (#3488, replacing #3491)

Like every release, it comes with many other improvements for your
Zulip experience.


## (beta) 25.4.118 (2019-06-11)

(This was a beta-only release.)

### Highlights for users

* You can now see when any message was sent by tapping on it. (#3491)

Plus, like every release, many other improvements for your Zulip
experience.


### Details

Resolved issues: #3375


## 25.3.117 (2019-06-06)

Incremental release following 25.2.116, with several bugfixes.


## 25.2.116 (2019-06-05)

Incremental release following 25.0.114, with several bugfixes.


## (alpha) 25.1.115 (2019-06-04)

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
  (i.e. FCM messages) in our Android code, in [FcmMessage.kt][].
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


## 19.2.102 (2018-10-30)

* (Android) Critical issue with Chrome 70 update. (#3078, #3080)
* (Android) Target SDK version updated to 26. No change in minimum SDK version. (#3075)
* Translated to Ukrainian and Hungarian! Updates to others.
* Unreads screen didn’t show PMs when there were no unread stream messages. (#2949)
* Autocomplete popup was much taller than screen. (#2997)
* Other fixes and improvements. (#2905, #2935, #3013, #3046)


## (alpha) 19.1.101 (2018-10-25)

This was an alpha-only release, superseded by 19.2.102.


## (alpha) 19.0.100 (2018-10-24)

This was an alpha-only release, superseded by 19.2.102.


## 18.0.99 (2018-10-02)

Many bugfixes, including:
* Search terms found in topic are properly highlighted (#2845).
* Opening embedded items like YouTube videos now works (#2895).
* When you star a message, the message list updates to show that (#2676).


## 17.1.98 (2018-09-21)

Many bugfixes. Notable fixes include:
* Sending a message with an `@all` mention now succeeds. 📣
* Several bugs fixed in sharing and viewing images 📷, especially on iOS.
* Subscribing / unsubscribing to a stream now works again.
* Topic list now renders the first time you visit it, too.


## (beta) 17.0.97 (2018-09-18)

This was a beta-only release, superseded by 17.1.98.


## 16.2.96 (2018-08-10)

* New emoji picker screen lets you be the first to react to a
  message. 🥇
* More responsive when visiting a conversation from the main nav, and
  in many other UI interactions.
* (Android) Stored data is compressed for efficiency.
* (Android in part) Friendlier error banner on certain failures; and
  fixed main cause of the same errors.
* Ready for server-side image thumbnailing, in upcoming versions of
  the Zulip server.
* (Android) Future-proof for new versions of the Zulip server to add
  new notifications features.
* (Android/iOS) New minimum OS version: Android 4.4 / iOS 9.
* A number of other fixes and improvements.


## (alpha) 15.1.95 (2018-08-10)

This was an alpha-only release, superseded by 16.2.96.


## (alpha) 16.1.94 (2018-08-02)

This was an alpha-only release, superseded by 16.2.96.


## (alpha) 16.0.93 (2018-08-01)

This was an alpha-only release, superseded by 16.2.96.


## 15.0.92 (2018-07-23)

* Fixed #2800, the notorious "things stop updating" bug.
* Lots of other fixes and improvements.


## (beta) 14.1.91 (2018-06-29)

(This was a beta-only release.)

* Fixed #2589, where text inputs would get very slow as you typed more
  than a couple of sentences.
* Many other fixes and improvements.


## 14.0.90 and earlier

TODO?: backfill some of this information from notes in other places.
