# Android setup

## SDK setup

You will need Android Studio, the Android SDK, and React Native.

To install all of these, follow the helpful instructions from React
Native upstream on
[Getting Started](https://facebook.github.io/react-native/docs/getting-started.html).
You want the tab "Building Projects with Native Code";
the "Quick Start" does not apply.

If you're new to Android development, expect this step to take some
time.  If you already have an Android environment set up, pay close
attention anyway; you may have to add some configuration.

## Running on Android simulator
`Virtual Android device` can be created by using Android Studio
1. Navigate to `Tools/Android/AVD Manager`.
2. Click on `Create Virtual Device...` and choose the device to be used for testing
3. Click on `Next`.
4. Choose the Api level or image to be tested on and click `Next`.
5. Click on `Finished`.

Now a `Virtual Android device` has been created.

You no longer need Android Studio after this setup step; you can start
the emulator [from the command
line](https://developer.android.com/studio/run/emulator-commandline.html).

Then to run, the command `react-native run-android` will launch a new
terminal with the React Native packager and open up the app in the
active Virtual Device.

## Running on Android device
USB debugging must be active on the Android Device.
Make sure to uninstall Zulip from Play Store.

Then to run, connect your Android device to PC, and
`react-native run-android` will build the application and install
the app on your android device.
