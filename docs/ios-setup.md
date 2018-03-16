# iOS Setup

## Running on iOS simulator
`react-native run-ios` will launch a new terminal with the React Native
packager and open up the app in the iOS simulator.

It will also launch a browser tab in Chrome with the React Native debugger.
`console.log` statements in React Native will end up in the JS console on
this tab.

## Running on an iOS device
1. [Set up the dev environment](#setting-up-a-dev-environment)
2. Connect your iOS device
3. Within the repo, `$ open ios/ZulipMobile.xcworkspace/` to open Xcode
4. Change BundleIdentifier for both ZulipMobile and ZulipMobileTests to a
unique string, e.g. `<username>ZulipMobile` in the 'General Tab' of your project.
5. Select your device as the `build target` (from [this guide](https://facebook.github.io/react-native/docs/running-on-device-ios.html))
6. Hit the `build and run` button (make sure your device is unlocked)
7. If it's the first time you're running the app, you need to trust the
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
to. For instance, if you linking a new dependency, your `.pbxproj` will be modified to
reflect the new changes.

If you are simply testing it on the iOS device, simply do not stage the said file to
be committed. On the other hand, if you are also adding a dependency, it is recommended
that you first `git commit` the dependency link modification itself, and then start
developing. This way, when you stage your intended changes, you can do a `git reset
path/to/.pbxproj` to discard any changes relating to the modification of the BundleIdentifier
and Team, and then continue to commit the rest of the files. When you prepare to push your
changes, you can just squash the initial commit with your later commits to retain a clean
commit history. This way, you won't have to deal with any merge conflicts or manual
deletion of the lines in your `.pbxproj` when you submit your code for a review.
