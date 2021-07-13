@file:JvmName("SharingHelper")

package com.zulipmobile.sharing

import android.content.Intent
import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.zulipmobile.notifications.ReactAppStatus
import com.zulipmobile.notifications.appStatus
import com.zulipmobile.notifications.emit
import com.zulipmobile.notifications.tryGetReactInstanceManager

@JvmField
val TAG = "ShareToZulip"

/* Returns true just if we did handle the intent. */
fun maybeHandleIntent(
    intent: Intent?,
    application: ReactApplication,
    contentResolver: ContentResolver
): Boolean {
    // We handle intents from "sharing" something to Zulip.
    if (intent?.action == Intent.ACTION_SEND) {
        handleSend(intent, application, contentResolver)
        return true
    }
    // TODO also handle ACTION_SEND_MULTIPLE?
    //   See: https://developer.android.com/training/sharing/receive#receiving-data-activity

    // For other intents, let RN handle it.  In particular this is
    // important for VIEW intents with zulip: URLs.
    return false
}

private fun handleSend(intent: Intent, application: ReactApplication, contentResolver: ContentResolver) {
    val params: WritableMap = try {
        getParamsFromIntent(intent, contentResolver)
    } catch (e: ShareParamsParseException) {
        Log.w(TAG, "Ignoring malformed share Intent: ${e.message}")
        return
    }

    // TODO deduplicate this with notifyReact.
    // Until then, keep in sync when changing.
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

private fun getParamsFromIntent(intent: Intent, contentResolver: ContentResolver): WritableMap {
    // For documentation of what fields to expect in the Intent, see:
    //   https://developer.android.com/reference/android/content/Intent#ACTION_SEND
    //
    // params is constructed to be sent over to React/JS, and must contain data in
    // sync with the code over there.
    //
    // To Ensure this make sure to keep the construction logic in sync with what is 
    // expected there.
    //
    // it corresponds with `src/types.js#SharedData`.
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
            params.putString("fileName", getFileName(url, contentResolver))
        }
        else -> {
            val url = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                ?: throw ShareParamsParseException("Could not extract URL from File Intent")
            params.putString("type", "file")
            params.putString("sharedFileUrl", url.toString())
            params.putString("fileName", getFileName(url, contentResolver))
        }
    }
    return params
}

fun getFileName(uri: Uri, contentResolver: ContentResolver): String {
    return contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        cursor.moveToFirst()
        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
        cursor.getString(nameIndex)
    }?: "unknown." + (contentResolver.getType(uri)?.split('/')?.last() ?: "bin")
}

class ShareParamsParseException(errorMessage: String) : RuntimeException(errorMessage)
