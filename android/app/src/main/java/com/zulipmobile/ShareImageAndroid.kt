package com.zulipmobile

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.content.Intent
import android.net.Uri
import com.zulipmobile.R
import java.lang.NullPointerException

/**
 * Send Send Multiple Pieces of Content to other apps.
 */
class ShareImageAndroid(reactContext: ReactApplicationContext?) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "ShareImageAndroid"
    }

    @ReactMethod
    @Throws(NullPointerException::class)
    fun shareImage(path: String?) {
        val shareIntent = Intent()
        shareIntent.action = Intent.ACTION_SEND
        shareIntent.putExtra(Intent.EXTRA_STREAM, Uri.parse(path))
        shareIntent.type = "image/jpeg"
        val intent = Intent.createChooser(shareIntent,
            reactApplicationContext.resources.getText(R.string.send_to))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }
}