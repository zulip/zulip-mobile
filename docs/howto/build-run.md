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

* For running `tools/run-android` or any other build commands,
  use the Git Bash prompt.  The Windows Command Prompt isn't supported.

* Or, if you'd like a richer command-line environment and are up for
  trying a beta install process, you can do your Zulip app development
  through the WSL `bash` command line.  To do that: instead of using
  the instructions below, see our [draft guide for using
  WSL](windows-wsl.md).


## Main steps

Before starting, install these dependencies if you don't have them:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/download/package-manager/): use the
  **latest 12.x** version, not 14.x or later
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
Native upstream on [Setting up the development environment][rn-setup].
You want the tab "React Native CLI Quickstart"; the "Expo CLI Quickstart" does
not apply.

If you're starting with iOS development, be sure to [install
CocoaPods](https://guides.cocoapods.org/using/getting-started.html),
as the guide instructs, then rerun `yarn`.

Continue those instructions until you can run the Zulip Mobile app
with one of the following:

- `tools/run-android`
- `react-native run-ios`
- in Xcode, if on macOS (see [iOS tips](ios-tips.md))
- in Android Studio (see "Android tips", below)

You'll want to be able to use both an emulator and a physical device; but
for starting out, just get either one working so you can play with the app.

Once you have it running, look at our [debugging tips](debugging.md)
to help see what's happening in the code.  On your first sitting, just
get as far as using the Chrome Developer Tools, which is easy to set
up and powerful for working on most areas of the app.  Later, you
might look through the other tools and try some more of them out.

[rn-setup]: https://reactnative.dev/docs/environment-setup


## Android tips

* To set up the Android emulator, follow the heading "Using a virtual device" in
  the React Native [setup instructions][rn-setup]. After you
  set up the emulator in Android Studio, you can start it [from the command
  line][android-emu-cmd-line].
* To build to a physical Android device, you may also need to install the
  Android NDK. In Android Studio's SDK Manager, under the **SDK Tools** tab,
  select **NDK (Side by side)** for installation; then click **OK** or
  **Apply**.
* When running on a physical device, if the device has Zulip installed
  from the Play Store, you may need to uninstall that version first.
* Commands once you've set up:
  * `tools/run-android` - build, then run on an active emulator
    or USB-connected device.  This won't start the emulator automatically.
  * `yarn build:android-nokeys` - build an APK in release mode, just
    skipping Sentry setup (which requires an authentication token), and
    using your debug keystore for signing.  The output APK will be at
    `android/app/build/outputs/apk/release/app-release.apk`.
  * `yarn build:android-nokeys -Psigned` - build an APK in release
    mode, just skipping Sentry setup (which requires an authentication
    token).  The output APK will be at
    `android/app/build/outputs/apk/release/app-release.apk`.

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

Apart from the steps mentioned below, you may find the
[React Native troubleshooting docs] to be helpful.

[React Native troubleshooting docs]: https://reactnative.dev/docs/troubleshooting


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

### Build failure: java.nio.file.NoSuchFileException: /Users/chrisbobbe/dev/zulip-mobile/android/app/build/intermediates/

When trying to build the Android app, you may see this error:

```
java.nio.file.NoSuchFileException: /Users/chrisbobbe/dev/zulip-mobile/android/app/build/intermediates/external_file_lib_dex_archives/debug/out
  at sun.nio.fs.UnixException.translateToIOException(UnixException.java:86)
  at sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:102)
  at sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:107)
  at sun.nio.fs.UnixFileSystemProvider.newDirectoryStream(UnixFileSystemProvider.java:407)
```

Try removing `android/.gradle`, running `./gradlew clean` from
`android/`, and building again.

### Build failure: No file known for: classes.dex

When trying to build the Android app, you may see this error:

```
Execution failed for task ':app:packageDebug'.
> A failure occurred while executing com.android.build.gradle.internal.tasks.Workers$ActionFacade
   > No file known for: classes.dex
```

Try removing `android/.gradle`, running `./gradlew clean` from
`android/`, and building again.

### Build failure: java.lang.UnsupportedClassVersionError, "Unsupported major.minor version 52.0"

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


### Build failure: java.lang.UnsupportedClassVersionError, "Unsupported class file major version 57"

When trying to build the Android app, you may see this error:

```
* Where:
Build file '/Users/jappleseed/dev/zulip-mobile/node_modules/@unimodules/react-native-adapter/android/build.gradle'

* What went wrong:
Could not compile build file '/Users/chrisbobbe/dev/zulip-mobile/node_modules/@unimodules/react-native-adapter/android/build.gradle'.
> startup failed:
  General error during semantic analysis: Unsupported class file major version 57

  java.lang.IllegalArgumentException: Unsupported class file major version 57
        at groovyjarjarasm.asm.ClassReader.<init>(ClassReader.java:184)
        at groovyjarjarasm.asm.ClassReader.<init>(ClassReader.java:166)
        at groovyjarjarasm.asm.ClassReader.<init>(ClassReader.java:152)
        at groovyjarjarasm.asm.ClassReader.<init>(ClassReader.java:273)
[...]
```

This can sometimes happen if you're using JDK 13 to invoke the build
command (e.g., when calling `tools/run-android`, or
`tools/test android`, or
`android/gradlew -p android :app:assembleDebug`). You can check the
version by running `java -version`. It seems that upgrading to
macOS 10.15 Catalina automatically upgrades Java to 13.

Somehow, JDK 8 is getting involved, and trying to use classfiles that
it doesn't understand because they were created with JDK 13. We're not
sure how JDK 8 is getting involved; it still seems to be involved
after locating and killing some Gradle-related processes with
`ps auxwww | grep gradle` that were using a JDK 8 installation that's
bundled with Android Studio (yours, if you have one, might be at
"/Applications/Android Studio.app/Contents/jre/jdk/Contents/Home/jre/bin/java").

A solution, if you can't find why JDK 8 is getting involved and
prevent that, is to ensure those classfiles are also created with
JDK 8. (JDK 11 might also work; we haven't tested this.)

1. First, find a JDK installation. When you check a Java
   version, note that the version number will start with "1.8" for
   JDK 8.
   - As noted above, you may have a JDK installation included in
   Android Studio at a path like the one above. Check its version
   by running, e.g.,
   `"/Applications/Android Studio.app/Contents/jre/jdk/Contents/Home/jre/bin/java" -version`.
   - Otherwise, on Ubuntu or Debian, you can install it with
   `sudo apt install openjdk-8-jdk`.
   - In general, you can [download it from Oracle][jdk-8-oracle-dl].
2. Find a path to that installation to set `JAVA_HOME` to. (This is
   used by `gradlew` to find the `java` command to run Gradle under.)
   - If you used the installation included in Android Studio, take
     that path minus the "/jre/bin/java" at the end, e.g.,
     "/Applications/Android Studio.app/Contents/jre/jdk/Contents/Home".
   - If you installed the Debian/Ubuntu package, then
     `ls -l /usr/lib/jvm/` should list `java-8-openjdk-amd64` or
     something similar to that.
3. Using the path from step 2, prefix your build command with
   `JAVA_HOME=[that path] ` (for example,
   `JAVA_HOME=... android/gradlew ...`), and see if that works.
4. If it does, you can run `export JAVA_HOME=[that path]` by itself,
   so future build commands in the same terminal window will be able
   to use it. You can also add that line to your `~/.bashrc` or
   equivalent so you don't have to repeat it in new terminal windows.

You can read the debugging conversation around [here](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Android.20build.3A.20unimodules/near/844331).

[jdk-8-oracle-dl]: http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html

### Build failure: Task 'installDebug' not found in project ':app'

When trying to build the Android app, you may see this error:

```
* What went wrong:
Task 'installDebug' not found in project ':app'.
```

This (somewhat misleading) error message can occur when the Android
SDK is not fully configured.  Creating a new React Native project (per
[the upstream docs][rn-setup]), and running `react-native
android` there, may give clearer error messages for debugging.


### Build failure after running `react-native link`

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

or, when trying to build the iOS app, if you get several errors like
this:

```
Multiple commands produce '/Users/jappleseed/Library/Developer/Xcode/DerivedData/ZulipMobile-gdifomwwvfiwepckshlwoludvdct/Build/Products/Debug-iphonesimulator/ZulipMobile.app/Fontisto.ttf':
1) Target 'ZulipMobile' (project 'ZulipMobile') has copy command from '/Users/jappleseed/dev/zulip-mobile/node_modules/react-native-vector-icons/Fonts/Fontisto.ttf' to '/Users/jappleseed/Library/Developer/Xcode/DerivedData/ZulipMobile-gdifomwwvfiwepckshlwoludvdct/Build/Products/Debug-iphonesimulator/ZulipMobile.app/Fontisto.ttf'
2) That command depends on command in Target 'ZulipMobile' (project 'ZulipMobile'): script phase “[CP] Copy Pods Resources”
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
(along with any other edits you've made!) by running
`git reset --hard`.


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

This happens if you try to run the build from the Windows Command
Prompt.  Instead, when running any command that runs our code, like
`tools/run-android` or `tools/test`, use the Git Bash prompt to
run the command.


### Build failure: "input file cannot be found", on `.../react-native/third-party/...`

When trying to build the iOS app, if you get an Xcode error like this
(edited slightly for readability):

```
error: Build input file cannot be found:
  '[...]/zulip-mobile/node_modules/react-native/third-party/double-conversion-1.1.6/src/bignum.cc'
  (in target 'double-conversion' from project 'React')
```

then try restarting Xcode.


### Build failure: 'No "iOS Development" signing certificate'

When trying to build the iOS app, if you get an error like this (in
e.g. the `tools/ios build` log file; edited slightly for readability):

```
error: No signing certificate "iOS Development" found:
  No "iOS Development" signing certificate matching team ID "66KHCWMEYB"
  with a private key was found. (in target 'ZulipMobile' from
  project 'ZulipMobile')
```

then a possible root cause of the missing certificate is that the
team's Apple Developer Program membership needs to be renewed.
Once the membership is fixed, the certificate should be generated
automatically when needed.

To inspect what certificates exist, see Xcode > Settings > Accounts.
When all is well, there should be a cert of type "Apple Development"
in the list of certs associated with the team.  (The reference in the
error message to "iOS Development" corresponds to an alternative type
which was the normal one before ca. 2020 and is still accepted.)

Despite the reference to development, this error can appear when
attempting a build for release.


### App shows a blank white screen

If you're developing on a Linux machine, and when you start the dev version of
the app (either in an emulator or on a device) you just get a blank white
screen, you may have hit your system's limit for inotify watches.  You can
increase this limit with the following commands:
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```


### Debug app crashes with "Unable to load script" at startup

After running `tools/run-android` or `react-native run-ios`, if
you see an error like this on the device:

> Unable to load script. Make sure you're either running a Metro
> server (run 'react-native start') or that your bundle
> 'index.android.bundle' is packaged correctly for release.

then this means you are not running the Metro bundler.

Starting from React Native 0.60, you need to launch the Metro bundler server
separately, using `react-native start`. Once the server starts up, run
`tools/run-android` again, and the app should not crash.


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

Sometimes, the build cache from previous builds can cause issues, and cleaning
it can help:

```
cd android && ./gradlew clean
```

Optionally, reset iOS simulator:

```
iOS Menu > Simulator > Reset Content and Settings…
```

If you get other iOS build failures and you haven't changed anything
in the `ios` folder yourself, and you're on the latest version of
Xcode, there might be residue from a previous build interfering in
this one. So, try cleaning the build folder, following the
instructions at [iOS tips](ios-tips.md#clearing-the-build-folder)
