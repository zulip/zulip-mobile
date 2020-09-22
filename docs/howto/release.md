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

  * On Google Play this means an "Internal test" release, and on iOS it
    means a release in TestFlight to "App Store Connect Users".

  * On both platforms, a new version in this channel is available for update
    immediately on devices.  We use it for final manual QA before releasing
    to beta or production.

  * NB Google Play has its own feature it calls "Alpha" (aka "Closed track"),
    which is sort of intermediate between "Internal test" and "Beta".  We
    don't use this feature.

* **Beta**: A release to users who have volunteered to get new versions
  early and give us feedback.  See
  [instructions](https://github.com/zulip/zulip-mobile#using-the-beta) for
  joining.

  * On Google Play this means a "Beta" aka "Open track" release, and on iOS
    it means a release to all our TestFlight users, through the "External
    Testers" group.

  * We use this channel for wider testing of a release before sending to
    production: about 1 day for a typical (stable) release, 2-4 days for a
    new major release, or not at all for a security release.

* **Production** (aka **prod**): A general release to all users.

  * On Google Play this means a "Production" release, and on iOS an
    App Store release.

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

* Sync translations from Transifex: `tools/tx-pull && git commit -a`.

  * If any new language file appears, see
    [howto/translations.md](translations.md) for additional updates to
    make.

  * This is also a good reminder to upload recent strings and sync
    across languages: `tx push -s && tools/tx-pull && git commit -a`,
    to be done just after syncing translations as above.  (Though
    ideally we do this immediately after merging any change to our
    strings, i.e. to `messages_en.json`, in which case this is a
    no-op.)

* Check that tests pass: `tools/test`.

* Run `tools/bump-version` to update the version number in the
  Android and iOS build metadata.

* Tag the commit and push the tag.


### Build and upload alpha: Android

* Decrypt the keystore file temporarily:

  ```
  tools/checkout-keystore
  ```

* Make sure you don't have any dependencies set to local patched
  versions with `yarn link`:

  ```
  for f in node_modules/* node_modules/@*/*; do [[ -L "$f" ]] && echo "FIX: $f"; done
  ```

  (A nice improvement would be to script that -- probably folded into
  `tools/android`.)

* Build the app:

  ```
  yarn
  tools/android apk
  ```

  This produces an APK at `android/app/build/outputs/apk/release/app-release.apk`.

* Upload to Google Play via the "Create Release" button on the
  ["Internal test" track management][play-manage-internal] page
  (within [Release management -> App releases][play-manage-releases]).

[play-manage-releases]: https://play.google.com/apps/publish/#ManageReleasesPlace:p=com.zulipmobile&appid=4976350040864490411
[play-manage-internal]: https://play.google.com/apps/publish/?account=8060868091387311598#ManageReleaseTrackPlace:p=com.zulipmobile&releaseTrackId=4699145961663258026


### Build and upload alpha: iOS

* Make sure you don't have any dependencies set to local patched
  versions with `yarn link`:

  ```
  for f in node_modules/* node_modules/@*/*; do [[ -L "$f" ]] && echo "FIX: $f"; done
  ```

  (A nice improvement would be to script that -- probably folded into
  `tools/ios build`.)

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

  * Go to
    [Release management -> App releases -> Internal test][play-manage-internal]
    in the Google Play Console.  (If you just uploaded the alpha, that
    took you here already.)

  * Use the "Release to beta" button there.

[play-manage-internal]: https://play.google.com/apps/publish/?account=8060868091387311598#ManageReleaseTrackPlace:p=com.zulipmobile&releaseTrackId=4699145961663258026


* Android via GitHub:

  * Upload as a [GitHub release][gh-releases].

    This is useful for people who use Android without Google Play,
    e.g. out of privacy concerns or a desire to stick rigorously to
    free software.

  * Check the box "This is a pre-release".

[gh-releases]: https://github.com/zulip/zulip-mobile/releases


* iOS via App Store:

  * After the build reaches alpha, you can add it to TestFlight so it
    goes to our beta users.  Go in App Store Connect to [TestFlight ->
    Testers & Groups -> External Testers][asc-external],
    and hit the "+" icon at the top of the list of builds to enter a
    modal dialog.

    * Leave the username and password (for the Apple reviewer)
      unchanged.

    * Enter notes for testers.

  * The build will go into "Beta App Review".  This typically comes back the
    next morning, California time.  If successful, the app is out in beta!

  * Also submit for App Store review, to save latency in the prod rollout:

    * In App Store Connect for the app, [go to the "App Store"
      tab][asc-main], and hit the "+" button next to "iOS App" at the
      top of the left sidebar.  Enter the version number.  This
      creates a new draft listing.

    * In the draft listing:

      * At the top, fill in "What's New in This Version".

      * Optionally, update the previews/screenshots, and the
        description and other text.

      * In the "Build" section, hit the "+" icon next to the "Build"
        heading.  Select the desired build.

      * Under "Version Release" near the bottom, make sure "Manually
        release this version" is selected (vs. "Automatically release
        this version").

      * At the bottom, for the "Advertising Identifier (IDFA)"
        question, select "No, it doesn't".

      * Back at the top, hit "Save" and then "Submit for Review".

    * The draft listing should enter state "Waiting for Review".  From
      here, it typically takes a day or so to get a result from the
      Apple review process; if it passes review, we can push one more
      button to roll it out.

[asc-external]: https://appstoreconnect.apple.com/apps/1203036395/testflight/groups/1bf18c25-da12-4bad-8384-9dd872ce447f
[asc-main]: https://appstoreconnect.apple.com/apps/1203036395/appstore/info


### Release to production

Do this after the beta has been out a couple of days and there don't
seem to be bad regressions.

* Android via Play Store:

  * In the Play Console, go to [Release Management -> App releases ->
    Manage Beta][play-manage-beta].

  * Hit "Release to Production".  Look at the "What's new" box at the bottom,
    and check that the text is good.  Hit the button to confirm the release.

[play-manage-beta]: https://play.google.com/apps/publish/?account=8060868091387311598#ManageReleaseTrackPlace:p=com.zulipmobile&releaseTrackId=4697711623380261182


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

* Add Sentry API key and account: file `sentry.properties` change `auth.token`

* Set client key (DSN): file `config.js` set `sentryKey` value


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
