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

## Setting up the Android emulator

In React Native's 
[Getting Started](https://facebook.github.io/react-native/docs/getting-started.html)
instructions, within the tab "Building Projects with Native Code",
follow the instructions under the heading "Using a virtual device".

You no longer need Android Studio after this setup step; you can start
the emulator [from the command
line](https://developer.android.com/studio/run/emulator-commandline.html).

Then to build and run the app: `react-native run-android`

## Setting up a physical Android device

Follow the React Native instructions titled
[Running On Device](https://facebook.github.io/react-native/docs/running-on-device.html).

Then to build and run the app: again, `react-native run-android` .

You may need to uninstall Zulip first, if the device has it installed
from the Play Store.
