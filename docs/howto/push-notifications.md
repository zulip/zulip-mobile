# Push notifications

This doc describes how to test and develop changes to Zulip's mobile
push notifications.

#### Contents (with permalinks)

* [General tips](#general-tips)
* [Testing server-side changes (iOS or Android)](#server)
* [Testing client-side changes on Android](#android)
* [Testing client-side changes on iOS](#ios)


<div id="general-tips" />

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

  * Try also turning on [the "even while online"
    setting](https://zulip.com/help/test-mobile-notifications) --
    this is extremely helpful for testing notifications effectively,
    with basically the one exception of if you're specifically working
    on the "if online" aspect of the system.

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


<div id="server" />

## Testing server-side changes (iOS or Android)

When making changes to the Zulip server, use these steps to test how
they affect notifications.

First, three one-time setup steps:

1. [Set up the dev server for mobile development](dev-server.md).

2. Create a `zproject/custom_dev_settings.py` with the following line:

   ```python
   ZULIP_SERVICES_URL = 'https://push.zulipchat.com'
   ```

   This matches the normal setting for a production install of the
   Zulip server (set by `zproject/default_settings.py`).

   The Zulip server will helpfully print a line on startup to remind
   you that this settings override file exists.

3. Register your development server with our production bouncer by
   running a command like this one, but with `[yourname]` replaced by
   your name:

   ```
   EXTERNAL_HOST=[yourname].zulipdev.com:9991 python manage.py register_server --agree-to-terms-of-service
   ```

   (The exact value of `EXTERNAL_HOST` doesn't matter; in particular
   it doesn't need to match the `EXTERNAL_HOST` that you use when
   actually running the server, with `tools/run-dev`.  It does need to
   be distinct from any names that others have already registered.)

   This is a variation of our [instructions for production
   deployments](https://zulip.readthedocs.io/en/latest/production/mobile-push-notifications.html),
   adapted for the Zulip dev environment.

   You should only have to do this step once, unless you build a new
   Zulip server dev environment from scratch.  The credentials which
   this command registers with the bouncer are kept in the
   `zproject/dev-secrets.conf` file.

4. If you were already running `tools/run-dev`, quit and restart it
   after these setup steps.


Then, each time you test:

1. Run `tools/run-dev` according to the instructions in
   [dev-server.md](dev-server.md).  Then follow that doc's
   instructions to log into the dev server.  Use the release build of
   the app -- that is, the Zulip app installed from the App Store or
   Play Store.

2. Follow the general tips above to cause a push notification.  For
   example, log in from a browser as a different user, and send the
   mobile user a PM.

   You should see a push notification appear on the mobile device!

   If you don't, check the general tips above.  Then ask in chat and
   let's debug.


<div id="android" />

## Testing client-side changes on Android

Happily, this is straightforward: just edit, build, and run the app
the same as for any other change.

Typically you'll be editing Kotlin code (not only JS), so remember to
rerun `tools/run-android`.

### Debugging tips (for Android client)

First: see our general [debugging tips for platform-native
code](debugging.md#native), particularly `adb logcat`.

Our notifications code tags log messages with the tag `ZulipNotif`.
So a command like `adb logcat ZulipNotif:V *:E` is helpful for seeing
details about Zulip notifications.  For example (edited slightly for
readability):

```
$ adb logcat -T 1000 ZulipNotif:V *:E
V ZulipNotif: getPushNotification: Bundle[{sender_full_name=Greg 試し, pm_users=101712,101713,108224,
    sender_avatar_url=https://secure.gravatar.com/avatar/39da3be46238cf93b47a1f5af3df993f?d=identicon&version=1,
    server=zulipchat.com, realm_uri=https://kandra-test.zulipchat.com, realm_id=1230, content_truncated=false,
    zulip_message_id=157914854, recipient_type=private, time=1549686858, user=greg+t2@zulip.com,
    sender_id=101712, alert=New private group message from Greg 試し, event=message, content=C,
    sender_email=greg+t1@zulip.com}]
```

The spew in this example is from this line in our code:
```
    Log.v(TAG, "getPushNotification: " + data.toString(), new Throwable());
```
(The stack trace is just for information; it doesn't represent an
error.)

You can do print-debugging by adding similar lines, even if they don't
make it into the final code you send in a PR.  Here's another example:
```
    Log.v(TAG, String.format("update: %d", conversations.size()));
```


<div id="ios" />

## Testing client-side changes on iOS

Apple makes this much more of a pain than it is on Android: APNs (*)
does not allow our production bouncer to send notifications to a
development build of the app.

(*) i.e. "Apple Push Notification service" -- Apple is very Apple
about this name, styling it without an article and with the
idiosyncratic capitalization shown.


### Current workaround

This workaround means using a development server.  You'll first need
to [set up the dev server for mobile development](dev-server.md).

You can tell your development server to talk to Apple's APNs "sandbox"
server, instead of its server meant for production, but you'll need a
certificate signed by Apple authorizing you to do so. Some background
on that is
[here](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns/#2947606).

1. First, generate a certificate signing request (CSR) and
   corresponding private key.  Use the `tools/setup/apns/prep-cert`
   script from the Zulip server tree:
   ```
   $ tools/setup/apns/prep-cert request /tmp/apns.key /tmp/apns.csr
   ```

2. Greg is authorized in Apple Developer to upload the CSR and obtain
   the actual certificate, so you should send `apns.csr` to him and
   ask him to do that.  He'll follow the steps at
   https://developer.apple.com/account/resources/certificates/add
   with:
   * Cert type: “Apple Push Notification service SSL (Sandbox)"
     (not "Sandbox & Production")
   * App ID: 66KHCWMEYB.org.zulip.Zulip

   to obtain a certificate file `aps_development.cer`,
   and send it back to you.

3. Combine the certificate with the key using the same tool:
   ```
   $ tools/setup/apns/prep-cert combine \
       /tmp/apns.key /tmp/aps_development.cer zproject/apns-dev.pem
   ```

   The file `zproject/apns-dev.pem` is the output of all the steps
   up to this point.
   You can now delete the other files `/tmp/apns.key`, `/tmp/apns.csr`,
   and `/tmp/aps_development.cer`.

4. Restart `tools/run-dev` to let the server pick up the change.
   It should automatically see the file `zproject/apns-dev.pem`
   and use it to communicate with the APNs sandbox server.

You should now be getting notifications on your iOS development build!


#### Troubleshooting

If it's not working, first check that mobile notification settings are
on, using the web app's settings interface.  See also the
troubleshooting items below.

If none of those resolve the issue, please ask for help
in [#mobile-dev-help](https://chat.zulip.org/#narrow/stream/516-mobile-dev-help) on
chat.zulip.org, so we can debug.


##### Error: Your plan doesn't allow sending push notifications

After the above setup is done, when the dev server tries to send a
notification (e.g. because you had some other user send a DM to the
user you've logged in as from the mobile app), you might get an error
like this one (reformatted for readability):

```
INFO [zerver.lib.push_notifications] Sending push notifications to mobile clients for user 11
INFO [zr] 127.0.0.1       POST    400   8ms (db: 3ms/6q) /api/v1/remotes/push/notify [can_push=False/Missing data] (zulip-server:… via ZulipServer/11.0-dev+git)
INFO [zr] status=400, data=b'{"result":"error","msg":"Your plan doesn\'t allow sending push notifications.","code":"INVALID_ZULIP_SERVER"}\n', uid=zulip-server:…
WARN [django.server] "POST /api/v1/remotes/push/notify HTTP/1.1" 400 109
ERR  [] Problem handling data on queue missedmessage_mobile_notifications
Traceback (most recent call last):
…
  File "/srv/zulip/zerver/lib/remote_server.py", line 195, in send_to_push_bouncer
    raise PushNotificationBouncerError(
zerver.lib.remote_server.PushNotificationBouncerError:
  Push notifications bouncer error: Your plan doesn't allow sending push notifications.
```

It's not clear why this happens.  Try stopping the server
(i.e. `tools/run-dev`) and starting it again.  On the
[one occasion][error-plan-missing] this error has been seen
as of this writing, the error went away after doing so.

[error-plan-missing]: https://chat.zulip.org/#narrow/channel/243-mobile-team/topic/notifications.20from.20dev.20server/near/2163051


### Another workaround (if the first doesn't work)

Make a release build of the app, and upload it [as an alpha][].
Update your device to the alpha from TestFlight, and test there.

[as an alpha]: release.md#build-and-upload-alpha-ios

This works OK, but it's slow: about 5m to build and upload, and
another few on Apple's servers before it's available in alpha.  In
total perhaps 10m from "save and hit go" to actually getting to test.

The long iteration cycle can be tolerable for changes that are very
likely to need only zero to one revision -- because they're very
small, or already well tested on Android -- but makes serious
development basically infeasible.


#### Tip: setting the iOS build number

For making a throwaway alpha build like this approach calls for, you
may find something like the following command helpful.  It sets the
[iOS build number][], aka `CFBundleVersion` (which we normally leave
set to 1) to a new value so the new build can coexist on TestFlight
with previous builds:

    $ set-buildno () {
        version="$1" perl -i -0pe '
            s|<key>CFBundleVersion</key> \s* <string>\K [0-9.]+
             |$ENV{version}|xs
          ' ios/ZulipMobile/Info.plist &&
        git commit -am "version: Bump iOS build number to $1."
      }
    $ set-buildno 2

This is similar to the job of `tools/bump-version`, which operates on
the user-facing [version number][], aka `CFBundleShortVersionString`.

More specifically, the rule appears to be:

 * The user-facing version number must be strictly greater than the
   last one published to the App Store.

 * The user-facing version number can stay the same across a series of
   alpha and/or beta releases, but the build number must strictly
   increase.

So if the last version in main is already in the App Store (and not
still in alpha or beta), then we'll want to:

 * Increment the user-facing version number.

 * To avoid confusion when we next release, use a build number
   starting with "0." -- so e.g. `set-buildno 0.0.1` or `set-buildno
   0.20200204.1`.

[iOS build number]: https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion
[version number]: https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring


### Possible future solution

We believe that given an appropriate dev certificate, it should be
possible to send notifications to a dev build of the app through
Apple's sandbox instance of APNs.

Open questions include how to teach the Zulip server and/or bouncer to
talk to the sandbox APNs.

* ~~A good first step would be to do so from a development server,
  without involving the bouncer.~~ (This step is done; it's the current
  workaround, described above.)

* To make the development experience as good as it is on Android,
  though, it should be possible to get notifications from
  zulipchat.com and chat.zulip.org in a development build of the app.

* One way to arrange that might be to have the production bouncer talk
  to either the production or staging instance of APNs; the client
  tell the Zulip server which one to use for that client's
  notifications, and the Zulip server pass that information on to the
  bouncer.

* Another might be to leave the bouncer out of it, and have the Zulip
  server talk directly to the sandbox APNs when the client asks it to,
  rather than talk to the bouncer.
