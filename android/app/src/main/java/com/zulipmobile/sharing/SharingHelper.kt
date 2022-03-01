@file:JvmName("SharingHelper")

package com.zulipmobile.sharing

import android.content.Intent
import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.zulipmobile.ZLog
import com.zulipmobile.notifications.ReactAppStatus
import com.zulipmobile.notifications.appStatus
import com.zulipmobile.notifications.emit

@JvmField
val TAG = "ShareToZulip"

internal fun handleSend(
    intent: Intent,
    reactContext: ReactContext?,
    contentResolver: ContentResolver,
) {
    val params: WritableMap = try {
        getParamsFromIntent(intent, contentResolver)
    } catch (e: ShareParamsParseException) {
        ZLog.w(TAG, e)
        return
    }

    // TODO deduplicate this with notifyReact; see
    // https://github.com/zulip/zulip-mobile/pull/5146#discussion_r764437055
    // Until then, keep in sync when changing.
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

private fun urlToSharedFile(url: Uri, contentResolver: ContentResolver): WritableMap {
    val file = Arguments.createMap()
    file.putString("name", getFileName(url, contentResolver))
    file.putString("mimeType", contentResolver.getType(url) ?: "application/octet-stream")
    file.putString("url", url.toString())
    return file
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
    if ("text/plain" == intent.type) {
        val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
        params.putString("type", "text")
        params.putString("sharedText", sharedText)
    } else {
        val files = Arguments.createArray()
        when (intent.action) {
            Intent.ACTION_SEND -> {
                val url = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                    ?: throw ShareParamsParseException("Could not extract URL from File Intent")
                val file = urlToSharedFile(url, contentResolver)
                files.pushMap(file)
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                val urls = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
                    ?: throw ShareParamsParseException("Could not extract URLs from File Intent")
                for (url in urls) {
                    files.pushMap(urlToSharedFile(url, contentResolver))
                }
            }
        }
        params.putString("type", "file")
        params.putArray("files", files)
    }
    return params
}

fun getFileName(uri: Uri, contentResolver: ContentResolver): String {
    return contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        cursor.moveToFirst()
        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
        cursor.getString(nameIndex)
    } ?: "unknown." + (contentResolver.getType(uri)?.split('/')?.last() ?: "bin")
}

class ShareParamsParseException(errorMessage: String) : RuntimeException(errorMessage)
