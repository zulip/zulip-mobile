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

  * One difference between platforms: on Google Play a beta is open for
    anyone to join, while on iOS it requires an invite from us.  But as we
    say in the repo's README, our iOS beta is as open as we can make it:
    just ask and we gladly send an invite.  (The Google Play analog of the
    closed TestFlight model would be their "Alpha" aka "Closed track"
    feature, so we don't use that.)

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


### iOS

* Build and upload from Xcode.

  * First: in a terminal, run `yarn`.

  * In the "scheme" menu at the top center-left of the main window,
    select "ZulipMobile > Generic iOS Device".

  * Select Product -> Archive from the application menu.

    * This runs the actual build; typically it takes a few minutes.
      If it fails, debug and try again.

    * When the build succeeds, Xcode opens its "Archives organizer",
      aka "Organizer", window.

  * In the Archives organizer, select the archive and hit the button
    "Upload to App Store...".  Follow the instructions in the [Xcode
    docs on uploading][xcode-upload].

    * For the options "Include bitcode for iOS content" and "Upload
      your app's symbols...", keep both options enabled.

    * For signing, select "Manually manage signing".  Choose the
      provisioning profile called "XC iOS: org.zulip.Zulip".
      (On your first upload, you'll choose at this screen to download
      the provisioning profile.  Or if you're hitting the bug
      described below where [Xcode can't log in](#trouble-uploading-apple),
      you can download the provisioning profile from
      developer.apple.com/account/ios/profile/.)

[xcode-upload]: https://help.apple.com/xcode/mac/9.0/#/dev442d7f2ca

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

Put the release key file in `./android/app/my-release-key.keystore`

Make sure you have the file `~/.gradle/gradle.properties`:
```
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=zulip-mobile
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
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


<div id="trouble-uploading-apple" />

### Uploading to App Store: "No accounts with iTunes Connect access ..."

(Probably this would say "App Store Connect" today; the issue was last
seen before that rename.)

If you get an error like "No accounts with iTunes Connect access have
been found for the team ...", followed by your account name with the
message "No iTunes Connect access for the team": this is an error
[often reported, with varying causes][so-xcode-upload-fail] (also
[forums 1][forums-xcode-fail-1], [forums 2][forums-xcode-fail-2]).  A
workaround that works for many people on the internet, and worked for
Greg when he first hit this issue in 2018, is to [use Application
Loader instead][application-loader]:

* Instead of the "Upload to App Store..." button, hit "Export...".
  This will create a directory somewhere with a `.ipa` file in it.

* From the Xcode menu, select Xcode -> Open Developer Tool ->
  Application Loader.  Hit the giant "Deliver Your App" button, then
  the "Choose" button in the corner.  Select the `.ipa` file you
  exported.  Proceed through the next screens just like the normal
  case below.

[so-xcode-upload-fail]: https://stackoverflow.com/questions/46231372/xcode-8-3-3-no-accounts-with-itunes-connect-access
[forums-xcode-fail-1]: https://forums.developer.apple.com/thread/86867
[forums-xcode-fail-2]: https://forums.developer.apple.com/thread/67366
[application-loader]: https://help.apple.com/itc/apploader/#/apdATD1E12-D1E1A1303-D1E12A1126
