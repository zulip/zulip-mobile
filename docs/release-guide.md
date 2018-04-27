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

  * In the Archives organizer, select the archive and hit the button
    "Upload to App Store...".  Follow the instructions in the [Xcode
    docs on uploading][xcode-upload].

    * For the options "Include bitcode for iOS content" and "Upload
      your app's symbols...", keep both options enabled.

    * For signing, select "Manually manage signing".  Choose the
      provisioning profile called "XC iOS: org.zulip.Zulip".
      (On your first upload, you'll choose at this screen to download
      the provisioning profile.)

[xcode-upload]: https://help.apple.com/xcode/mac/9.0/#/dev442d7f2ca

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

* Promote an Android Beta to Production

* Submit a final iOS version, again through iTunes Connect 


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
