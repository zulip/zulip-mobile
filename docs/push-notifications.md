# Push notifications

Mobile devices support two types of notifications - local notifications
and remote, or push, notificiations.  Local notifications require no external
infrastructure and can be triggered by date, place, or time.  Push
notifications, on the other hand, are sent by some (authenticated) backend.

This doc describes how to develop/locally test push notifications.

## Testing client-side changes on iOS

The Apple Push Notification service (APNs) does not allow our production
bouncer to send notifications to a development build of the Zulip Mobile
app.

(work in progress)

## Testing server-side changes on iOS

[Set up the dev-server for mobile development](dev-server.md), with 1
additional step -

* Before you run the server with `tools/run-dev.py`, register your development
  server with our production bouncer by running our custom Django management
  command: `python manage.py register_server --agree_to_terms_of_service`.

Now, in accordance with the instructions in [dev-server.md](dev-server.md),
log into the dev server from a production build of the app - that is, the
Zulip iOS app, installed from the App Store.

To test Zulip's push notifications, simulate a private conversation between
two users, and make sure that you don't have the Zulip app open while you're
doing  so. For example, if you've logged in as `Iago` on your iOS device, log
in as `Polonius` via a web browser, and send a PM from `Polonius` to `Iago`.

You should observe a push notification appear on your iOS device!
