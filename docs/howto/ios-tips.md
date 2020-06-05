# iOS Tips

These tips assume you've already [set up a dev
environment](build-run.md#main-steps) for Zulip Mobile.

## Running on iOS simulator
`react-native run-ios` will launch a new terminal with the React Native
packager and open up the app in the iOS simulator.

It will also launch a browser tab in Chrome with the React Native debugger.
`console.log` statements in React Native will end up in the JS console on
this tab.

## Other commands

* `yarn ios-min` - runs in an iOS simulator in the minimally supported device
(currently iPhone 5S)

* `yarn ios-max` - runs in an iOS simulator in the newest/most premium
supported device (currently iPhone X)

* `yarn ios-device` - runs on a physical iOS device, you need to edit the
device name in package.json

## Running on an iOS device
1. Connect your iOS device
2. Within the repo, `$ open ios/ZulipMobile.xcworkspace/` to open
   Xcode. Make sure you choose the one that ends in .xcworkspace,
   not .xcodeproj.
3. Change BundleIdentifier for both ZulipMobile and ZulipMobileTests to a
unique string, e.g. `<username>ZulipMobile` in the 'General Tab' of your project.
4. Select your device as the `build target` (from [this guide](https://facebook.github.io/react-native/docs/running-on-device.html))
5. Hit the `build and run` button (make sure your device is unlocked)
6. If it's the first time you're running the app, you need to trust the
developer and the app in `Settings > General > Device Management > Developer
App` - make sure you are connected to WiFi, as it often doesn't work with
mobile networks

If it's your first time installing an app on an iOS device, you need to
obtain Apple Developer credentials that will allow you to sign the app.
Register at https://developer.apple.com. Then use your Apple ID in Xcode
and choose it as your `Signing > Team` for both ZulipMobile and ZulipMobileTests.

### Tips when running on your iOS device
When you change the BundleIdentifier and Team (required in order to run on a device),
it **will** modify your `.pbxproj` file, which you do **not** want unless you intend
to.

If you are simply testing it on the iOS device, simply do not stage
the said file to be committed.

If other changes to the `.pbxproj` file are needed (and they shouldn't
usually be, especially after we started managing our iOS dependencies
with CocoaPods), it's recommended that you put them in their own
commit, first, and leave the BundleIdentifier and Team changes
unstaged. Later, you can always [squash that commit with other
commits][fixing-commits], if appropriate.

[fixing-commits]: https://zulip.readthedocs.io/en/latest/git/fixing-commits.html

## Clearing the build folder

If you get build failures on iOS and you haven't changed anything in
the `ios` folder yourself, and you're on the latest version of Xcode,
there might be residue from a previous build interfering with this
one. So, try cleaning the build folder with `rm -rf`. A different
folder is used for command-line builds and builds through Xcode.
- If building from the command line with `react-native run-ios`, run
  `rm -rf ios/build`.
- If building in Xcode, the build folder is at a path like
  `~/Library/Developer/Xcode/DerivedData/ZulipMobile-diuocloqwafvdpeozujwphdrhalf`
  (the hash at the end will be different) by default, but if it's not
  there, you can find it in Xcode at File > Workspace Settings > Build
  Location.

## Clearing `ios/Pods`

If you didn't touch anything in `ios/Pods` but you're still seeing
some automatic changes in `ios/Podfile.lock` after you run `yarn` (or
just `pod install`), try running `rm -rf ios/Pods` and running `yarn`
again.

It seems like there's some caching strategy to avoid fetching
`.podspec` files unnecessarily, potentially with network requests.
(See
[discussion](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/.23M3548.20RN.20v0.2E60.2E0.20upgrade/near/896746).)
