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

## Example: `ifconfig`, wifi, macOS

If you run the command `ifconfig` on a macOS machine connected to wifi, the
output might look similar to this:

<pre>
$ ifconfig
lo0: flags=8049&lt;UP,LOOPBACK,RUNNING,MULTICAST&gt; mtu 16384
	options=1203&lt;RXCSUM,TXCSUM,TXSTATUS,SW_TIMESTAMP&gt;
	inet 127.0.0.1 netmask 0xff000000
	inet6 ::1 prefixlen 128
	inet6 fe80::1%lo0 prefixlen 64 scopeid 0x1
	nd6 options=201&lt;PERFORMNUD,DAD&gt;
gif0: flags=8010&lt;POINTOPOINT,MULTICAST&gt; mtu 1280
stf0: flags=0&lt;&gt; mtu 1280
XHC20: flags=0&lt;&gt; mtu 0
en1: flags=8963&lt;UP,BROADCAST,SMART,RUNNING,PROMISC,SIMPLEX,MULTICAST&gt; mtu 1500
	options=60&lt;TSO4,TSO6&gt;
	ether 6a:00:02:98:c3:d0
	media: autoselect &lt;full-duplex&gt;
	status: inactive
en2: flags=8963&lt;UP,BROADCAST,SMART,RUNNING,PROMISC,SIMPLEX,MULTICAST&gt; mtu 1500
	options=60&lt;TSO4,TSO6&gt;
	ether 6a:00:02:98:c3:d1
	media: autoselect &lt;full-duplex&gt;
	status: inactive
en0: flags=8863&lt;UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST&gt; mtu 1500
	ether c4:b3:01:c1:ce:9f
	inet6 fe80::47e:23e4:2dbd:e1fa%en0 prefixlen 64 secured scopeid 0x7
	inet <b>192.168.86.89</b> netmask 0xffffff00 broadcast 192.168.86.255
	nd6 options=201&lt;PERFORMNUD,DAD&gt;
	media: autoselect
	status: active
p2p0: flags=8843&lt;UP,BROADCAST,RUNNING,SIMPLEX,MULTICAST&gt; mtu 2304
	ether 06:b3:01:c1:ce:9f
	media: autoselect
	status: inactive
awdl0: flags=8943&lt;UP,BROADCAST,RUNNING,PROMISC,SIMPLEX,MULTICAST&gt; mtu 1484
	ether 32:d0:80:06:6c:3b
	inet6 fe80::30d0:80ff:fe06:6c3b%awdl0 prefixlen 64 scopeid 0x9
	nd6 options=201&lt;PERFORMNUD,DAD&gt;
	media: autoselect
	status: active
bridge0: flags=8863&lt;UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST&gt; mtu 1500
	options=63&lt;RXCSUM,TXCSUM,TSO4,TSO6&gt;
	ether 6a:00:02:98:c3:d0
	Configuration:
		id 0:0:0:0:0:0 priority 0 hellotime 0 fwddelay 0
		maxage 0 holdcnt 0 proto stp maxaddr 100 timeout 1200
		root id 0:0:0:0:0:0 priority 0 ifcost 0 port 0
		ipfilter disabled flags 0x2
	member: en1 flags=3&lt;LEARNING,DISCOVER&gt;
	        ifmaxaddr 0 port 5 priority 0 path cost 0
	member: en2 flags=3&lt;LEARNING,DISCOVER&gt;
	        ifmaxaddr 0 port 6 priority 0 path cost 0
	nd6 options=201&lt;PERFORMNUD,DAD&gt;
	media: &lt;unknown type&gt;
	status: inactive
utun0: flags=8051&lt;UP,POINTOPOINT,RUNNING,MULTICAST&gt; mtu 2000
	inet6 fe80::126b:c8e2:bc66:596%utun0 prefixlen 64 scopeid 0xb
	nd6 options=201&lt;PERFORMNUD,DAD&gt;
utun1: flags=8051&lt;UP,POINTOPOINT,RUNNING,MULTICAST&gt; mtu 1380
	inet6 fe80::25e7:e24c:aadc:4f82%utun1 prefixlen 64 scopeid 0xc
	nd6 options=201&lt;PERFORMNUD,DAD&gt;
vboxnet0: flags=8842&lt;BROADCAST,RUNNING,SIMPLEX,MULTICAST&gt; mtu 1500
	ether 0a:00:27:00:00:00
vboxnet1: flags=8943&lt;UP,BROADCAST,RUNNING,PROMISC,SIMPLEX,MULTICAST&gt; mtu 1500
	ether 0a:00:27:00:00:01
	inet 172.28.128.1 netmask 0xffffff00 broadcast 172.28.128.255
</pre>

There are kind of a lot of different interfaces here.  The ones without an
`inet` value aren't likely to matter -- that means an IPv4 address.  Of
those, in this example:
* `lo0` is a "loopback" interface accessible only from itself.
* `vboxnet1` (and `vboxnet0`) are interfaces created by VirtualBox (or
  perhaps created by Vagrant and used by VirtualBox) for communicating with
  VMs managed by VirtualBox.
* `en0` is the wifi interface.

(If your local network is very futuristic, it's possible your wifi interface
will have only an IPv6 address, labeled `inet6`.  As of 2018, this is rare.)

The relevant IP address in this example is the `inet` value on the wifi
interface: `192.168.86.89`.

One command to help sort through this output would be
`ifconfig | grep 'inet.*broadcast'`:
<pre>
inet <b>192.168.86.89</b> netmask 0xffffff00 broadcast 192.168.86.255
inet 172.28.128.1 netmask 0xffffff00 broadcast 172.28.128.255
</pre>
