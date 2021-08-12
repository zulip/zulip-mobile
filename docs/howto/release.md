# Release guide

This doc explains how to make a release of Zulip Mobile to the
iOS App Store, to the Google Play Store, and as an APK on the web.


## Terminology

Google and Apple each have different terminology for the various
channels of progressively wider release.  We don't use or need the
full complexity of either one, and for sanity's sake we use a common,
simple terminology for the process we follow with both.

* **Alpha**: A release only to active developers of the app.  See
  [instructions](alpha.md) for joining.

  * What this means on each platform:
    * Google Play: release to "Internal testing"
    * iOS: release in TestFlight to "App Store Connect Users"
    * GitHub: a Git tag

  * On both Google Play and TestFlight, a new version in this channel
    is available for update immediately on devices.  We use it for
    final manual QA before releasing to beta or production.

  * NB Google Play has its own feature it calls "Alpha" (aka "Closed
    track" or a "closed testing track"), which is sort of intermediate
    between "Internal testing" and "Open testing".  We don't use this
    feature.

* **Beta**: A release to users who have volunteered to get new versions
  early and give us feedback.  See
  [instructions](https://github.com/zulip/zulip-mobile#using-the-beta) for
  joining.

  * What this means on each platform:
    * Google Play: release to "Open testing"
    * iOS: release to all our TestFlight users (through the
      "External Testers" group)
    * GitHub: a GitHub release with binaries and description,
      marked as pre-release

  * We use this channel for wider testing of a release before sending to
    production: about 1 day for a typical (stable) release, 2-4 days for a
    new major release, or not at all for a security release.

  * NB Google Play also calls this "Beta track" or "Open track", as
    well as "Open testing".

* **Production** (aka **prod**): A general release to all users.

  * What this means on each platform:
    * Google Play: release to "Production"
    * iOS: release to the App Store
    * GitHub: a GitHub release with binaries and description,
      not marked pre-release

  * On iOS there is a gotcha we've occasionally fallen for in the past:
    because releasing to the App Store is mostly a separate process from
    releasing to TestFlight, it's easy to release a given version to the App
    Store without ever interacting with TestFlight.  If we do, our beta
    users will simply never get that version, and stay on the (older) last
    version we gave them.  Naturally this isn't good for our kind beta
    users, nor for us; so don't do this. :)


## Release procedure

(For one-time initial setup, see [below](#initial-setup).)


### Prepare the commit

* Prepare the changelog.  See `git log --stat -p docs/changelog.md`
  for examples.

* Sync translations with Transifex: `tools/tx-sync`.

  * This ensures we release with the latest translations provided by
    our translation contributors.  See
    [howto/translations.md](translations.md) for background.

  * Skip this step if making a release that isn't atop the latest
    development version, i.e. a "cherry-pick release" or "stable release".
    We sync with Transifex only from the latest development version.

* Check that tests pass: `tools/test --all`.

* Run `tools/bump-version` to update the version number in the
  Android and iOS build metadata.

* Inspect the resulting commit and tag, and push.


<div id="alpha-android" />

### Build and upload alpha: Android

* Decrypt the keystore file temporarily:

  ```
  tools/checkout-keystore
  ```

* Apply the Sentry client key (using the local branch created for this
  in initial setup):

  ```
  git rebase @ release-secrets
  ```

* Build the app, as both a good old-fashioned APK and a fancy new AAB:

  ```
  tools/android aab && tools/android apk
  ```

* This produces an AAB at `android/app/build/outputs/bundle/release/app-release.aab`
  and an APK at `android/app/build/outputs/apk/release/app-release.apk`.

* Upload the AAB to Google Play via the "Create new release" button at
  the top of the
  [Release > Testing > Internal testing][play-internal-testing] page.
  (We'll use the APK when posting the release on GitHub, at beta stage.)

  * For the release notes, use `tools/changelog user` and edit as
    needed.  (E.g., fix paragraph wrapping, and delete iOS-only items.)

  * Alternatively, to distribute as a "pre-alpha", upload to Google
    Play via ["Internal app sharing"][play-internal-app-sharing].

    The one salient advantage of this channel is that it doesn't
    occupy a place in the sequence of version numbers, which makes it
    convenient to use when potentially experimenting with several
    Google Play uploads in quick succession, e.g. when making
    significant changes to the build process.

    But the price of that flexibility is, in part, that these uploads
    are completely separate from the alpha/beta/production track: in
    order to roll out a pre-alpha to the alpha, beta, or production
    channel, it has to be uploaded separately there, just the same as
    if it had never been uploaded at all.  Moreover, a device won't
    upgrade directly from an alpha/beta/production version to a
    pre-alpha, or vice versa; switching between the tracks requires
    uninstalling and reinstalling.  So for a typical release where the
    first build we make is expected to be good with high probability,
    this track costs more inconvenience than it saves.

* The release should be available immediately on your devices:
  navigate to the Zulip screen in the Play Store app, and it should
  already show an "Update" button.

* Remember to switch back to a branch without the Sentry client key:

  ```
  git checkout master
  ```

[play-internal-testing]: https://play.google.com/console/developers/8060868091387311598/app/4976350040864490411/tracks/internal-testing
[play-internal-app-sharing]: https://play.google.com/console/internal-app-sharing


### Build and upload alpha: iOS

* Make sure you don't have any dependencies set to local patched
  versions with `yarn link`:

  ```
  for f in node_modules/* node_modules/@*/*; do [[ -L "$f" ]] && echo "FIX: $f"; done
  ```

  (A nice improvement would be to script that -- probably folded into
  `tools/ios build`.)

* Apply the Sentry client key (using the local branch created for this
  in initial setup):

  ```
  git rebase @ release-secrets
  ```

* Build using our `tools/ios` script:

  ```
  tools/ios build
  ```

  This will take a few minutes to run (it's about 5 minutes on the
  Mac Mini in the Zulip office.)

  * You'll need a graphical session (rather than SSHing in to the
    machine); toward the end you'll get a graphical prompt for your
    login password (in fact two of them in quick succession), when the
    job needs access to your keychain to sign the build.

  * At one point I (Greg) found I could do a build over SSH by first
    running the command `security unlock-keychain` (which prompts for
    the login password), then the build script.  But then that stopped
    working; not clear what changed.

  * Given past experience with Apple tools, this will probably prove
    to be flaky in new and exciting ways.  See the history of this
    howto file for possibly-helpful historical problems and solutions
    with the previous, GUI-based way.

* Upload using our script:

  ```
  tools/ios upload
  ```

  * You'll need a graphical session.  For this step, happily, the
    Keychain prompts come at the beginning instead of the end.

  * For this step `security unlock-keychain` wasn't effective even
    when it did work for the actual build.  Finding a pure-CLI,
    SSH-accessible way to do this step would be pretty nice.
    (Possible route: export to a `.ipa` file, then use `altool
    --upload-app`.  Can prompt for App Store Connect password, or get
    it from the keychain.)

  * Like the build, this will probably be flaky in exciting ways;
    see history for hints.

* Watch progress on [App Store Connect][app-store-connect].

  * The new build will appear first in
    [Activity -> iOS History -> All Builds][asc-builds], with the
    caveat "(Processing)" next to its build number.  If it doesn't
    appear there, look for an email from Apple explaining why; this
    can happen if an automated check doesn't like it.

  * Processing takes a few minutes, and we get an email from Apple
    when it's complete.  At this point, the new build automatically becomes
    available in alpha.

* Remember to switch back to a branch without the Sentry client key:

  ```
  git checkout master
  ```

[app-store-connect]: https://appstoreconnect.apple.com/
[asc-builds]: https://appstoreconnect.apple.com/apps/1203036395/recent/activity/ios/builds?m=


### Promote to beta

* Before doing this:

  * Update your device to the alpha.

  * Manually test core functionality, and anything with risky changes.

  * Then, perhaps promote immediately.

  * For a very raw new major release, perhaps hold off a couple of
    days for feedback from other alpha users.


* Android via Play Store:

  * Go to [Release > Testing > Internal testing][play-internal-testing]
    in the Google Play Console.  (If you just uploaded the alpha, that
    took you here already.)

  * Under the release you want to promote, choose "Promote release >
    Open testing".

  * After confirming, you'll see the [Release > Testing > Open
    testing][play-open-testing] page, and the new release will appear
    there in state "In review".

    * This review step was new [in 2020][czo-first-play-beta-review].
      But it [seems to be fast][czo-fast-play-beta-review] -- under an
      hour.

[play-internal-testing]: https://play.google.com/console/developers/8060868091387311598/app/4976350040864490411/tracks/internal-testing
[play-open-testing]: https://play.google.com/console/developers/8060868091387311598/app/4976350040864490411/tracks/open-testing
[czo-first-play-beta-review]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/release/near/1038894
[czo-fast-play-beta-review]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/release/near/1094653


* Android via GitHub:

  * Upload as a [GitHub release][gh-releases].
    This is useful for people who use Android without Google Play,
    e.g. out of privacy concerns or a desire to stick rigorously to
    free software.

  * Name the release the same as the tag name.

  * For the release notes, use `tools/changelog notes`, and fix
    formatting as needed.

    * The hashes printed at the bottom are based on the files found at
      the usual build-output locations mentioned [above](#alpha-android).
      Those should be the same files you upload.

  * Upload both the AAB and the APK.

    (The AAB is more flexible and is the only version we use with
    Google Play, but the APK is simpler and may be a bit easier for
    people to work with.  As of 2020 it seems likely that some people
    consuming these builds will prefer the APK, and it's not much
    burden to build it at the same time, so we keep posting it
    alongside the AAB.)

  * Check the box "This is a pre-release".

[gh-releases]: https://github.com/zulip/zulip-mobile/releases


* iOS via App Store:

  * After the build reaches alpha, you can add it to TestFlight so it
    goes to our beta users.  Go in App Store Connect to [TestFlight ->
    Testers & Groups -> External Testers][asc-external],
    and hit the "+" icon at the top of the list of builds to enter a
    modal dialog.

    * For the "What to Test" notes, use `tools/changelog user` and
      edit as needed.  (E.g., fix paragraph wrapping, and delete
      Android-only items.)

  * The same External Testers page should now show the build in status
    "Waiting for Review".  This typically comes back the next morning,
    California time.  If successful, the app is out in beta!

  * Also submit for App Store review, to save latency in the prod rollout:

    * In App Store Connect for the app, [go to the "App Store"
      tab][asc-main], and hit the "+" button next to "iOS App" at the
      top of the left sidebar.  Enter the version number.  This
      creates a new draft listing.

    * In the draft listing:

      * At the top, fill in "What's New in This Version".  Use
        `tools/changelog user`, editing as needed, just like for
        TestFlight.

      * Optionally, update the previews/screenshots, and the
        description and other text.

      * In the "Build" section, hit the "+" icon next to the "Build"
        heading.  Select the desired build.

      * Under "Version Release" near the bottom, make sure "Manually
        release this version" is selected (vs. "Automatically release
        this version").

      * Back at the top, hit "Save" and then "Submit for Review".

    * The draft listing should enter state "Waiting for Review".  From
      here, it typically takes a day or so to get a result from the
      Apple review process; if it passes review, we can push one more
      button to roll it out.

[asc-external]: https://appstoreconnect.apple.com/apps/1203036395/testflight/groups/1bf18c25-da12-4bad-8384-9dd872ce447f
[asc-main]: https://appstoreconnect.apple.com/apps/1203036395/appstore/info


* Announce on chat.zulip.org:

  * Announce the new beta release [in `#announce > mobile releases`][] on czo.

  * Use `tools/changelog czo` for the release notes, editing
    formatting as needed.  Note that the tool rewrites issue/PR
    references like `#1234` to `#M1234` instead, so that they get
    linkified correctly.

[in `#announce > mobile releases`]: https://chat.zulip.org/#narrow/stream/1-announce/topic/mobile.20releases


### Release to production

Do this after the beta has been out a couple of days and there don't
seem to be bad regressions.

* Android via Play Store:

  * In the Play Console, go to [Release > Testing >
    Open testing][play-open-testing].

  * Under "Releases", hit the "Promote release" dropdown, and choose
    "Production".  Look at the "What's new" box at the bottom,
    and check that the text is good.  Hit the button to proceed to the
    next screen.

  * Under "Staged roll-out", consider the roll-out percentage.  If
    it's less than 100% -- as the default may indeed be -- remember to
    come back later to make a 100% rollout.

  * Hit "Start rollout to Production" at the bottom.

[play-open-testing]: https://play.google.com/console/u/0/developers/8060868091387311598/app/4976350040864490411/tracks/open-testing


* Android via GitHub:

  * Edit the release [on GitHub][gh-releases], and uncheck
    "This is a pre-release".


* iOS via App Store:

  * (This assumes the new version was submitted for App Store review
    at the time of the beta rollout, and accepted.  See beta steps
    above for how to submit it.)

  * In App Store Connect for the app, [go to the "App Store"
    tab][asc-main], and select the draft release.

  * Hit the big blue button at top right to release to the App Store.


## Security releases

When a release fixes a security vulnerability in the app which isn't already
public, we follow a variation of the process above.  The goal is to get the
update onto most users' phones almost before the issue is disclosed,
minimizing the window where the issue is public and users are still
vulnerable.

### Preparing commit

* Write the fixes on a private branch, but don't push to the main repo (or
  other public repos.)

* Prepare and QA the commit as usual.  We'll be skipping the beta phase, so
  be especially diligent with the QA, and choosy in what commits to include.
  Definitely make it a stable release, with only hand-picked changes on top
  of the last release.

* Tag the commit, but don't push it yet.

### Android prep

* Build and upload to Google Play, but release only to alpha for now.
  Repeat manual QA with the alpha.

* Don't upload to GitHub yet.

### iOS prep

* Build and upload to App Store Connect, but release only to alpha for now.
  Repeat manual QA with the alpha.

* Follow the steps to release to production, with one change: in the draft
  listing, find the option for "Manually release this version", and select it.

### Release

* Wait for Apple's review; on success, the app will enter state "Pending
  Developer Release".  (On failure, try to fix the issue, then resubmit.)

* Now release the app to the App Store; and in the Play Store, promote to
  beta and then immediately to production.

* Also now submit to TestFlight, for beta users on iOS.  Wait for that to go
  out before discussing further in public.

### Followup

* Wait for the release to be approved for TestFlight.  (On failure, try to
  fix, then resubmit.)

* Push the tagged commit, and also push the corresponding changes to master.

* Upload the APK to GitHub as usual.

* Discuss freely.


## Initial setup

### Configure Sentry error reporting

#### Sentry token for uploading a release and sourcemap

1. Visit https://sentry.io/settings/account/api/auth-tokens/ , and
   create a new auth token.  Give it the `project:releases` scope, and
   no others.

2. Create a file like this:

   ```
   defaults.url=https://sentry.io/
   defaults.org=zulip
   defaults.project=zulip-mobile
   auth.token=01234567...YOUR-TOKEN-HERE...89abcdef
   cli.executable=node_modules/@sentry/cli/bin/sentry-cli
   ```

   with your new auth token in the `auth.token=` line, and place
   copies at both `android/sentry.properties` and
   `ios/sentry.properties`.

When preparing a release for publication, these files will be used for
uploading to Sentry the sourcemap for the release, so that it can
unminify the stack traces and add source-code snippets.

(Our routine builds don't do this, regardless of debug or release
mode; it's enabled by the `tools/android` and `tools/ios` scripts we
use for preparing releases for publication.  They do this via setting
the `-Psentry` Gradle property and the `USE_SENTRY` Xcode variable
respectively, and those cause our build process to invoke a build-time
script Sentry supplies.)


#### Sentry client key

1. Visit https://sentry.io/settings/zulip/projects/zulip-mobile/keys/
   and get the Sentry "client key" there, specifically in the format
   Sentry calls a "DSN".

2. Edit `src/sentryConfig.js` and save that string as the value of
   `sentryKey`.  See the jsdoc and comment there for more about this
   value.

   You won't want to push that change, or to make builds with it
   except when you're making a release build you intend to publish.
   But you will want to have it handy to apply whenever you are making
   a release build for publication.  So:

3. Save this value in the form of a local Git branch you don't push,
   using commands like:

   ```
   $ git checkout -b release-secrets
   $ git commit -am 'SECRET: Add Sentry client key.'
   $ git checkout master
   ```

   Then, as described in the main release steps above, when making a
   build for publication you'll rebase or cherry-pick that
   `release-secrets` commit temporarily before building.

(Yes, this is kind of a hacky way to do this.  Eliminating that
cherry-pick step at build time would be quite nice.  The key criteria
this meets that an improved solution should also meet are: (a) the key
shouldn't be in the public source tree, so it should live locally on
each release manager's machine; (b) Sentry should only be enabled in
builds explicitly meant for publication, and not in other builds a
release manager happens to make, including builds in release mode.)


### Set up Transifex.

Install Transifex's CLI client, `tx`, using our instructions at
[howto/translations.md](translations.md#setup).

### Prepare Android

We have a keystore file containing our [app signing key].  As the
linked upstream doc explains, this is a highly sensitive secret
which it's very important to handle securely.

[app signing key]: https://developer.android.com/studio/publish/app-signing#secure_key

* Get the keystore file, and the keystore properties file.
  An existing/previous release manager can send these to you,
  encrypted to your GPG key.

  * Never make an unencrypted version visible to the network or to a
    cloud service (including Zulip).

* Put the release-signing keystore, GPG-encrypted to yourself,
  at `android/release.keystore.gpg`.

  * Don't leave an unencrypted version on disk, except temporarily.
    The script `tools/checkout-keystore` will help manage this;
    see release instructions above.

* Put the keystore properties file at
  `android/release-keystore.properties`.
  It looks like this (passwords redacted):

```
storeFile=release.keystore
keyAlias=zulip-mobile
storePassword=*****
keyPassword=*****
```


### Prepare iOS

* In Xcode, sign in to your Apple developer account that is a member of
  the "Kandra Labs, Inc." team.  In the "ZulipMobile" center pane that
  appears when first opening the project in Xcode, this is under the
  "General" tab (the first one shown), in the "Signing" section.

  * If this doesn't work, that's OK.  You'll just need to use the
    Application Loader workaround when uploading (above), and when on your
    first build you're prompted for a "provisioning profile" you'll need to
    download it from the Apple Developer web app.

* You'll need the private key for the distribution certificate.  To
  install that:

  * (Maybe skip all the below steps, and instead follow the "Create
    certificate" troubleshooting entry? ... Possibly not even that;
    now that `-allowProvisioningUpdates` is in `tools/ios`, it might
    be enough just to sign in to your Apple developer account, above,
    except when the cert has expired.)

  * Get an export from someone who has the key.  Give it a filename
    ending in `.p12`.

  * Open the "Keychain Access" app, and go to File -> Import Items... to
    import the file.  You'll also need a password, which the same person
    can give you.

  * It's also possible to make a new certificate, using the web app at
    developer.apple.com/account/ .


## Troubleshooting

### iOS build error: "Provisioning profile" lacks a capability/entitlement

You might get an error like this from `tools/ios build` (reformatted
slightly for readability):
```
error: Provisioning profile "iOS Team Provisioning Profile: org.zulip.Zulip"
  doesn't support the Sign In with Apple capability.
  (in target 'ZulipMobile' from project 'ZulipMobile')
error: Provisioning profile "iOS Team Provisioning Profile: org.zulip.Zulip"
  doesn't include the com.apple.developer.applesignin entitlement.
  (in target 'ZulipMobile' from project 'ZulipMobile')
```

(Most likely with some other capability and/or entitlement -- you're
unlikely to hit the issue with this same one in the future.)

This happened when [first attempting a release build][] after merging
changes (to the Xcode project file) that started asserting that
capability.

[first attempting a release build]: https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/ios.20build.3A.20apple.20auth/near/926523

The fix has two parts:
* Enable the capability in the Apple developer console, at
  developer.apple.com in the UI for the appropriate App ID.
  (This part, we'd done long before.)
* Make Xcode aware of the newly-enabled capability.  As of Xcode 11.3.1:
  * Go to Xcode > Preferences > Accounts.
  * Select the appropriate Apple ID in the left pane (if it isn't
    already).
  * In the right pane, hit the button "Download Manual Profiles".
    Give it a second or two; a spinner should appear and disappear.

Expect the upload to fail too; see the "Create certificate" item
below.


### iOS upload error "Create certificate"

You might get an error like this from `tools/ios upload` (reformatted for readability):
```
error: exportArchive: Create certificate

Error Domain=IDEProvisioningErrorDomain Code=19
  "Create certificate"
  UserInfo={IDEDistributionIssueSeverity=3,
    IDEProvisioningError_UserInfoKey_IDEProvisioningUserAction=<
      IDEProvisioningCreateTeamOwnedCertificateUserAction: 0x7f91a015d380>,
    NSLocalizedRecoverySuggestion=Create a new Apple Distribution certificate for your team.,
    NSLocalizedDescription=Create certificate}
```

followed perhaps by an error like this:
```
error: exportArchive: Provisioning profile
  "iOS Team Store Provisioning Profile: org.zulip.Zulip"
  doesn't support the Sign In with Apple capability.

Error Domain=IDEProfileQualificationErrorDomain Code=7
  "Provisioning profile "iOS Team Store Provisioning Profile: org.zulip.Zulip"
    doesn't support the Sign In with Apple capability."
  UserInfo={IDEProfileQualificationError_Profile=<
    IDEEmbeddedProvisioningProfile ...
[... and a bunch more details ...]
```

or like this:
```
error: exportArchive: No profiles for 'org.zulip.Zulip' were found

Error Domain=IDEProfileLocatorErrorDomain Code=1
  "No profiles for 'org.zulip.Zulip' were found"
  UserInfo={
    NSLocalizedDescription=No profiles for 'org.zulip.Zulip' were found,
    NSLocalizedRecoverySuggestion=Xcode couldn't find any iOS App Store provisioning profiles matching 'org.zulip.Zulip'.}

** EXPORT FAILED **
```

To resolve this, follow that first suggestion: "Create a new Apple
Distribution certificate for your team."

To do that, as of Xcode 11.3.1:
* Go to Xcode -> Preferences -> Accounts.
* With your Apple ID selected in the left pane, select
  "Kandra Labs, Inc." (that's the "your team" part) on the right.
* Hit "Manage Certificates...".  You might see an entry under
  "Apple Development Certificates" -- but probably there's no heading
  "Apple Distribution Certificates".
* Hit the "add" icon, and choose "Apple Distribution".
  Now such a cert should appear; and now `tools/ios upload`
  should work again.

Alternatively:
* If you start from the Apple developer console at
  https://developer.apple.com/account/resources/certificates/list ,
  that offers an alternative route which appears to have the same
  effect (but is a bit more cumbersome and manual.)
* An "iOS Distribution Certificate" would probably also do.  The
  s/iOS/Apple/ variety is new with Xcode 11, according to a bit
  of UI in that web flow.


### App Store Connect webapp is buggy and slow

Try using Safari when working with App Store Connect.  It's still
buggy and slow, but not as buggy as it is in Chrome.
