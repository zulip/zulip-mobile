# Zulip Mobile

[![CI](https://github.com/zulip/zulip-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/zulip/zulip-mobile/actions/workflows/ci.yml?query=branch%3Amain)
[![Zulip chat](https://img.shields.io/badge/zulip-join_chat-brightgreen.svg)](https://chat.zulip.org/#narrow/stream/mobile)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zulip/zulip-mobile/blob/main/CONTRIBUTING.md)

Zulip Mobile is the official mobile Zulip client, supporting both iOS
and Android.


## Get the app

Release versions of the app are available here:
* [Zulip for iOS](https://itunes.apple.com/app/zulip/id1203036395)
  on the iTunes App Store
* [Zulip for Android](https://play.google.com/store/apps/details?id=com.zulipmobile)
  on the Google Play Store
  * Or if you don't use Google Play, you can [download an
    APK](https://github.com/zulip/zulip-mobile/releases/latest)
    from the official build we post on GitHub.

You can also help out by [running beta versions](#using-the-beta) of
the app, and reporting bugs!


## Contributing

Everyone is welcome to contribute. We gladly accept patches, pull requests,
bug reports, or any other improvements. Read below to see how you can get
started.

### Discussion

To get involved in Zulip Mobile development, please join us on
[the Zulip community Zulip server][czo-doc], in the
[#mobile][czo-mobile] stream.  Come say hello, discuss areas to
work on, and ask and answer questions.

[czo-mobile]: https://chat.zulip.org/#narrow/stream/mobile
[czo-doc]: https://zulip.readthedocs.io/en/latest/contributing/chat-zulip-org.html


### Using the beta

One important way to contribute is to run beta versions of the app, and report
bugs!  To get the beta:

* Android: install the app, then just
  [join the testing program](https://play.google.com/apps/testing/com.zulipmobile/)
  on Google Play.
  * Or if you don't use Google Play, you can [download an
    APK](https://github.com/zulip/zulip-mobile/releases/); the latest
    release on GitHub (including "pre-releases") is the current beta.
* iOS: install [TestFlight](https://developer.apple.com/testflight/testers/),
  then open [this public invitation link](https://testflight.apple.com/join/ZuzqwXGf)
  on your device.

Bug reports are welcome either in [the #mobile stream](#discussion) or
on this GitHub repo.


### Development

Zulip Mobile is written in JavaScript with React Native.  To get
started with the code, follow this doc:

* [Developer Guide](docs/developer-guide.md)

Then see our [Contribution Guidelines](CONTRIBUTING.md), and come say
hello in [the #mobile stream](#discussion).  Issues tagged
**[help wanted](https://github.com/zulip/zulip-mobile/labels/help%20wanted)**
are a great starting point for PRs.

For more reading, take a look at our [developer docs](docs/).


### History

Zulip Mobile supersedes two legacy Zulip apps,
[zulip-ios](https://github.com/zulip/zulip-ios-legacy) and
[zulip-android](https://github.com/zulip/zulip-android)
([more history](https://github.com/zulip/zulip-android/blob/master/android-strategy.md)).


## License

Copyright (c) 2016-2018 Kandra Labs, Inc., and contributors, and 2016 Dropbox, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

The software includes some works released by third parties under other
free and open source licenses. Those works are redistributed under the
license terms under which the works were received.
