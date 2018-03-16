# Android setup

## SDK setup

* Install the Android SDK including API 23 (Android 6.0), Build Tools, API Platform, Google APIs, Google Play Services, Android Support Library, the Local Maven Repository for Support and the Google Repository.

  All of these can be installed, together with their dependencies, using the Android SDK manager.

* Alternate method: Open `zulip-mobile/android` in Android Studio, fix dependancy issues by installing all packages and run.

## Running on Android simulator
`Virtual Android device` can be created by using Android Studio
1. Navigate to `Tools/Android/AVD Manager`.
2. Click on `Create Virtual Device...` and choose the device to be used for testing
3. Click on `Next`.
4. Choose the Api level or image to be tested on and click `Next`.
5. Click on `Finished`.

Now a `Virtual Android device` has been created.

Then to run, the command `react-native run-android` will launch a new
terminal with the React Native packager and open up the app in the
active Virtual Device.

## Running on Android device
USB debugging must be active on the Android Device.
Make sure to uninstall Zulip from Play Store.

Then to run, connect your Android device to PC, and
`react-native run-android` will build the application and install
the app on your android device.
