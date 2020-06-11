# Using a React Native version from Git

When there's an issue in React Native, or some behavior in it that requires
investigation, it can be helpful to use a version of RN from your own Git
clone which you can make changes to.

This guide describes how to use an RN version from Git in a small test app,
which is helpful for reporting and investigating issues upstream.  Doing so
for Zulip Mobile itself will be another subject.

## iOS

No data.  It would be good for someone to work out how to do this on iOS
and fill in this section.

## Android

There is [an upstream
doc](https://reactnative.dev/docs/building-from-source.html)
for this.  Ideally it would make these instructions unnecessary, but it's
not very clear or complete.

Instead, try following these instructions.  We'll refer to sections of that
doc for specific things where it's helpful.

There are a lot of gotchas in this process, and the error messages they
produce tend to be cryptic.  See the "Troubleshooting" section below.
Please add to it with any additional issues you run into and their solutions.

**NOTE**: Although these instructions were tested and debugged when
new, on RN 0.55; they haven't been updated for newer RN versions and
will need some changes.

### One-time (per-machine) setup

1. You'll need the Android SDK.  You already have this if you've
   successfully set up a Zulip Mobile dev environment and built the app for
   Android.

2. You'll need the Android NDK, the "native development kit".  Don't follow
   the standard Android instructions for this; those will get you a current
   version, and React Native requires a specific old version, namely release
   10e, which is from 2015.  (NB: This is one thing that changed in RN
   0.57; this was updated to NDK r17b, the latest.)

   * Instead, download the appropriate zip file [linked
     here](https://reactnative.dev/docs/building-from-source.html#download-links-for-android-ndk)
     and unzip it somewhere convenient.

   * If your Android SDK is at `~/Android/Sdk`, you might put the NDK at
     `~/Android/Sdk/ndk-r10e`.  The location doesn't matter; you'll just
     need to set it as `ndk.dir` below.

   * Note: The NDK is 3.7 GB in size, and the zip file is 1.2 GB.  Make sure
     you have enough free disk space first.

### Per-project setup

1. Create the test app, if you don't have one already.  You'll want
   `react-native init`; not `create-react-native-app`, which creates an Expo
   app.  Expo is an extra layer that makes this more complicated.

2. Remove `node_modules/react-native/`, and replace it with a Git clone.
   Optionally, if you already have another clone somewhere of the RN repo,
   you can mention it to the `git clone` command with `--reference` to save
   some disk space.

3. Optionally, make Git in the app track your RN clone as a "submodule".

   a. In `.gitignore` for the app, replace the line `node_modules/` with
      these two lines, to make Git stop ignoring the clone's path:

       node_modules/*
       !node_modules/react-native/

   b. Run `git submodule add git@github.com:facebook/react-native node_modules/react-native`.

   c. Commit the result.

4. Follow the various steps in [this
   doc](https://reactnative.dev/docs/building-from-source.html#building-the-source)
   that involve tweaking several Gradle files located under `android/` in
   the app.  Commit the result.

5. Optionally, you might upgrade the versions of Gradle in
   `android/gradle/wrapper/gradle-wrapper.properties` and of the Android
   Gradle Plugin in `android/build.gradle`.  If you do, you'll also want to
   add `google()` in both `repositories` blocks in `android/build.gradle`.
   This upgrade isn't necessary, though, and may not be helpful.

6. Create or edit the file `android/local.properties` in your app worktree
   (it's ignored and you won't commit it, because it's configuration that's
   local to your machine), with two settings:

   * `sdk.dir` is just like in the same file in your Zulip Mobile worktree.

   * `ndk.dir` is the directory you unzipped the Android NDK as, above.

### Build and run

Now `react-native run-android` in your app should work!

And if you `cd node_modules/react-native`, then check out a different
version or make an edit, and `cd` back, then `react-native run-android`
should again work and use the new version.

### Troubleshooting

#### `react-native start` aborts

You might see a failure like this:

```
$ react-native start
Scanning folders for symlinks in /home/greg/z/tmp/rn-textinput/node_modules (15ms)

Cannot read property 'length' of undefined

$
```

where `react-native start` promptly aborts and doesn't serve the app.

The cause is unknown.  This seems to happen on some RN versions but not
others -- in particular, it happens on v0.54.4, and on some early versions
after the 0.54 branch, but later versions leading up to v0.55 work fine.

It'd be good to determine exactly what version fixes it; that should help
find a way to fix it for older versions.

#### Build failure about `registerGeneratedResFolders`

When trying to build the app, you might see a failure like this:

```
Building and installing the app on the device (cd android && ./gradlew installDebug)...
Incremental java compilation is an incubating feature.

FAILURE: Build failed with an exception.

* Where:
Script '/home/greg/z/tmp/rn-textinput/node_modules/react-native/react.gradle' line: 82

* What went wrong:
Could not find method registerGeneratedResFolders() for arguments [file collection] on object of type com.android.build.gradle.internal.api.ApplicationVariantImpl.
```

This was a regression in one commit between v0.54 and v0.55, fixed in a
later commit in that range.  It affects older Gradle and/or Android Gradle
Plugin versions, including the default versions used by `react-native init`.

You can fix it by cherry-picking that revert onto whatever RN version you're
trying to build from: `git cherry-pick 3f8a04ba6`.

#### Build failure about `fbjni`

When trying to build the app, you might see a failure like this:

```
make: Entering directory `/home/greg/z/tmp/rn-textinput/node_modules/react-native/ReactAndroid/src/main/jni/react/jni'
/home/greg/Android/Sdk/ndk-bundle/build/core/build-binary.mk:688: Android NDK: Module reactnativejni depends on undefined modules: fbjni
make: Leaving directory `/home/greg/z/tmp/rn-textinput/node_modules/react-native/ReactAndroid/src/main/jni/react/jni'
/home/greg/Android/Sdk/ndk-bundle/build/core/build-binary.mk:701: *** Android NDK: Aborting (set APP_ALLOW_MISSING_DEPS=true to allow missing dependencies)    .  Stop.


FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':ReactAndroid:buildReactNdkLib'.
> Process 'command '/home/greg/Android/Sdk/ndk-bundle/ndk-build'' finished with non-zero exit value 2
```

This happens when trying to build with a current NDK, at least with release
17 (the latest as of mid-2018). You need release 10e; see above.

#### Could not find lint-gradle

When trying to build the app, you might see a failure like this:

```
FAILURE: Build failed with an exception.

* What went wrong:
Could not resolve all files for configuration ':ReactAndroid:lintClassPath'.
> Could not find com.android.tools.lint:lint-gradle:26.1.3.
```

This seems probably caused by upgrading the Android Gradle Plugin.  It's
fixed by adding `google()` in `allprojects` -> `repositories` in
`android/build.gradle`.
