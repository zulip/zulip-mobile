# Push notifications

This doc describes (parts of) how we implement push notifications.

See also:
 * Our doc on [how to test, and develop
   changes](../howto/push-notifications.md) to, our notifications
 * Our [server-side docs][rtd-mobile-notif] on setting up a Zulip
   server to send push notifications
 * Our docs on [Android-native code](android.md), in Kotlin and Java;
   the bulk of our notifications code is in platform-native code

[rtd-mobile-notif]: https://zulip.readthedocs.io/en/latest/production/mobile-push-notifications.html


## Push messages and UI notifications

There are two quite different, but related, things that often get
called a "notification" or "push notification":

 * An item of UI that appears in the system's notification area, and
   that may pop up or make sound to attract the user's attention.
   Call this a "UI notification".

 * A blob of data that gets pushed to the device, through a service
   that can do so even when the app is in the background or the whole
   device is asleep.  Call this a "push message".

In the simplest case, these might correspond one-to-one: something
happens in the cloud which the user wants to be notified about, so the
server sends the device a push message about it, and the app creates a
UI notification from the data in the push message.

But there are good reasons for them to often not correspond: a push
message might cause several UI notifications, or it might cause the
app to remove a UI notification, or something else.

For the types of push messages we use in Zulip, see our
[`FcmMessage.kt`][FcmMessage.kt], which parses them on Android.  (On
iOS we haven't implemented all the same notification features.)

For the implementation of our UI notifications, see:

 * on Android, our [`NotificationUiManager.kt`][NotificationUiManager.kt]

 * on iOS, the server code in
   [`push_notifications.py`][push_notifications.py] that generates the
   APNs payload, particularly `get_message_payload_apns`; and [Apple's
   docs][apns-payload] on the meaning of the payload.
   
   On iOS we let the system interpret each push message into one UI
   notification, without involving any client-side code of our own.

[FcmMessage.kt]: ../../android/app/src/main/java/com/zulipmobile/notifications/FcmMessage.kt
[NotificationUiManager.kt]: ../../android/app/src/main/java/com/zulipmobile/notifications/NotificationUiManager.kt
[push_notifications.py]: https://github.com/zulip/zulip/blob/main/zerver/lib/push_notifications.py
[apns-payload]: https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification


## FCM / Firebase Cloud Messaging

On Android, we receive push messages through a Google service called
[Firebase Cloud Messaging (FCM)][fcm].

[fcm]: https://firebase.google.com/docs/cloud-messaging/


### Configuring Firebase

We set up Firebase in our build process a bit differently from the
upstream instructions.  Commit [f507b025c][], which introduced Firebase,
explains how and why:

> The main point of divergence from the instructions is that I didn't
> want to use the Google Services Gradle Plugin and have it process a
> `google-services.json`.  The plugin wants to configure a bunch of
> other services too, and doesn't make it super transparent what it's
> doing; given that this isn't the kind of app that's stuffed full of
> Google-flavored analytics, I wanted to keep things more explicit.
>
> So instead I put the relevant values into a new file `firebase.xml`,
> following the useful parts of what the plugin would do.  Details on
> those, and how to recompute them from a `google-services.json`:
>   https://developers.google.com/android/guides/google-services-plugin

[f507b025c]: https://github.com/zulip/zulip-mobile/commit/f507b025c

See our [`firebase.xml`][firebase.xml] for the result.

[firebase.xml]: ../../android/app/src/main/res/values/firebase.xml
