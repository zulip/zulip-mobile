# Platform versions we support

## Android and iOS versions

### Policy

For our current minimum versions of Android and iOS, see [the
developer guide](../developer-guide.md).

Our general policy is:

* We routinely test and develop on the latest 1-2 versions of each of
  iOS and Android.

* We support older versions with primarily a lazy algorithm: when we
  learn about bugs, we fix them.
  * Also when writing platform-specific code, we rely on the
    facilities of the IDE (Android Studio or Xcode) to point out when
    an API doesn't exist on old versions, and write an appropriate
    conditional.

* Once the use of an old OS version (plus any older versions) falls
  below about 1-2% of our overall userbase on that platform, then if
  we learn things don't work or require effort to keep working, we
  just drop support for it.

* A few times a year, we consult updated statistics on what OS
  versions our users are using.  These are posted in [a long-running
  chat thread][versions-thread] on `#mobile`, and help inform
  decisions to drop support for a version as well as when to
  prioritize a feature that only works on new versions.

[versions-thread]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/platform.20versions/near/786467


### Data and commentary

Empirically, the way this works out is:

* Those 1-2 latest versions cover the majority of our users.
  * For example, when Android 10 was released in 2019-09, [Android 9
    was already][data-2019-09-android] on over 60% of our Android
    users' devices, and Android 8+ were on over 80%.
  * Similarly but more so: shortly before iOS 13 was released in
    2019-09, [iOS 12 was already][data-2019-09-ios] on over 95% of our
    iOS users' devices.

* Bug reports that turn out to be specific to an older OS version are
  vanishingly rare.
  * Of issues filed in the tracker, these seem to be <1% of them.
  * Of reviews on Google Play, a small fraction are from older OS
    versions, consistent with the distribution in our userbase, and
    the ratings in these reviews are consistent with our ratings
    overall.
    * Of the 43 reviews in the past year as of 2019-10, 1 is from
      Android 4.4 KitKat; 0 from Android 5 Lollipop; 4 from Android 6
      Marshmallow.  That's 5/43 = 12% on Android <=6.  Over the same
      period the fraction of our userbase on Android <=6 ranged from
      17% down to 8%, so that's right in line.
    * Moreover, as of late 2019, every complaint we've seen in these
      reviews is one we also hear from people on the latest OS
      versions.
  * Put another way: anything we're missing in our support for old
    OS versions doesn't rank among the most important issues with
    Zulip even for people using those versions.

* Among the complaints we hear from people who try using Zulip, we
  rarely (possibly never?) hear that the app didn't support their
  older device.  Meanwhile there are plenty of complaints we do hear
  regularly!

[data-2019-09-android]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/platform.20versions/near/786475
[data-2019-09-ios]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/platform.20versions/near/786471


History:
* We [dropped Android 4.1-4.3 Jelly Bean support][dropped-android-j]
  in 2018-08.  It represented 0.5% of our Android users, and we hadn't
  tested on it in a long time if ever.  Shortly thereafter, we
  confirmed that the app rendered quite badly there.
* We [dropped iOS 8 support][] in 2018-08.  It represented <1% of iOS
  users who tried Zulip, and we'd learned that it didn't run there.
* We [dropped iOS 9 support][] in 2019-07.  It was 0.4% of iOS users
  who tried Zulip, and an Xcode upgrade had dropped iOS 9 from the
  simulator.

[dropped-android-j]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/platform.20versions/near/625585
[dropped iOS 8 support]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/platform.20versions/near/628412
[dropped iOS 9 support]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/platform.20versions/near/771761


Related observations:

* Our userbase tends to be far more updated than the ecosystem at
  large, especially on Android.

  * For example, as of May 2019, Android 5 "Lollipop" (released in
    2014) and later had reached 88.5% of all devices connecting to
    Google Play; among users with Zulip installed, it had reached
    99.1% in figures from the previous month.

  * Broadly, the ratio new:old of devices which have at least a given
    version vs. those with an earlier version tends to be about 5-10x
    more for our Android users than for those on Google Play at large.


## Browser versions (for the WebView for the message list)

### Policy

For our current minimum versions of Chrome and (Mobile) Safari, see
the block comment at the top of `js.js`.

General policy:

* Our basic approach is the same as for OS versions:

  * We routinely test and develop on up-to-date platforms.

  * We support older versions primarily by a lazy algorithm; plus
    before using a fancy feature we consult a compatibility table,
    e.g. on MDN or on caniuse.com.

  * When an older version (and below) falls below 1-2% of our overall
    userbase, we simply drop support for it if faced with significant
    effort to keep it working.

* On iOS, there's little more to say, because the Safari version
  corresponds directly to the iOS version.  So for example so we'll
  support Mobile Safari 13 for exactly as long as we support iOS 13.

* On Android, we have additional choices, because the Chrome version
  (including in a WebView) is generally much more recent than the OS.

  * As a result, we may drop support for old Chrome versions as much
    as 2-3 years more recent than our oldest supported Android
    version.

  * Our support thresholds are always a version found in a stock
    emulator image for some past Android release, for practicality of
    testing.


### Data and commentary

Empirical details on Android Chrome versions found in WebViews:

* Starting in Android 4.4 KitKat (which is <= our minimum supported
  Android version), the browser in a WebView is updated as an APK 🎉,
  independently of the OS...
  * but [empirically][browser-data-2018-10] something like 10% of
    users are stuck on older versions than the latest 😞.
  * On the other hand, even of those 10%, a large majority still have
    newer versions than their OS was released with.

* In [data from 2018-10][browser-data-2018-10] based on web traffic to
  zulipchat.com, we found:
  * Among Chrome users on Android, about 90% had a "latest" version:
    either Chrome 69 or Chrome 70, as Chrome 70 was then in the middle
    of rolling out.
  * About 98% had at least Chrome 49.  That version was released
    2016-03, about 2.5 years earlier.
  * The oldest version in the data (excluding one that appeared to be
    an emulator, not a real user's device) was Chrome 37.
  * (These data don't precisely track what we really want to know: the
    mix of users may be different, and on some OS releases Chrome and
    the WebView implementation are separate APKs so may not always
    have the same version.  But they get updated the same way, so
    there's at least no obvious mechanism for one to be systematically
    more commonly up to date than the other.)
  * Android versions 4.4 K, 5 L, 6 M, 7 N, 8 O had originally shipped
    with Chrome versions 30, 37, 44, 51, 58 respectively (based on
    looking at stock emulator images.)
  * At that time about 17% of our Android users were on Android
    versions <=6 M -- far more than the 2% or so of Android users with
    Chrome versions older than what shipped with Android 7 N.

[browser-data-2018-10]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/platform.20versions/near/656679


Related observations:

* One strategy people use for dealing with old browsers is to
  automatically introduce polyfills en masse, e.g. from `core-js`
  driven by `@babel/preset-env`.

  * This has a significant cost in size and speed of code -- meaning
    it makes the app slower and more battery-draining for all users --
    which is why we don't pursue it.  See discussion in
    `tools/generate-webview-js` for details.
