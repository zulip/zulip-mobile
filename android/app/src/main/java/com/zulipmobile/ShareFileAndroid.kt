package com.zulipmobile

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.imagepicker.FileProvider
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
        val sharedFile = File(path)

        // use of `FileProvider` here demands additional setup in the AndroidManifest.xml file
        // details: https://developer.android.com/training/secure-file-sharing/setup-sharing.
        // Currently this setup is not done by us explicitly; inclusion of module `rn-fetch-blob`
        // does this for us implicitly, setting the value of authority to: `packageName.provider`.
        val sharedFileUri: Uri = FileProvider.getUriForFile(
            reactApplicationContext,
            reactApplicationContext.packageName + ".provider",
            sharedFile)

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
