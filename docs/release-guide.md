# Release guide

## Configure Sentry error reporting

* Add Sentry API key and account: file `sentry.properties` change `auth.token`

* Set client key (DSN): file `config.js` set `sentryKey` value

## Prepare Android

* Generate Signed APK.

Put the release key file in `./android/app/my-release-key.keystore`

Make sure you have the file `~/.gradle/gradle.properties`:
```
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=zulip-mobile
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

## Release procedure

* Build Android release

```
npm run build:android
```

* Create a new release at
https://github.com/zulip/zulip-mobile/releases

* Upload generated APK file to Google Play Store
https://play.google.com/apps/publish/

* Build iOS through Xcode - select Product -> Archive

* Invite people to TestFlight through iTunes Connect
https://itunesconnect.apple.com/

* Promote an Android Beta to Production

* Submit a final iOS version, again through iTunes Connect 
