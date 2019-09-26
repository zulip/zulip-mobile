# Build and run the app

This guide describes how to build and run the app so you can develop it.

## Main steps

(First, if using **macOS**: Upgrade to the latest version of the OS and then
to the latest Xcode.  In particular, Xcode versions before 9.0 are known to
definitely not work.)

(If using **Windows**: The step-by-step instructions below should work
fine on Windows.  Alternatively if you'd like a richer command-line
environment and are up for trying a beta install process, we have
[a draft guide](windows.md) for setting up Zulip app development to
use the WSL `bash` command line.)

Before starting, install these dependencies if you don't have them:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/download/package-manager/),
  latest 10.x (LTS) version
* [Yarn](https://yarnpkg.com/en/docs/install), latest stable version

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
You want the tab "React Native CLI Quickstart"; the "Expo CLI Quickstart" does
not apply.

Continue those instructions until you can run the Zulip Mobile app
with either `react-native run-android` or `react-native run-ios`.
You'll want to be able to use both an emulator and a physical device; but
for starting out, just get either one working so you can play with the app.

Once you have it running, look at our [debugging tips](debugging.md)
to help see what's happening in the code.  On your first sitting, just
get as far as using the Chrome Developer Tools, which is easy to set
up and powerful for working on most areas of the app.  Later, you
might look through the other tools and try some more of them out.

## Android tips

* To set up the Android emulator, follow the heading "Using a virtual device"
  in those React Native [Getting Started][rn-getting-started] instructions.
* After you set up the Android emulator, you no longer need Android
  Studio.  You can start the emulator [from the command line][
  android-emu-cmd-line].
* When running on a physical device, if the device has Zulip installed
  from the Play Store, you may need to uninstall that version first.
* Commands once you've set up:
  * `react-native run-android` - build, then run on an active emulator
    or USB-connected device.  This won't start the emulator automatically.
  * `yarn build:android-nokeys` - build an APK in release mode, just
    skipping Sentry setup (which requires an authentication token), and
    using your debug keystore for signing.  The output APK will be at
    `android/app/build/outputs/apk/release/app-release.apk`.
  * `yarn build:android-nokeys -Psigned` - build an APK in release
    mode, just skipping Sentry setup (which requires an authentication
    token).  The output APK will be at
    `android/app/build/outputs/apk/release/app-release.apk`.

[rn-getting-started]: https://facebook.github.io/react-native/docs/getting-started.html
[android-emu-cmd-line]: https://developer.android.com/studio/run/emulator-commandline.html

## iOS tips

More wrinkles are involved; see our separate doc on [iOS tips](ios-tips.md).

## Using a dev version of the server

This step is optional -- for most development you can use chat.zulip.org, or
another live Zulip community you belong to.  But sometimes when debugging
interactions with the server, or developing server-side changes related to
the mobile app, it's helpful to run the mobile app against a development
server which you control.

Setting this up involves a few steps, but it should be straightforward if
you follow the right instructions carefully.  Take a look at [our detailed
instructions](dev-server.md) and try them out.  If they don't work, please
report it in chat, with details on exactly what you did and what happened;
we'll help you debug, and then adjust the instructions so they work for the
next person with a setup like yours.


## Troubleshooting

### `yarn install` failure, at `fsevents`

When running `yarn install` on initial setup, if you see an error like
this:
```
warning Error running install script for optional dependency: "[...]/zulip-mobile/node_modules/fsevents: Command failed.
Exit code: 1
Command: node install
Arguments:
Directory: [...]/zulip-mobile/node_modules/fsevents
Output:
[... lots of output ...]

../../nan/nan_maybe_43_inl.h:112:15: error: no member named 'ForceSet' in 'v8::Object'
 return obj->ForceSet(isolate->GetCurrentContext(), key, value, attribs);
        ~~~  ^  return obj->ForceSet(isolate->GetCurrentContext(), key, value, attribs);

[... lots more output ...]
node-pre-gyp ERR! not ok
Failed to execute [...]
```
then this is a known error caused by using Node 11, which one of our
dependencies (`fsevents`) isn't yet compatible with.

To fix the problem, use Node 10.x instead.


### Bundling failure: Unable to resolve module ...

When running the app, you might see in the output of the Metro bundler
-- aka "the JS server", or `react-native start` -- an error like this
(reformatted for readability):

```
error: bundling failed: Error: Unable to resolve module `lodash.union`
  from `.../zulip-mobile/src/chat/chatReducer.js`:
  Module `lodash.union` does not exist in the Haste module map
```

This can happen when new dependencies have been added to
`package.json`.  In the example above, `lodash.union` was added.

To fix the problem, run `yarn`, which will update your installed
packages in `node_modules/` to match the current `package.json`.  You
might need to restart Metro / `react-native start` after doing so.


### Build failure: java.lang.UnsupportedClassVersionError

When trying to build the Android app, you may see this error:

```
A problem occurred evaluating project ':@remobile/react-native-toast'.
> java.lang.UnsupportedClassVersionError: com/android/build/gradle/LibraryPlugin : Unsupported major.minor version 52.0
```

This can happen if you have a very old version of the JDK (Java Development
Kit); React Native requires at least JDK 8, which was released in 2014.

To fix this, install a newer JDK.  As of 2019, we generally use [JDK
11][openjdk-11-dl] (which is [expected to be][jdk-lts-roadmap] the
latest LTS version until 2021).  You can check what version is
installed by running the command `java -version`; with JDK 8, the
version number starts with "1.8", and with JDK 11, it starts with
"11.".

[openjdk-11-dl]: https://adoptopenjdk.net/?variant=openjdk11
[jdk-lts-roadmap]: https://adoptopenjdk.net/support.html#roadmap


### Build failure: Task 'installDebug' not found in project ':app'

When trying to build the Android app, you may see this error:

```
* What went wrong:
Task 'installDebug' not found in project ':app'.
```

This (somewhat misleading) error message can occur when the Android
SDK is not fully configured.  Creating a new React Native project (per
[the upstream docs][rn-installation]), and running `react-native
android` there, may give clearer error messages for debugging.

[rn-installation]: https://facebook.github.io/react-native/docs/getting-started.html


### App shows a blank white screen

If you're developing on a Linux machine, and when you start the dev version of
the app (either in an emulator or on a device) you just get a blank white
screen, you may have hit your system's limit for inotify watches.  You can
increase this limit with the following commands:
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```


### Test failure: `SyntaxError: Unexpected token`

When running tests (with e.g. `tools/test`), you may see an error like
this (edited slightly for readability):

```
 FAIL  src/session/__tests__/sessionReducer-test.js
  ● Test suite failed to run

    Jest encountered an unexpected token

    This usually means that you are trying to import a file which Jest
    cannot parse, e.g. it's not plain JavaScript. [...]

        import('react-native-document-picker'));case 2:[...]
        ^^^^^^

    SyntaxError: Unexpected token import

    [...]
      at ScriptTransformer._transformAndBuildScript
          (node_modules/@jest/transform/build/ScriptTransformer.js:471:17)
      at ScriptTransformer.transform
          (node_modules/@jest/transform/build/ScriptTransformer.js:513:25)
      at Object.<anonymous>
          (src/compose/ComposeBox.js:30:43)
```

Typically when this happens it'll be repeated many times, across many
of our Jest unit tests.

This can happen if you're using an older version of Node, such as
Node 8.  (Probably this means our Jest config doesn't have Node set up
quite right.  Discussion [here][jest-babel-discussion].)

To fix this, use Node 10.x instead.  You can check what version is
installed by running the command `node --version`.

[jest-babel-discussion]: https://github.com/zulip/zulip-mobile/pull/3619#issuecomment-533349362


### Other issues

If you are having issues running the code on your machine, either for the first time or after updating an outdated code with the latest, please run:

```
yarn reinstall
```

Optionally, reset iOS simulator:

```
iOS Menu > Simulator > Reset Content and Settings…
```
