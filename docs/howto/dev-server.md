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

In the app, hit "reload" in the React Native dev menu (or an equivalent
keyboard shortcut) to reload the app's JS code -- and pay close attention to
the green banner that appears at the top.  It will say something like
"Loading from 10.0.2.2:8081...".

The IP address that appears in the message is the one you want to use.

Why does this work?  The green "Loading" banner identifies the IP address
and port at which the app is able to find your Metro Bundler server, the
process started by `react-native start`.  Therefore, that IP address is one
that works inside the emulated device as a way to reach your host machine.

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

First, you'll need to connect your dev machine and iOS device to the same
network. If you're running Zulip inside of a VM, you may also need to
configure your VM to use a public network. See more information on this [here](https://www.vagrantup.com/docs/networking/public_network.html).

Next, you'll need to change all instances of `localhost:9991` in both the
`/src` directory and the Xcode iOS project (located in `/ios`) to point to
the IP and port of your Vagrant VM.

Finally, run the Xcode project inside of `/ios` with your iOS device as the
target.
