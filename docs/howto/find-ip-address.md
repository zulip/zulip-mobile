# Finding your computer's IP address

This doc describes how to find the IP address your computer uses on the
local network.  This is often needed as a step in setting up to [use a dev
version of the Zulip server](dev-server.md) with the app.

In brief:
* Look at your network configuration, either with a command line tool like
  `ip addr` or `ifconfig` (both available for Linux and macOS) or in the
  network pane of macOS's System Preferences or of Windows's Control Panel.
* Look there for the IP address on your wifi interface, or whatever network
  interface connects your computer to the Internet.  The IP address you want
  will often start with `192.168`.  The network interface it belongs to
  might look like `wlp4s0` or `en1`.

More detail below.  (PRs with examples of different configurations would be
very welcome!)

## Example: `ip addr`, wifi, Linux

If you run the command `ip addr` on a Linux machine connected to wifi, the
output might look similar to this:

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
    inet <b>192.168.0.23</b>/24 brd 10.0.0.255 scope global dynamic noprefixroute wlp4s0
    valid_lft 225643sec preferred_lft 225643sec
    inet6 2a00:1028:8386:75de:20a4:2fdf:5373:31c3/64 scope global temporary dynamic
    valid_lft 172791sec preferred_lft 52729sec
    inet6 2a00:1028:8386:75de:ca5:d3cf:dd83:9b69/64 scope global dynamic mngtmpaddr noprefixroute
    valid_lft 172791sec preferred_lft 86391sec
    inet6 fe80::83a6:19d:16c6:5e0d/64 scope link noprefixroute
    valid_lft forever preferred_lft forever
</pre>

Here `lo` is the "loopback" interface accessible only from itself.  `wlp4s0`
is this computer's wifi interface.  IP (v4) addresses are introduced with
the label `inet`.

The relevant IP address in this example is the `inet` value on the wifi
interface: `192.168.0.23`.
