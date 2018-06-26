# Connecting to a non-Vagrant Zulip dev server

This guide contains instructions for connecting the Zulip mobile app to a
non-Vagrant Zulip dev server.

**Proceed only after reading
[Using a dev version of the server](build-run.md#using-a-dev-version-of-the-server)
and deciding that a non-Vagrant setup is better for you.**

## Connecting to a Zulip dev server that runs directly on your operating system

**These instructions have only been tested with Android.**

1. If you haven't already, install and provision a Zulip dev server for your
   OS:
    * [Ubuntu 18.04 Bionic, 16.04 Xenial, and 14.04 Trusty; Debian 9 Stretch](
        https://zulip.readthedocs.io/en/latest/development/setup-advanced.html#installing-directly-on-ubuntu-or-debian)
    * [other Linux distributions](
        https://zulip.readthedocs.io/en/latest/development/setup-advanced.html#installing-manually-on-linux)

2. Confirm you can access your Zulip dev server in a browser, at
   `http://localhost:9991/` (the standard setup).  This is *almost* the URL
   we need; except that `localhost` inside the emulated device means the
   emulated device itself, so we need to replace it with another name for
   your host.

3. Find the IP address of your computer on your local network (see
   [instructions](find-ip-address.md)).

4. Follow steps 3, 4, and 5 of [the main instructions](dev-server.md).

6. Done! You should now see a special Zulip dev server login screen where
   you can log in.
