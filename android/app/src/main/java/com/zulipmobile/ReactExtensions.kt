package com.zulipmobile

import com.facebook.react.ReactActivity
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactContext

/**
 * Like getReactInstanceManager, but just return what exists; avoid trying to create.
 *
 * When there isn't already an instance manager, if we call
 * getReactInstanceManager it'll try to create one... which asserts we're
 * on the UI thread, which isn't true if e.g. we got here from a Service.
 */
fun ReactNativeHost.tryGetReactInstanceManager(): ReactInstanceManager? =
    if (this.hasInstance()) this.reactInstanceManager else null

// A convenience shortcut.
fun ReactApplication.tryGetReactContext(): ReactContext? =
    this.reactNativeHost.tryGetReactInstanceManager()?.currentReactContext

/**
 * Like `.application`, but with a more specific type.
 *
 * This expresses the invariant that a ReactActivity's application
 * should always be a ReactApplication.
 */
val ReactActivity.reactApplication: ReactApplication
    get() = application as ReactApplication
