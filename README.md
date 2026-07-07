# Zulip Mobile (legacy, unsupported)

This codebase built on React Native is an **unsuppported legacy app**.
On 2025-06-07, we launched a [new Zulip mobile app with Flutter][zulip-flutter].

This repository will be archived soon;
see https://github.com/zulip/zulip-mobile/issues/5931.
If you're interested in contributing to Zulip's mobile apps,
see [zulip-flutter][zulip-flutter].

Details below are from when this app was in active development.
Some details may still be useful, but **bear in mind that this
legacy app is unsupported** as described above.

[zulip-flutter]: https://github.com/zulip/zulip-flutter


### Discussion

To get involved in Zulip Mobile development, please join us on
[the Zulip community Zulip server][czo-doc], in the
[#mobile-dev-help][czo-mobile-dev-help] channel.  Come say hello, discuss areas to
work on, and ask and answer questions.

Bug reports and feedback from using the app are welcome.
For those, please use the [#mobile][czo-mobile] channel;
that helps a wider set of Zulip contributors see your feedback.

[czo-mobile-dev-help]: https://chat.zulip.org/#narrow/stream/516-mobile-dev-help
[czo-mobile]: https://chat.zulip.org/#narrow/stream/48-mobile
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
hello in [the #mobile-dev-help stream](#discussion).

For more reading, take a look at our [developer docs](docs/).


### History

Zulip Mobile supersedes two legacy Zulip apps,
[zulip-ios](https://github.com/zulip/zulip-ios-legacy) and
[zulip-android](https://github.com/zulip/zulip-android)
([more history](https://github.com/zulip/zulip-android/blob/master/android-strategy.md)).


## License

Copyright (c) 2016-2024 Kandra Labs, Inc., and contributors, and 2016 Dropbox, Inc.

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
