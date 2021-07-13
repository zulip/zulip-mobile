package com.zulipmobile

import android.content.Intent
import android.os.Bundle
import android.webkit.WebView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactApplication
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import com.zulipmobile.notifications.*
import com.zulipmobile.sharing.maybeHandleIntent

open class MainActivity : ReactActivity() {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String {
        return "ZulipMobile"
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return object : ReactActivityDelegate(this, mainComponentName) {
            override fun createRootView(): ReactRootView {
                return RNGestureHandlerEnabledRootView(this@MainActivity)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(true)

        // Intent is reused after quitting, skip it.
        if ((intent.flags and Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) {
            return;
        }
        maybeHandleIntent(intent, application as ReactApplication, contentResolver)
    }

    override fun onNewIntent(intent: Intent?) {
        if (maybeHandleIntent(intent, application as ReactApplication, contentResolver)) {
            return
        }
        super.onNewIntent(intent)
    }
}
