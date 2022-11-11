package com.zulipmobile

import android.os.Build
import android.content.Intent
import android.os.Bundle
import android.webkit.WebView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactApplication
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.ReactContext
import com.zulipmobile.notifications.*
import com.zulipmobile.sharing.handleSend
import expo.modules.ReactActivityDelegateWrapper

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

open class MainActivity : ReactActivity() {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String {
        return "ZulipMobile"
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this,
            ReactActivityDelegate(this, mainComponentName)
        )
    }

    /* Returns true just if we did handle the intent. */
    private fun maybeHandleIntent(intent: Intent?): Boolean {
        intent ?: return false
        val url = intent.data
        when (intent.action) {
            // Share-to-Zulip
            Intent.ACTION_SEND, Intent.ACTION_SEND_MULTIPLE -> {
                handleSend(intent, reactApplication.tryGetReactContext(), contentResolver)
                return true
            }

            Intent.ACTION_VIEW -> when {
                // Launch MainActivity on tapping a notification
                url?.scheme == "zulip" && url.authority == NOTIFICATION_URL_AUTHORITY -> {
                    val data = intent.getBundleExtra(EXTRA_NOTIFICATION_DATA) ?: return false
                    logNotificationData("notif opened", data)
                    notifyReact(reactApplication.tryGetReactContext(), data)
                    return true
                }

                // Let RN handle other intents.  In particular web-auth intents (parsed in
                // src/start/webAuth.js) have ACTION_VIEW, scheme "zulip", and authority "login".
                else -> return false
            }

            // For other intents, let RN handle it.
            else -> return false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Discard savedInstanceState.  This is required by react-native-screens:
        //   https://github.com/software-mansion/react-native-screens/tree/2.18.1#android
        super.onCreate(null)

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

    /**
     * Align the back button behavior with Android S
     * where moving root activities to background instead of finishing activities.
     * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
     */
    override fun invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            if (!moveTaskToBack(false)) {
                // For non-root activities, use the default implementation to finish them.
                super.invokeDefaultOnBackPressed()
            }
            return
        }

        // Use the default back button implementation on Android S
        // because it's doing more than {@link Activity#moveTaskToBack} in fact.
        super.invokeDefaultOnBackPressed()
    }
}
