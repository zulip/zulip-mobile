@file:JvmName("NotificationHelper")

package com.zulipmobile.notifications

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.IOException
import java.io.InputStream
import java.net.URL
import com.zulipmobile.ZLog

@JvmField
val TAG = "ZulipNotif"

fun fetchBitmap(url: URL): Bitmap? {
    return try {
        val connection = url.openConnection()
        connection.useCaches = true
        (connection.content as? InputStream)
            ?.let { BitmapFactory.decodeStream(it) }
    } catch (e: IOException) {
        ZLog.e(TAG, e)
        null
    }
}
