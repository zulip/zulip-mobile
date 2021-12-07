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
import com.zulipmobile.sharing.handleSend

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

    /* Returns true just if we did handle the intent. */
    private fun maybeHandleIntent(intent: Intent?): Boolean {
        if (intent == null) {
            return false
        }

        val host = (application as ReactApplication).reactNativeHost
        val reactContext = host.tryGetReactInstanceManager()?.currentReactContext

        when (intent.action) {
            // Share-to-Zulip
            Intent.ACTION_SEND, Intent.ACTION_SEND_MULTIPLE -> {
                handleSend(intent, reactContext, contentResolver)
                return true
            }
            // Launch MainActivity on tapping a notification
            Intent.ACTION_VIEW -> {
                // The web-auth intent's action is also VIEW; leave that for RN
                //   to handle.
                val data = intent.getBundleExtra(EXTRA_NOTIFICATION_DATA) ?: return false

                logNotificationData("notif opened", data)
                notifyReact(reactContext, data)
                return true
            }
        }

        // For other intents, let RN handle it.  In particular this is
        // important for web-auth intents.
        return false
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(true)

        // Intent is reused after quitting, skip it.
        if ((intent.flags and Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) {
            return;
        }
        maybeHandleIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        if (maybeHandleIntent(intent)) {
            return
        }
        super.onNewIntent(intent)
    }
}
