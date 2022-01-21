@file:JvmName("NotificationChannelManager")

package com.zulipmobile.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ContentResolver
import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.app.NotificationCompat
import com.zulipmobile.R
import com.zulipmobile.ZLog
import java.io.IOException
import java.lang.RuntimeException

/** The channel ID we use for our one notification channel, which we use for all notifications. */
// Previous values: "default", "messages-1"
val CHANNEL_ID = "messages-2"

/** The vibration pattern we set. */
// We try to set a vibration pattern that, with the phone in one's pocket,
// is both distinctly present and distinctly different from the default.
// Discussion: https://chat.zulip.org/#narrow/stream/48-mobile/topic/notification.20vibration.20pattern/near/1284530
val kVibrationPattern = longArrayOf(0, 125, 100, 450);

/** The Android resource URL for the given resource. */
// Based on: https://stackoverflow.com/a/38340580
fun Context.resourceUrl(resourceId: Int): Uri = with(resources) {
    Uri.Builder()
        .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
        .authority(getResourcePackageName(resourceId))
        .appendPath(getResourceTypeName(resourceId))
        .appendPath(getResourceEntryName(resourceId))
        .build()
}

private enum class NotificationSound constructor(
    val resourceId: Int, val fileDisplayName: String) {
    chime1(R.raw.chime1, "Zulip - Chime #1.m4a"),
    chime2(R.raw.chime2, "Zulip - Chime #2.m4a"),
    chime3(R.raw.chime3, "Zulip - Chime #3.m4a"),
    chime4(R.raw.chime4, "Zulip - Chime #4.m4a"),
    chime5(R.raw.chime5, "Zulip - Chime #5.m4a")
}

private val kDefaultNotificationSound = NotificationSound.chime2

// (Returns the URL of the default notification sound.)
private fun ensureInitNotificationSounds(context: Context): Uri {
    // The URL we'll return.
    // Typically this gets set in one of the loops below, but in case of error
    // or on old Android versions, we fall back to the internal resource.
    var defaultSoundUrl: Uri = context.resourceUrl(kDefaultNotificationSound.resourceId)

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
        // Before Android 10 Q, we don't attempt to put the sounds in shared media storage.
        // Just use the resource file directly.
        return defaultSoundUrl
    }

    val resolver = context.contentResolver
    val collection = MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)

    // First, look to see what notification sounds we've already stored,
    // and check against our list of sounds we have.

    val soundsTodo = NotificationSound.values().map { it.fileDisplayName to it }.toMap().toMutableMap()
    // Query and cursor-loop based on: https://developer.android.com/training/data-storage/shared/media#query-collection
    val cursor = resolver.query(
        collection,
        kotlin.arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DISPLAY_NAME
        ),
        "${MediaStore.Audio.Media.OWNER_PACKAGE_NAME}=?",
        arrayOf(context.packageName),
        "${MediaStore.Audio.Media._ID} ASC"
    ) ?: run {
        ZLog.w(TAG, "ensureInitNotificationSounds: query failed")
        return defaultSoundUrl
    }
    val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
    val nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
    while (cursor.moveToNext()) {
        val name = cursor.getString(nameColumn)
        soundsTodo.remove(name)
        if (name == kDefaultNotificationSound.fileDisplayName) {
            val id = cursor.getLong(idColumn)
            defaultSoundUrl = ContentUris.withAppendedId(collection, id)
        }
    }

    // If that leaves any sounds we haven't yet put into shared storage
    // (e.g., because this is the first run after install, or after an
    // upgrade that added a sound), then store those.

    // A relative path, suitable for:
    //   https://developer.android.com/reference/kotlin/android/provider/MediaStore.MediaColumns#RELATIVE_PATH:kotlin.String
    val soundsDirectoryPath = "${Environment.DIRECTORY_NOTIFICATIONS}/Zulip"
    for (sound in soundsTodo.values) {
        class ResolverFailedException(msg: String) : RuntimeException(msg)
        try {
            // Based on: https://developer.android.com/training/data-storage/shared/media#add-item
            val url = resolver.insert(collection, ContentValues().apply {
                put(MediaStore.Audio.Media.DISPLAY_NAME, sound.fileDisplayName)
                put(MediaStore.Audio.Media.RELATIVE_PATH, soundsDirectoryPath)
                put(MediaStore.Audio.Media.IS_NOTIFICATION, 1)
                put(MediaStore.Audio.Media.IS_PENDING, 1)
            }) ?: throw ResolverFailedException("resolver.insert failed")

            (resolver.openOutputStream(url, "wt")
                ?: throw ResolverFailedException("resolver.open… failed"))
                .use { outputStream ->
                    context.resources.openRawResource(sound.resourceId)
                        .use { it.copyTo(outputStream) }
                }

            resolver.update(
                url, ContentValues().apply { put(MediaStore.Audio.Media.IS_PENDING, 0) },
                null, null)

            if (sound == kDefaultNotificationSound) {
                defaultSoundUrl = url
            }
        } catch (e: ResolverFailedException) {
            ZLog.w(TAG, e)
        } catch (e: IOException) {
            ZLog.w(TAG, e)
        }
    }

    return defaultSoundUrl
}

/**
 * Apply our choices for settings that in modern Android go on the channel.
 *
 * On newer Android versions where notification channels exist, this has
 * no effect.
 * */
// TODO(Build.VERSION.SDK_INT>=26): Delete this, as it's a no-op.
fun NotificationCompat.Builder.setZulipChannelLikeSettings(context: Context) {
    setVibrate(kVibrationPattern)
    // This whole function only does anything before SDK 26 / O, in which case
    // we're definitely before Q and don't have shared storage.
    setSound(context.resourceUrl(kDefaultNotificationSound.resourceId))
}

fun createNotificationChannel(context: Context) {
    if (Build.VERSION.SDK_INT < 26) {
        // Notification channels don't exist before SDK 26, aka Android 8 Oreo.
        return
    }

    val notificationSoundUrl = ensureInitNotificationSounds(context)

    // TODO: It'd be nice to use NotificationChannelCompat here: we get a nice builder class,
    //   plus should then be able to drop the Build.VERSION condition.
    //   Needs upgrading androidx.core to 1.5.0:
    //     https://developer.android.com/jetpack/androidx/releases/core#1.5.0-alpha02

    // NOTE when changing anything here: the changes will not take effect
    // for existing installs of the app!  That's because we'll have already
    // created the channel with the old settings, and they're in the user's
    // hands from there.  Our choices are:
    //
    //  * Leave the old settings in place for existing installs, so the
    //    changes only apply to new installs.
    //
    //  * Change `CHANNEL_ID`, so that we abandon the old channel and use
    //    a new one.  Existing installs will get the new settings.
    //
    //    This also means that if the user has changed any of the notification
    //    settings for the channel -- like "override Do Not Disturb", or "use
    //    a different sound", or "don't pop on screen" -- their changes get
    //    reset.  So this has to be done sparingly.
    val manager = context.notificationManager
    manager.createNotificationChannel(NotificationChannel(
        CHANNEL_ID,
        context.getString(R.string.notification_channel_name),
        NotificationManager.IMPORTANCE_HIGH
    ).apply {
        // TODO: Is this the default value anyway for IMPORTANCE_HIGH?
        //   If so, perhaps just take it out.
        enableLights(true)

        vibrationPattern = kVibrationPattern

        setSound(notificationSoundUrl,
            AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build())
    })

    // Delete any obsolete previous channels.
    for (channel in manager.notificationChannels) {
        if (channel.id != CHANNEL_ID) {
            manager.deleteNotificationChannel(channel.id)
        }
    }
}
