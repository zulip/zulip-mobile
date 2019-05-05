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

### Preparing commit

* Run `tools/bump-version` to update the version number in the
  Android and iOS build metadata.

* QA the exact commit to be released: run tests, and do manual testing
  of core functionality and anything with risky changes.

* Tag the commit and push the tag.

### Android

* Decrypt the keystore file temporarily:

  ```
  tools/checkout-keystore
  ```

* Build the app:

  ```
  yarn
  yarn build:android
  ```

  This produces an APK at `android/app/build/outputs/apk/release/app-release.apk`.

* Upload as an "Internal test track" release in the Google Play Console,
  under [Release management -> App releases](https://play.google.com/apps/publish/#ManageReleasesPlace:p=com.zulipmobile&appid=4976350040864490411).

  * Update your device to the new version, and smoke-test it.

* Promote the release to beta, using the "Release to beta" button on that
  "Internal test" page.  (Skip this for a very raw new major release.)

* If promoting to beta: also upload as a release
  [on GitHub](https://github.com/zulip/zulip-mobile/releases).  This is
  useful for people who use Android without Google Play, e.g. out of privacy
  concerns or a desire to stick rigorously to free software.

  Check the box "This is a pre-release".


### iOS

* Build using our `tools/ios` script:

  ```
  security unlock-keychain  # will prompt for your password
  tools/ios build
  ```

  This will take a few minutes to run (it's about 5 minutes on the
  Mac Mini in the Zulip office.)

  * If you have a graphical session (rather than SSHing in to the
    machine), you could skip the `security unlock-keychain`; then
    toward the end you'll get a graphical prompt to do the same thing,
    when the job needs access to your keychain to sign the build.

  * Given past experience with Apple tools, this will probably prove
    to be flaky in new and exciting ways.  See the history of this
    howto file for possibly-helpful historical problems and solutions
    with the previous, GUI-based way.

* Upload using our script:

  ```
  tools/ios upload
  ```

  * You'll need a graphical session; `security unlock-keychain`
    doesn't seem to suffice.  Finding a pure-CLI, SSH-accessible way
    to do this step would be pretty nice.  (Possible route: export
    to a `.ipa` file, then use `altool --upload-app`.  Can prompt for
    App Store Connect password, or get it from the keychain.)

  * Like the build, this will probably be flaky in exciting ways;
    see history for hints.

* Distribute from [App Store Connect][app-store-connect].

  * The new build will appear first in
    [Activity -> iOS History -> All Builds][asc-builds], with the
    caveat "(Processing)" next to its build number.  If it doesn't
    appear there, look for an email from Apple explaining why; this
    can happen if an automated check doesn't like it.

  * Processing takes a few minutes, and we get an email from Apple
    when it's complete.  At this point, the new build automatically becomes
    available in alpha.

  * After processing is complete, you can add the build to TestFlight
    so it goes to our beta users.  Go to [TestFlight ->
    Testers & Groups -> External Testers -> Builds][asc-external-builds],
    and hit the "+" icon at the top of the list of builds to enter a
    modal dialog.

    * Leave the username and password (for the Apple reviewer)
      unchanged.

    * Enter notes for testers.

  * The build will go into "Beta App Review".  This typically comes back the
    next morning, California time.  If successful, the app is out in beta!

[app-store-connect]: https://appstoreconnect.apple.com/
[asc-builds]: https://appstoreconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1203036395/activity/ios/builds
[asc-external-builds]: https://appstoreconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1203036395/testflight?section=group&subsection=builds&id=1bf18c25-da12-4bad-8384-9dd872ce447f


### Releasing to production

Do these after the beta has been out a couple of days and there don't
seem to be bad regressions.

* For Android, promote the beta to production.

  * In the Play Console, go to [Release Management -> App releases ->
    Manage Beta][play-manage-beta].

  * Hit "Release to Production".  Look at the "What's new" box at the bottom,
    and check that the text is good.  Hit the button to confirm the release.

  * Also edit the release on GitHub, and uncheck "This is a pre-release".

[play-manage-beta]: https://play.google.com/apps/publish/?account=8060868091387311598#ManageReleaseTrackPlace:p=com.zulipmobile&releaseTrackId=4697711623380261182

* For iOS, promote the TestFlight build to the App Store.

  * In App Store Connect for the app, [go to the "App Store" tab][asc-main], and
    hit the "+ Version" button at the bottom of the left sidebar.  Enter the
    version number.  This creates a new draft listing.

  * In the draft listing, scroll down to the "Build" section and hit the "+"
    icon next to the "Build" heading.  Select the desired build.

  * Fill in the "What's New in This Version" input at the top.  Optionally,
    update the previews/screenshots, and the description and other text.

  * At the top of the draft listing, hit "Save" and then "Submit for Review".

  * For the "Advertising Identifier (IDFA)" question, select No.

  * The draft listing should enter state "Waiting for Review".  From here,
    it typically takes a day or so to get a result from the Apple review
    process; if it passes review, the app will go live.

[asc-main]: https://appstoreconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1203036395


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

  * Get an export from someone who has the key.  Give it a filename
    ending in `.p12`.

  * Open the "Keychain Access" app, and go to File -> Import Items... to
    import the file.  You'll also need a password, which the same person
    can give you.

  * It's also possible to make a new certificate, using the web app at
    developer.apple.com/account/ .


## Troubleshooting

### App Store Connect webapp is buggy and slow

Try using Safari when working with App Store Connect.  It's still
buggy and slow, but not as buggy as it is in Chrome.
