# Release guide

This doc explains how to make a release of Zulip Mobile to the
iOS App Store and the Google Play Store.

## Release procedure

(For one-time initial setup, see [below](#initial-setup).)

### Preparing commit

* Update version number, in three places: `versionCode` and
  `versionName` in `android/app/build.gradle`, and
  `CFBundleShortVersionString` in `ios/ZulipMobile/Info.plist`.

* QA the exact commit to be released: run tests, and do manual testing
  of core functionality and anything with risky changes.

* Tag the commit and push the tag.

### Android

* Build the app:

  ```
  npm run build:android
  ```

  This produces an APK at `android/app/build/outputs/apk/app-release.apk`.

* Upload as a beta release in the Google Play Console, under
  [Release management -> App releases](https://play.google.com/apps/publish/#ManageReleasesPlace:p=com.zulipmobile&appid=4976350040864490411).

* Upload as a release
  [on GitHub](https://github.com/zulip/zulip-mobile/releases).

### iOS

* Build and upload from Xcode.

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

    * If you get an error like "No accounts with iTunes Connect access have
      been found for the team ...", followed by your account name with the
      message "No iTunes Connect access for the team": this is an error
      [often reported, with varying causes][so-xcode-upload-fail].  A
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

    * For the options "Include bitcode for iOS content" and "Upload
      your app's symbols...", keep both options enabled.

    * For signing, select "Manually manage signing".  Choose the
      provisioning profile called "XC iOS: org.zulip.Zulip".
      (On your first upload, you'll choose at this screen to download
      the provisioning profile.)

[xcode-upload]: https://help.apple.com/xcode/mac/9.0/#/dev442d7f2ca
[so-xcode-upload-fail]: https://stackoverflow.com/questions/46231372/xcode-8-3-3-no-accounts-with-itunes-connect-access
[application-loader]: https://help.apple.com/itc/apploader/#/apdATD1E12-D1E1A1303-D1E12A1126

* Distribute from [iTunes Connect][itunes-connect].

  * A tip: use Safari when working with iTunes Connect.  It's still
    buggy and slow, but not as buggy as it is in Chrome.

  * The new build will appear first in
    [Activity -> iOS History -> All Builds][itc-builds], with the
    caveat "(Processing)" next to its build number.  If it doesn't
    appear there, look for an email from Apple explaining why; this
    can happen if an automated check doesn't like it.

  * Processing takes a few minutes, and we get an email from Apple
    when it's complete.

  * After processing is complete, you can add the build to TestFlight
    so it goes to our beta users.  Go to [TestFlight ->
    Testers & Groups -> External Testers -> Builds][itc-external-builds],
    and hit the "+" icon at the top of the list of builds to enter a
    modal dialog.

    * Leave the username and password (for the Apple reviewer)
      unchanged.

    * Enter notes for testers.

  * The build will go into "Beta App Review".  This typically comes
    back in hours, not days; if successful, the app is out in beta!

[itunes-connect]: https://itunesconnect.apple.com/
[itc-builds]: https://itunesconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1203036395/activity/ios/builds
[itc-external-builds]: https://itunesconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1203036395/testflight?section=group&subsection=builds&id=1bf18c25-da12-4bad-8384-9dd872ce447f

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

  * In iTunes Connect for the app, [go to the "App Store" tab][itc-main], and
    hit the "+ Version" button at the bottom of the left sidebar.  Enter the
    version number.  This creates a new draft listing.

  * In the draft listing, scroll down to the "Build" section and hit the "+"
    icon next to the "Build" heading.  Select the desired build.

  * Fill in the "What's New in This Version" input at the top.  Optionally,
    update the previews/screenshots, and the description and other text.

  * At the top of the draft listing, hit "Save" and then "Submit for Review".

  * For the "Advertising Identifier (IDFA)" question, select No.

  * The draft listing should enter state "Waiting for Review".  From here,
    it typically takes a couple of days to get a result from the Apple review
    process; if it passes review, the app will go live.

[itc-main]: https://itunesconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1203036395

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

In Xcode, sign in to your Apple developer account that is a member of
the "Kandra Labs, Inc." team.  In the "ZulipMobile" center pane that
appears when first opening the project in Xcode, this is under the
"General" tab (the first one shown), in the "Signing" section.

You'll need the private key for the distribution certificate.  To
install that:

* Get an export from someone who has the key.  Give it a filename
  ending in `.p12`.

* Open the "Keychain Access" app, and go to File -> Import Items... to
  import the file.  You'll also need a password, which the same person
  can give you.
