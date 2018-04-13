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

* Build iOS through Xcode - select Product -> Archive

* Invite people to TestFlight through iTunes Connect
https://itunesconnect.apple.com/

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
