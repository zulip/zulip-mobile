# Developer guide

We target operating systems >= Android 4.4 (API 19) and >= iOS 8.0.

[React Native Getting Started](https://facebook.github.io/react-native/docs/getting-started.html)

## Why React Native?

* Support iOS and Android with one codebase
* Familiar web programming model (React + Javascript + Flexbox)
* Cross-platform, 90% code reuse between iOS and Android platforms

## System requirements

iOS version can be run only on a macOS, while Android can be run on Linux, Windows and macOS.

## Dev environment

Before starting, make sure you have [git](https://git-scm.com/) and
[Yarn](https://yarnpkg.com) installed.

Setting up a dev environment should be as simple as running the commands
below in your terminal:
```
git clone https://github.com/zulip/zulip-mobile.git
cd zulip-mobile
yarn install
```

Unlike the [Zulip](https://github.com/zulip/zulip) server project, we use
the host machine directly for development instead of provisioning a VM.

You may also want to install and provision a [Zulip dev VM](https://zulip.readthedocs.io/en/latest/development/overview.html) to use for
testing.

## Android

To set up for running on Android, follow our [Android setup doc](android-setup.md).

Once you've set up:
* `react-native run-android` - build and run on an active emulator
  or USB-connected device
* `npm run android-min` or `npm run android-max` - runs in an Android emulator, emulator has to be run manually before this command

## iOS

To set up for running on iOS, follow our [iOS setup doc](ios-setup.md).
Note the tips at the end.

Once you've set up:
* `react-native run-ios` - runs in an iOS simulator in the default supported device
(currently iPhone 6)

* `npm run ios-min` - runs in an iOS simulator in the minimally supported device
(currently iPhone 5S)

* `npm run ios-max` - runs in an iOS simulator in the newest/most premium
supported device (currently iPhone X)

* `npm run ios-device` - runs on a physical iOS device, you need to edit the
device name in package.json

## Fix issues

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

First, you'll need to connect your dev machine and iOS device to the same
network. If you're running Zulip inside of a VM, you may also need to
configure your VM to use a public network. See more information on this [here](https://www.vagrantup.com/docs/networking/public_network.html).

Next, you'll need to change all instances of `localhost:9991` in both the
`/src` directory and the Xcode iOS project (located in `/ios`) to point to
the IP and port of your Vagrant VM.

Finally, run the Xcode project inside of `/ios` with your iOS device as the
target.

## Formatting code using prettier

* Using atom editor - install the `prettier-atom` plugin
* Using the command line - run `npm run prettier`
