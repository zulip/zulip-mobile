# Build and run the app

This guide describes how to build and run the app so you can develop it.


## Per-platform notes

A few points will differ depending on your development platform.


**Linux**:
The instructions below should work fine on Linux, with no additional
details to worry about.


**macOS**:

* Before starting, upgrade to the latest version of the OS and then to
  the latest Xcode.  It's common for older versions of Xcode, even
  recent ones, to become unable to build.

  <!-- For example, by 2018-05, versions older than Xcode 9 no longer
       worked; that version was then just 8 months old, having been
       released 2017-09-19.  See commits 536718578 and 6bfced281. -->

* You'll need [GNU coreutils][] installed, e.g.  with `brew install
  coreutils`.

[GNU coreutils]: https://www.gnu.org/software/coreutils/


**Windows**:

* After installing Git, you'll also need to [install
  `rsync`][install-rsync].

[install-rsync]: https://serverfault.com/a/872557

* The build currently doesn't work from the Windows Command Prompt.
  (See issue [#3776][].)  Instead, when running `react-native
  run-android` or any other build commands, use the Git Bash prompt.

[#3776]: https://github.com/zulip/zulip-mobile/issues/3776

* If you'd like a richer command-line environment and are up for
  trying a beta install process, you can do your Zulip app development
  through the WSL `bash` command line.  To do that: instead of using
  the instructions below, see our [draft guide for using
  WSL](windows-wsl.md).


## Main steps

Before starting, install these dependencies if you don't have them:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/download/package-manager/): use the
  **latest 10.x** version, not 12.x or later
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

* To set up the Android emulator, follow the heading "Using a virtual device" in
  the React Native [Getting Started][rn-getting-started] instructions. After you
  set up the emulator in Android Studio, you can start it [from the command
  line][android-emu-cmd-line].
* To build to a physical Android device, you may also need to install the
  Android NDK. In Android Studio's SDK Manager, under the **SDK Tools** tab,
  select **NDK (Side by side)** for installation; then click **OK** or
  **Apply**.
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

The same problem has also been observed when using Node 10 on commits that were
made when we were using Node 8, prior to Greg's recommendation to switch to Node
10 in 4e5e31ac2. To fix the problem in that case, use Node 8.


### `yarn install` failure about "Detox"

This should only happen when building old versions of the app, from
before [PR #3504](https://github.com/zulip/zulip-mobile/pull/3504).

As mentioned there, these errors aren't critical.  This is a testing
framework which was never in our main build and test workflows, as we
never wrote more than a very small smoke-test for it.  Ignore the
error and carry on.


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
A problem occurred evaluating project ':@react-native-community_async-storage'.
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


### Build failure in `react-native-screens` or at `new RNNotificationsPackage()`

When trying to build the Android app, if you get an error like this:

```
> Task :react-native-screens:compileDebugJavaWithJavac FAILED
C:\Users\[...]\zulip-mobile\node_modules\react-native-screens\android\src\main\java\com\swmansion\rnscreens\LifecycleHelper.java:3: error: package androidx.lifecycle does not exist
import androidx.lifecycle.Lifecycle;
                         ^
[... lots more ...]
```

or like this:

```
[... lots of output ...]
[...]/MainApplication.java:45: error: constructor RNNotificationsPackage in class RNNotificationsPackage cannot be applied to given types;
            new RNNotificationsPackage(),
            ^
  required: Application
  found: no arguments
  reason: actual and formal argument lists differ in length
[...]

> Task :app:compileDebugJavaWithJavac FAILED

[...]
```

then check that `git status` shows you're running unmodified code from
our repo.  These errors can be caused by the modifications made if you
run the command `react-native link`.

Some React Native projects reportedly say in their build instructions
to run this command before building.  This is a bad practice: the
command edits the project's source files in heuristic ways, and so it
should always be a development step -- with the results committed to
the project's version-control repo -- and not a build step.  We don't
use it as a build step.

If you've run `react-native link`, you can discard the edits it made
(along with any other edits you've made) by running `git reset --hard`.


### Build failure in `:app:buildDebugStaticWebviewAssets`

When trying to build or run the app on Windows, you may see this
error:

```
> Task :app:buildDebugStaticWebviewAssets FAILED

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':app:buildDebugStaticWebviewAssets'.
> A problem occurred starting process 'command 'bash''
```

This is caused by issue [#3776][], which is a bug in our build system
that specifically affects the Windows Command Prompt.  To avoid the
issue, run commands like `react-native run-android` from the Git Bash
prompt instead of the Command Prompt.

[#3776]: https://github.com/zulip/zulip-mobile/issues/3776


### Build failure: "input file cannot be found", on `.../react-native/third-party/...`

When trying to build the iOS app, if you get an Xcode error like this
(edited slightly for readability):

```
error: Build input file cannot be found:
  '[...]/zulip-mobile/node_modules/react-native/third-party/double-conversion-1.1.6/src/bignum.cc'
  (in target 'double-conversion' from project 'React')
```

then try restarting Xcode.


### App shows a blank white screen

If you're developing on a Linux machine, and when you start the dev version of
the app (either in an emulator or on a device) you just get a blank white
screen, you may have hit your system's limit for inotify watches.  You can
increase this limit with the following commands:
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```


### Red error banner about method `-[RCTAppState getCurrentAppState:error:]`

This should only happen when building old versions of the app, from
before we upgraded to React Native 0.59.10 in commit dfbdd971b in
2019-07.

When trying to run the iOS app, if you get a red error screen with
this error message (edited slightly for readability):
```
Unknown argument type '__attribute__' in method
  -[RCTAppState getCurrentAppState:error:].
  Extend RCTConvert to support this type.
```
then you've encountered an incompatibility between Xcode 11 and older
versions of React Native.

To fix this, take a look at the [upstream
commit](https://github.com/facebook/react-native/commit/46c7ada535f8d87f325ccbd96c24993dd522165d)
that fixed the issue, and apply that one-line diff directly to the
file `node_modules/react-native/React/Base/RCTModuleMethod.mm`.


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
Node 8.  (Probably this means our Jest config doesn't have Babel set up
quite right.  Discussion [here][jest-babel-discussion].)

To fix this, use Node 10.x instead.  You can check what version is
installed by running the command `node --version`.

[jest-babel-discussion]: https://github.com/zulip/zulip-mobile/pull/3619#issuecomment-533349362


### Other issues

If you are having issues running the code on your machine, either for
the first time or after updating an outdated code with the latest,
in some cases it can help to delete the installed dependencies and
install them again from scratch:

```
rm -rf node_modules
yarn cache clean
yarn install
```

and then retry building and running.

Optionally, reset iOS simulator:

```
iOS Menu > Simulator > Reset Content and Settings…
```
