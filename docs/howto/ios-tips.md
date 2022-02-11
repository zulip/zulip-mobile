# iOS Tips

These tips assume you've already [set up a dev
environment](build-run.md#main-steps) for Zulip Mobile.

## Running on iOS simulator
`react-native run-ios` will launch a new terminal with the React Native
packager and open up the app in the iOS simulator.

It will also launch a browser tab in Chrome with the React Native debugger.
`console.log` statements in React Native will end up in the JS console on
this tab.

## Running on an iOS device
1. Connect your iOS device
2. Within the repo, `$ open ios/ZulipMobile.xcworkspace/` to open
   Xcode. Make sure you choose the one that ends in .xcworkspace,
   not .xcodeproj.
3. Change BundleIdentifier for ZulipMobile to a unique string, e.g.
   `<username>ZulipMobile` in the 'General Tab' of your project.
4. Select your device as the `build target` (from [this guide](https://reactnative.dev/docs/running-on-device))
5. Hit the `build and run` button (make sure your device is unlocked)
6. If it's the first time you're running the app, you need to trust the
developer and the app in `Settings > General > Device Management > Developer
App` - make sure you are connected to WiFi, as it often doesn't work with
mobile networks

If it's your first time installing an app on an iOS device, you need to
obtain Apple Developer credentials that will allow you to sign the app.
Register at https://developer.apple.com. Then use your Apple ID in Xcode
and choose it as your `Signing > Team` for ZulipMobile.

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


## Troubleshooting

Take a look at [the troubleshooting
section](build-run.md#troubleshooting) in our build-run.md.


## Sign in with Apple

To set up your [development server](./dev-server.md) to use Apple
authentication ("Sign in with Apple"), you'll want to follow almost
[these
steps](https://zulip.readthedocs.io/en/latest/production/authentication-methods.html#sign-in-with-apple),
but with a few things to keep in mind:

- If you don't have your own Apple Developer account (there's an
  annual fee), please ask Greg to set up test credentials and send
  them to you.
  These will be associated with the Kandra team, so
  [please](https://chat.zulip.org/#narrow/stream/3-backend/topic/apple.20auth/near/915391)
  let him know when you're finished with the credentials so he can
  revoke them. Please don't abuse them with deliberate spam, as
  that goes on our reputation.
- Use the domain `zulipdev.com` where Apple asks for a domain;
  [`localhost` won't
  work](https://chat.zulip.org/#narrow/stream/3-backend/topic/Apple.20Auth/near/831533).
  On the public Internet, `zulipdev.com` resolves to `127.0.0.1`.
  - `127.0.0.1` (also what `localhost` points to) points to the
    machine you're on. When you're on a physical device, that's the
    device itself, not the device (your computer) that's running the
    dev server. So you won't be able to connect using `zulipdev.com`
    on a physical device.
  - Empirically, there's no problem using the iOS simulator on the
    computer running the dev server; it seems the iOS simulator shares
    its network interface with the computer it's running on. To use
    the native flow, you will be able to sign into the simulator at
    the "device" level just as you would on a real device.
  - Temporarily allow the app to access `http://zulipdev.com` as
    described in the section on `NSAppTransportSecurity` exceptions,
    below.

To test the native flow, which uses an Apple ID you've authenticated
with in System Preferences, go to the ZulipMobile target in the
project and targets list, and, under General > Identity, set the
Bundle Identifier field to your development App ID (a.k.a. Bundle ID).
If you've already installed a build that used the canonical Bundle
Identifier, you'll see two app icons on your home screen. Be sure to
open the correct one; it might be easiest to delete them both and
reinstall to prevent any doubt.

You should now be able to enter `http://zulipdev.com:9991` (not
`https://`), see the "Sign in with Apple" button, and use it
successfully.


<div id="disable-ats" />

## Adding `http://` exceptions to `NSAppTransportSecurity` in `Info.plist`

If you need to connect to `http://zulipdev.com` or another host with
the insecure `http://`, you'll need to tell the app to make an
exception under iOS's "App Transport Security" (ATS), either to allow
access any host with `http://`, or just to specific domains.

These exceptions should never be committed to main, as there aren't
any insecure domains we want to connect to in production.

To disable ATS restrictions for all network connections, add the
following in `ios/ZulipMobile/Info.plist`:

```diff
   <key>NSAppTransportSecurity</key>
+  <key>NSAllowsArbitraryLoads</key>
+  <true/>
   <dict>
     <key>NSExceptionDomains</key>
     <dict>
       <key>localhost</key>
       <dict>
         <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
         <true/>
       </dict>
     </dict>
   </dict>
```

To add an exception for just the `zulipdev.com` domain, add the
following in `ios/ZulipMobile/Info.plist`:

```diff
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSExceptionDomains</key>
     <dict>
       <key>localhost</key>
       <dict>
         <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
         <true/>
       </dict>
+      <key>zulipdev.com</key>
+      <dict>
+        <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
+        <true/>
+      </dict>
     </dict>
   </dict>
```

See
[discussion](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Apple.20ATS.20for.20debug/near/883318)
for more convenient solutions if we find we have to allow this
regularly.
