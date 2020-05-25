package com.zulipmobile.sharing

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
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
        finish()
    }

    private fun handleSend(intent: Intent) {
        val application = application as ReactApplication
        val host = application.reactNativeHost
        val reactContext = host.tryGetReactInstanceManager()?.currentReactContext

        val params = (if ("text/plain" == intent.type) {
            getParamsFromTextIntent(intent)
        } else if (intent.type?.startsWith("image/") == true) {
            getParamsFromImageIntent(intent)
        } else {
            getParamsFromFileIntent(intent)
        })
            ?: throw Exception("Could not parse received sharing data")

        if (null == reactContext) {
            launchMainActivity(application as Context)
            SharingModule.initialSharedData = params
        } else {
            sendEvent(reactContext, "shareReceived", params)
        }
    }

    private fun getParamsFromTextIntent(intent: Intent): WritableMap {
        val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
        val params = Arguments.createMap()
        params.putString("type", "text")
        params.putString("sharedText", sharedText)
        return params
    }

    private fun getParamsFromImageIntent(intent: Intent): WritableMap? {
        val uri = intent.getParcelableExtra(Intent.EXTRA_STREAM) as? Uri ?: return null
        val params = Arguments.createMap()
        params.putString("type", "image")
        params.putString("sharedImageUri", uri.toString())
        return params
    }

    private fun getParamsFromFileIntent(intent: Intent): WritableMap? {
        val uri = intent.getParcelableExtra(Intent.EXTRA_STREAM) as? Uri ?: return null
        val params = Arguments.createMap()
        params.putString("type", "file")
        params.putString("sharedFileUri", uri.toString())
        return params
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        val intent = Intent("onConfigurationChanged")
        intent.putExtra("newConfig", newConfig)
        this.sendBroadcast(intent)
    }
}