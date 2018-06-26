# Using a dev version of the server

This isn't required for most development -- you can use chat.zulip.org,
or another live Zulip community you belong to, for testing the mobile app.
But sometimes when debugging interactions with the server, or developing
server-side changes related to the mobile app, it's helpful to run the
mobile app against a development server which you control.

Setting this up involves a few steps, but it should be straightforward if
our instructions are right and you follow them carefully.  If these don't
work for you or you have any trouble, please report it in chat, with details
on exactly what you did and what happened; we'll help you debug, and then
adjust the instructions so they work for the next person with a setup like
yours.

(Also, if these instructions don't discuss your setup, definitely ask in
chat!  And PRs very welcome.)


## 1. Set up a dev server

First, if you haven't already, you'll want to install and provision a
[Zulip Server dev VM](https://zulip.readthedocs.io/en/latest/development/overview.html).

For most people the recommended setup uses Vagrant to manage a VM containing
the Zulip server.  If you choose instead to run the Zulip server directly on
your host machine, these instructions will work with some variations.

You'll run the Zulip server in the dev VM with `tools/run-dev.py`, following
the usual instructions for Zulip server development (linked above).  The
steps below might add some options to the `run-dev.py` command.


## 2. Find the right IP address

For development on the web app, you'd typically access your Zulip dev server
in a browser on your computer, with the URL `http://localhost:9991/`.  This
refers to port 9991 on `localhost`, which is a name that works for talking
to a server on your own computer.

That URL won't work for the mobile app, because on your phone (either
physical or emulated), `localhost` would be a name for the phone itself,
rather than your computer.  Instead, we'll find an IP address that we can
use instead of `localhost`, which will reach your computer when used on the
phone.

There are several ways to do this, depending on your platform.  See below.

### Android emulator

This works if you're running the app in the Android emulator, on the same
computer where you're running the dev server (either as a Vagrant host, or
directly.)

In this situation, the emulator provides 10.0.2.2 as a special alias for the
`localhost` of your computer.  (See [upstream docs][android-emulator-net].)
So you can just use `10.0.2.2` below.

[android-emulator-net]: https://developer.android.com/studio/run/emulator-networking

### Any (?) physical or emulated device

This method should work on any physical device, or the Android emulator or
iOS simulator.  (It's been tested at least on the Android emulator and a
physical iOS device.)

First, if you're using a physical device, connect it and your computer to
the same wifi network.  For an emulator/simulator, just run it on the same
computer you're running the Zulip server on.

We'll use **the IP address your computer uses on the local network**.  (For
a physical device, we want this to be the same network the phone is on.  For
an emulator/simulator, any IP address that belongs to your computer, and
isn't a special "loopback" address like 127.0.0.1, will do.)

To find this, you can use a command-line tool like (on Linux or macOS)
`ip addr` or `ifconfig`; or look in the network pane of macOS's System
Preferences or of Windows's Control Panel.  The IP address you want will
often start with `192.168`; the network interface it belongs to might look
like `wlp4s0` or `en1`.

For a detailed example, see our howto on [finding your IP
address](find-ip-address.md).

### Android (alternate)

See the [separate doc](dev-server-non-vagrant.md), written for a Zulip
server running directly on your host.

### iOS physical device

See the separate section below, at the end.


## 3. Set EXTERNAL_HOST

Like most complex web apps, the Zulip server has an idea internally of what
base URL it's supposed to be accessed at; we call this setting
`EXTERNAL_HOST`.  In development, the setting is normally `localhost:9991`,
and corresponds to a base URL of `http://localhost:9991/`.

Set this to `ADDRESS:9991`, where `ADDRESS` is the address you identified in
step 2.  In development, we can do this with an environment variable.  For
example, if in step 2 you chose 10.0.2.2, then run the server with this
command:

  $ <strong>EXTERNAL_HOST=10.0.2.2:9991</strong> tools/run-dev.py

(Note for Zulip server experts: This also sets `REALM_HOSTS`, via some logic
in `zproject/dev_settings.py`, which is actually the critical part here.)


## 4. Log in!

Now fire up the app on your emulator or device, go to the "switch account"
UI, and enter the URL of the dev server.

This will be `http://ADDRESS:9991`, where `ADDRESS` is the address you
identified in step 2.  (Be sure to type the `http://`.)


## Alternate instructions: iOS device and a dev server

This process needs improvement and has too many manual steps at the moment.

First, run the ZulipMobile app on your iOS device. Follow the instructions
[here](ios-tips.md#running-on-an-ios-device.

Find the IP address of your machine using [the instructions
above](#any--physical-or-emulated-device).

To connect to your Zulip dev server from other machines than the VM host,
you'll need manually set the host IP address in a `~/.zulip-vagrant-config`
file. Set:
```
HOST_IP_ADDR 0.0.0.0
```
This is a special value that means any value can connect to your dev server.
Restart the Vagrant guest.

Start your Zulip dev server, while setting `EXTERNAL_HOST` using port 9991
and the IP you just found. For example: `$ EXTERNAL_HOST=192.168.86.60:9991
./tools/run-dev.py`.

Finally, connect to the dev server on your iOS device by entering address of
the external host (you'll need to manually enter 'http://').
