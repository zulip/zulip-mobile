# Getting Started

## Why React Native?

* Support iOS and Android with one codebase
* Familiar web programming model (React + Javascript + Flexbox)
* Cross-platform, 90% code reuse between iOS and Android platforms

## Running

Run iOS:

* `react-native run-ios` - runs in an iOS simulator in the default supported device
(currently iPhone 6)

* `npm run ios-min` - runs in an iOS simulator in the minimally supported device
(currently iPhone 5S)

* `npm run ios-max` - runs in an iOS simulator in the newest/most premium
supported device (currently iPhone X)

* `npm run ios-device` - runs on a physical iOS device, you need to edit the
device name in package.json

Run Android:

* Install the Android SDK including API 23 (Android 6.0), Build Tools, API Platform, Google APIs, Google Play Services, Android Support Library, the Local Maven Repository for Support and the Google Repository.

All of these can be installed, together with their dependencies, using the Android SDK manager.

* `npm run android-min` or `npm run android-max` - runs in an Android emulator, emulator has to be run manually before this command

Alternate method: Open `zulip-mobile/android` in Android Studio, fix dependancy issues by installing all packages and run.

## Fix issues

If you are having issues running the code on your machine, either for the first time or after updating an outdated code with the latest, please run:

```
npm run reinstall
```

Optionally, reset iOS simulator:

```
iOS Menu > Simulator > Reset Content and Settings…
```
