package com.zulipmobile

import androidx.core.content.FileProvider
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import java.io.File

/**
 * Allows Sending Files from Zulip to other apps.
 */
class ShareFileAndroid(reactContext: ReactApplicationContext?) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "ShareFileAndroid"
    }

    @ReactMethod
    fun shareFile(path: String, promise: Promise) = try {
        // Using `FileProvider` here requires setup in AndroidManifest.xml:
        //   https://developer.android.com/training/secure-file-sharing/setup-sharing
        // Currently we don't do this explicitly in our AndroidManifest.xml
        // source file; instead we rely implicitly on a manifest snippet
        // added by `rn-fetch-blob`.  This authority string needs to match
        // the `android:authorities` value from there.
        val fileProviderAuthority = reactApplicationContext.packageName + ".provider"
        val sharedFileUri: Uri = FileProvider.getUriForFile(
            reactApplicationContext, fileProviderAuthority, File(path))

        val shareIntent = Intent()
        shareIntent.action = Intent.ACTION_SEND
        shareIntent.type = reactApplicationContext.contentResolver.getType(sharedFileUri)
        shareIntent.putExtra(Intent.EXTRA_STREAM, sharedFileUri)

        val chooserIntent = Intent.createChooser(shareIntent,
            reactApplicationContext.resources.getText(R.string.send_to))
        chooserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(chooserIntent)
        promise.resolve(null)
    } catch (e: Exception) {
        promise.reject(e)
    }
}
