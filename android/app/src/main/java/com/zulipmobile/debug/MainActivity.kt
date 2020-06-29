package com.zulipmobile.debug

import com.zulipmobile.MainActivity

/**
 * Alias of our real MainActivity, for rn-cli's sake.
 *
 * This helps work around an issue in `react-native run-android` where it
 * doesn't notice that the APK it built has app ID `com.zulipmobile.debug`,
 * and tries to start app `com.zulipmobile` instead.
 *
 * See AndroidManifest.xml for more context.
 */
class MainActivity : MainActivity()
