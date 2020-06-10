package com.zulipmobile.sharing

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import androidx.annotation.Nullable
import com.facebook.react.ReactActivity
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.zulipmobile.notifications.*

const val TAG = "ZulipReceiveShare"

class ReceiveShareActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String? {
        return "SharingRoot"
    }

    private fun sendEvent(reactContext: ReactContext,
                          eventName: String,
                          @Nullable params: WritableMap) {
        Log.d(TAG, "Sending event with shared data")
        emit(reactContext, eventName, params)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(true)

        if (intent?.action == Intent.ACTION_SEND) {
            handleSend(intent)
        }
        // TODO also handle ACTION_SEND_MULTIPLE?
        //   See: https://developer.android.com/training/sharing/receive#receiving-data-activity

        finish()
    }

    private fun handleSend(intent: Intent) {
        val params: WritableMap
        try {
            params = getParamsFromIntent(intent)
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
                sendEvent(reactContext, "shareReceived", params)
        }
        when (appStatus) {
            null, ReactAppStatus.NOT_RUNNING, ReactAppStatus.BACKGROUND ->
                launchMainActivity(application as Context)
            ReactAppStatus.FOREGROUND -> Unit
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
