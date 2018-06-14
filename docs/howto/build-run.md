# Build and run the app

This guide describes how to build and run the app so you can develop it.

## Main steps

Before starting, install these dependencies if you don't have them:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/download/package-manager/), latest 8.x
  (LTS) version
* [Yarn](https://yarnpkg.com/en/docs/install), latest stable version

If you are using macOS, upgrade to the latest version of the OS and then to
the latest Xcode.

Then, run the commands below in your terminal:
```
git clone https://github.com/zulip/zulip-mobile
cd zulip-mobile
yarn install
```

Unlike the [Zulip Server](https://github.com/zulip/zulip) project, we use
the host machine directly for development, instead of provisioning a VM.

To install the React Native tools, and either Xcode or the Android SDK
and Android Studio, follow the helpful instructions from React
Native upstream on
[Getting Started](https://facebook.github.io/react-native/docs/getting-started.html).
You want the tab "Building Projects with Native Code";
the "Quick Start" does not apply.

Continue those instructions until you can run the Zulip Mobile app
with either `react-native run-android` or `react-native run-ios`.
You'll want to be able to use both an emulator and a physical device; but
for starting out, just get either one working so you can play with the app.

## Android tips

* To set up the Android emulator, follow the heading "Using a virtual device"
  in those React Native
  [Getting Started](https://facebook.github.io/react-native/docs/getting-started.html)
  instructions.
* After you set up the Android emulator, you no longer need Android
  Studio.  You can start the emulator [from the command
  line](https://developer.android.com/studio/run/emulator-commandline.html).
* When running on a physical device, if the device has Zulip installed
  from the Play Store, you may need to uninstall that version first.
* Commands once you've set up:
  * `react-native run-android` - build and run on an active emulator
    or USB-connected device
  * `npm run android-min` or `npm run android-max` - runs in an Android emulator, emulator has to be run manually before this command

## iOS tips

More wrinkles are involved; see our separate doc on [iOS tips](ios-tips.md).

## Troubleshooting

### Build failure: java.lang.UnsupportedClassVersionError

When trying to build the Android app, you may see this error:

```
A problem occurred evaluating project ':@remobile/react-native-toast'.
> java.lang.UnsupportedClassVersionError: com/android/build/gradle/LibraryPlugin : Unsupported major.minor version 52.0
```

You can fix this by installing a recent version of the Java SE Development
Kit -- [JDK 8 or newer](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).  You can check the installation with `java -version`,
which should show a version number starting with "1.8" (and not "1.7".)


### App shows a blank white screen

If you're developing on a Linux machine, and when you start the dev version of
the app (either in an emulator or on a device) you just get a blank white
screen, you may have hit your system's limit for inotify watches.  You can
increase this limit with the following commands:
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Other issues

If you are having issues running the code on your machine, either for the first time or after updating an outdated code with the latest, please run:

```
npm run reinstall
```

Optionally, reset iOS simulator:

```
iOS Menu > Simulator > Reset Content and Settings…
```

## Signing in to a local dev VM

This process needs improvement and has too many manual steps at the moment.
(It's not required for most development -- you can use chat.zulip.org,
or another live Zulip community you belong to, for testing the mobile app.)

If you haven't already, you'll want to install and provision a
[Zulip Server dev VM](https://zulip.readthedocs.io/en/latest/development/overview.html).

First, you'll need to connect your dev machine and iOS device to the same
network. If you're running Zulip inside of a VM, you may also need to
configure your VM to use a public network. See more information on this [here](https://www.vagrantup.com/docs/networking/public_network.html).

Next, you'll need to change all instances of `localhost:9991` in both the
`/src` directory and the Xcode iOS project (located in `/ios`) to point to
the IP and port of your Vagrant VM.

Finally, run the Xcode project inside of `/ios` with your iOS device as the
target.
