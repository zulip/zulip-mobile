# Push notifications

Mobile devices support two types of notifications: local notifications
and remote, or push, notificiations.  Local notifications require no external
infrastructure and can be triggered by date, place, or time.  Push
notifications, on the other hand, are sent by some (authenticated) backend.

This doc describes how to develop, and locally test, push notifications in
Zulip Mobile.  We don't currently use local notifications.


## General tips

When testing Zulip's push notifications:

* Try simulating a PM conversation between two users: one on the
  mobile device, and one from your desktop.  For example, if you've
  logged in as "Iago" on your mobile device, log in as "Polonius" via
  a web browser, and send a PM from Polonius to Iago.

* Test different types of messages that will cause different types of
  notifications: a 1:1 PM conversation, a group PM conversation, an
  @-mention in a stream, a stream with notifications turned on, even
  an @-mention in a 1:1 or group PM conversation.

* Make sure "mobile push notifications" are on in the mobile user's
  Zulip settings!

  * Try also turning on the "even while online" setting -- this is
    extremely helpful for testing notifications effectively, with
    basically the one exception of if you're specifically working on
    the "if online" aspect of the system.

* Make sure notifications are enabled for Zulip in the device's system
  settings!

  * To get to these, find "Notifications" or "Apps & Notifications" in
    the system settings app, depending on OS and version; then find
    Zulip in the list.  Or on Android, in the launcher give the app's
    icon a long-press -> "App Info" -> "Notifications".

  * Also check the settings there for whether and how the app's
    notifications will pop on the screen, make a sound, etc.

  * Particularly for the debug build on one's personal device, it's
    natural to disable notifications between development sessions to
    suppress duplicates... then forget to re-enable them.

* Leave the app in the background: that is, switch to the launcher /
  home screen or to a different app to get it off the screen.  Or
  keep it on screen, or force-kill it, to test different scenarios!


## Testing client-side changes on iOS

The Apple Push Notification service (APNs) does not allow our production
bouncer to send notifications to a development build of the Zulip Mobile
app.

(Work in progress; given an appropriate dev certificate, we should be able
to send notifications to a dev build of the app through Apple's sandbox
instance of APNs.)


## Testing server-side changes (iOS or Android)

[Set up the dev server for mobile development](dev-server.md), with two
additional steps:

1. Before you run the server with `tools/run-dev.py`, add the following line
   to `zproject/dev_settings.py`:

   ```python
   PUSH_NOTIFICATION_BOUNCER_URL = 'https://push.zulipchat.com'
   ```

   For a production build, `PUSH_NOTIFICATION_BOUNCER_URL` is specified in a
   settings file generated from `zproject/prod_settings_template.py`. This is
   a workaround for that, and you can keep this around via `git stash`.

2. Then, register your development server with our production bouncer by 
   running the following custom Django management command:

   ```
   python manage.py register_server --agree_to_terms_of_service
   ```

   Registration should be one-time; that is, as long as you're using the
   same `zproject/dev-secrets.conf` that was generated at provision time, you
   shouldn't have to run the command again unless you build a new dev
   environment from scratch.

   This is a variation of our [instructions for production
   deployments](https://zulip.readthedocs.io/en/latest/production/mobile-push-notifications.html),
   adapted for the Zulip dev environment.

Now, follow the instructions in [dev-server.md](dev-server.md) to log into
the dev server, using a production build of the app -- that is, the Zulip
app installed from the App Store or Play Store.

You should see a push notification appear on the mobile device!
