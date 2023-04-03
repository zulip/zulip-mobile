package com.zulipmobile

import com.facebook.react.ReactActivity
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.LifecycleState
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * A distillation of ReactContext.getLifecycleState() and related information.
 *
 * See ReactContext.getAppStatus().
 */
enum class ReactAppStatus {
    /**
     * The main activity has either never yet been in the foreground,
     * or never will again.  There might not be an active JS instance.
     */
    NOT_RUNNING,

    /**
     * The main activity has been in the foreground, is out of foreground
     * now, but might come back.  There must be an active JS instance.
     */
    BACKGROUND,

    /**
     * The main activity is in the foreground.
     * There must be an active JS instance.
     */
    FOREGROUND
}

val ReactContext.appStatus: ReactAppStatus
    get() {
        if (!hasActiveCatalystInstance())
            return ReactAppStatus.NOT_RUNNING

        // The RN lifecycleState:
        //  * starts as BEFORE_CREATE
        //  * responds to onResume, onPause, and onDestroy on the host Activity
        //    * Android upstream docs on those:
        //        https://developer.android.com/guide/components/activities/activity-lifecycle
        //    * RN wires those through ReactActivity -> ReactActivityDelegate ->
        //      ReactInstanceManager (as onHost{Resume,Pause,Destroy}) -> ReactContext
        //  * notably goes straight BEFORE_CREATE -> RESUMED when first starting
        //    (at least as of RN v0.59)
        return when (lifecycleState!!) {
            LifecycleState.BEFORE_CREATE -> ReactAppStatus.NOT_RUNNING
            LifecycleState.BEFORE_RESUME -> ReactAppStatus.BACKGROUND
            LifecycleState.RESUMED -> ReactAppStatus.FOREGROUND
        }
    }


// A convenience shortcut.
fun ReactContext.emitEvent(eventName: String, data: Any?) {
    getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, data)
}

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
