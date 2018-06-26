# Using a dev version of the server

This isn't required for most development -- you can use chat.zulip.org,
or another live Zulip community you belong to, for testing the mobile app.
But sometimes when debugging interactions with the server, or developing
server-side changes related to the mobile app, it's helpful to run the
mobile app against a development server which you control.

First, if you haven't already, you'll want to install and provision a
[Zulip Server dev VM](https://zulip.readthedocs.io/en/latest/development/overview.html).

Then, you'll
* run the Zulip server in the dev VM with `tools/run-dev.py`, following the
  usual instructions for Zulip server development (linked above);
* fire up the app, go to the "switch account" UI, and enter a URL
  where the app can find your own Zulip server.

The details of how to get that URL to enter vary by platform.  See below.

(PRs to extend these instructions to cover other setups would be
welcome!)


## Android emulator and a dev server

First, confirm you can access your Zulip dev server in a browser, at
`http://localhost:9991/` (the standard setup).  This is *almost* the URL we
need; except that `localhost` inside the emulated device means the emulated
device itself, so we need to replace it with another name for your host.

Then, on the same host machine where you can do that in a browser:
run `react-native start`, and open the app in an Android emulator.
Hit "reload" in the React Native dev menu (or an equivalent keyboard
shortcut) to reload the app's JS code -- and pay close attention to the
green banner that appears at the top.  It will say something like
"Loading from 10.0.2.2:8081...".

The IP address that appears in the message is the one you want to use.
We'll use it in two ways:

* Stop your Zulip dev server, and restart it while setting `EXTERNAL_HOST`.
  Continuing the same example:

    $ EXTERNAL_HOST=10.0.2.2:9991 tools/run-dev.py

* For the URL to enter in the app, borrow the scheme `http` and port `9991`
  from the URL you previously used for the dev Zulip server -- so to
  continue the same example, you would enter the URL `http://10.0.2.2:9991/`.

Why does this work?  The green "Loading" banner identifies the IP address
and port at which the app is able to find your Metro Bundler server, the
process started by `react-native start`.  Therefore, that IP address is one
that works inside the emulated device as a way to reach your host machine...
which is also known as `localhost` when on the host machine itself.

Meanwhile, in order for the server to accept the app's requests, it has to
recognize the URLs the app is using as belonging to the relevant org/realm.
On the Zulip server in general, one way to control this is the setting
`REALM_HOSTS`; and the dev settings file `zproject/dev_settings.py` sets
that based on the environment variable `EXTERNAL_HOST` (as well as setting
the Zulip setting of that name.)


## iOS device and a dev server

This process needs improvement and has too many manual steps at the moment.

First, you'll need to connect your dev machine and iOS device to the same
network. If you're running Zulip inside of a VM, you may also need to
configure your VM to use a public network. See more information on this [here](https://www.vagrantup.com/docs/networking/public_network.html).

Next, you'll need to change all instances of `localhost:9991` in both the
`/src` directory and the Xcode iOS project (located in `/ios`) to point to
the IP and port of your Vagrant VM.

Finally, run the Xcode project inside of `/ios` with your iOS device as the
target.
