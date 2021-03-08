package com.zulipmobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import com.zulipmobile.notifications.*
import com.zulipmobile.sharing.SharingModule

const val TAG = "MainActivity"

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
        maybeHandleIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        if (maybeHandleIntent(intent)) {
            return
        }
        super.onNewIntent(intent)
    }

    /* Returns true just if we did handle the intent. */
    private fun maybeHandleIntent(intent: Intent?): Boolean {
        // We handle intents from "sharing" something to Zulip.
        if (intent?.action == Intent.ACTION_SEND) {
            handleSend(intent)
            return true
        }
        // TODO also handle ACTION_SEND_MULTIPLE?
        //   See: https://developer.android.com/training/sharing/receive#receiving-data-activity

        // For other intents, let RN handle it.  In particular this is
        // important for VIEW intents with zulip: URLs.
        return false
    }

    private fun handleSend(intent: Intent) {
        // Intent is reused after quitting, skip it.
        if ((intent.flags and Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) {
            return;
        }

        val params: WritableMap = try {
            getParamsFromIntent(intent)
        } catch (e: ShareParamsParseException) {
            Log.w(TAG, "Ignoring malformed share Intent: ${e.message}")
            return
        }

        // TODO deduplicate this with notifyReact.
        // Until then, keep in sync when changing.
        val application = application as ReactApplication
        val host = application.reactNativeHost
        val reactContext = host.tryGetReactInstanceManager()?.currentReactContext
        val appStatus = reactContext?.appStatus
        Log.d(TAG, "app status is $appStatus")
        when (appStatus) {
            null, ReactAppStatus.NOT_RUNNING ->
                // Either there's no JS environment running, or we haven't yet reached
                // foreground.  Expect the app to check initialSharedData on launch.
                SharingModule.initialSharedData = params
            ReactAppStatus.BACKGROUND, ReactAppStatus.FOREGROUND ->
                // JS is running and has already reached foreground. It won't check
                // initialSharedData again, but it will see a shareReceived event.
                emit(reactContext, "shareReceived", params)
        }
    }

    private fun getParamsFromIntent(intent: Intent): WritableMap {
        // For documentation of what fields to expect here, see:
        //   https://developer.android.com/reference/android/content/Intent#ACTION_SEND
        val params = Arguments.createMap()
        when {
            "text/plain" == intent.type -> {
                val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
                params.putString("type", "text")
                params.putString("sharedText", sharedText)
            }
            intent.type?.startsWith("image/") == true -> {
                val url = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                    ?: throw ShareParamsParseException("Could not extract URL from Image Intent")
                params.putString("type", "image")
                params.putString("sharedImageUrl", url.toString())
            }
            else -> {
                val url = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                    ?: throw ShareParamsParseException("Could not extract URL from File Intent")
                params.putString("type", "file")
                params.putString("sharedFileUrl", url.toString())
            }
        }
        return params
    }
}

class ShareParamsParseException(errorMessage: String) : RuntimeException(errorMessage)
