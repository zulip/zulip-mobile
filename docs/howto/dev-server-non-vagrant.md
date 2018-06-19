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

3. Find the local IP address of your computer:
   ```
   $ ip addr
   ```
   The output should look similar to this:
   <pre>
   $ ip addr
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
        valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host
        valid_lft forever preferred_lft forever
    2: enp0s25: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN group default qlen 1000
        link/ether 54:ee:75:26:2e:d9 brd ff:ff:ff:ff:ff:ff
    3: wlp4s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
        link/ether 90:48:9a:a5:28:ef brd ff:ff:ff:ff:ff:ff
        inet <b>192.168.0.1</b>/24 brd 10.0.0.255 scope global dynamic noprefixroute wlp4s0
        valid_lft 225643sec preferred_lft 225643sec
        inet6 2a00:1028:8386:75de:20a4:2fdf:5373:31c3/64 scope global temporary dynamic
        valid_lft 172791sec preferred_lft 52729sec
        inet6 2a00:1028:8386:75de:ca5:d3cf:dd83:9b69/64 scope global dynamic mngtmpaddr noprefixroute
        valid_lft 172791sec preferred_lft 86391sec
        inet6 fe80::83a6:19d:16c6:5e0d/64 scope link noprefixroute
        valid_lft forever preferred_lft forever
   </pre>
   Find the network interface which connects you to your router. In this
   example, it is the wireless interface, `wlp4s0`. Locate your local IP
   address (highlighted above). This guide will proceed with `192.168.0.1`.
   Replace this IP address with your own local IP address in the following
   instructions.

4. Run
   ```sh
   EXTERNAL_HOST=192.168.0.1:9991 tools/run-dev.py --interface=''
   ```
   *Why does this work? We will use `http://192.168.0.1:9991` to connect to
   the Zulip dev server from the mobile app. Therefore, we must tell the dev
   server that it is now running under the name `192.168.0.1:9991` and that
   it should listen to requests made to this address. These two things can
   be done by setting the `EXTERNAL_HOST` environmental variable to
   `192.168.0.1:9991` and `interface` to `''`.*

5. In the Zulip mobile app, connect to a new server with the URL
   `http://192.168.0.1:9991`.

6. Done! You should now see a special Zulip dev server login screen where
   you can log in.
