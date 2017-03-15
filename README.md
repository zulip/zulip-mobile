# Zulip Mobile
**Under active development. First usable version coming soon**

[![Build Status](https://travis-ci.org/zulip/zulip-mobile.svg?branch=master)](https://travis-ci.org/zulip/zulip-mobile)


Zulip Mobile is a new, cross-platform mobile Zulip client written in
JavaScript with React Native.

We target iOS initially, with Android version following shortly.

## Why React Native?

* Support iOS and Android with one codebase
* Familiar web programming model (React + Javascript + Flexbox)
* Cross-platform, 90% code reuse between iOS and Android platforms

## Running

Run iOS:

* `npm run ios-min` - runs in an iOS simulator in the minimally supported device
(currently iPhone 5)

* `npm run ios-max` - runs in an iOS simulator in the newest/most premium
supported device (currently iPhone 7 Plus)

* `npm run ios-device` - runs on a physical iOS device, you need to edit the
device name in package.json

Run Android:

* Install the Android SDK including API 23 (Android 6.0), Build Tools, API Platform, Google APIs, Google Play Services, Android Support Library, the Local Maven Repository for Support and the Google Repository.

All of these can be installed, together with their dependencies, using the Android SDK manager.

* `react-native run-android` - runs in an Android emulator, emulator has to be
run manually before this command

## Fixing issues

If you are having issues running the code on your machine, either for the first time or after updating an outdated code with the latest, please run:

```
npm run reinstall
```

Optionally, reset iOS simulator:

```
iOS Menu > Simulator > Reset Content and Settings…
```

## Contributing

Please see the
[developer guide](https://github.com/zulip/zulip-mobile/tree/master/docs/developer-guide.md).

* **Pull requests**. Before a pull request can be merged, you need to
sign the [Dropbox Contributor License Agreement][cla]. Also,
please skim our [commit message style guidelines][doc-commit-style].

[cla]: https://opensource.dropbox.com/cla/
[doc-commit-style]: http://zulip.readthedocs.io/en/latest/code-style.html#commit-messages

* **Issues**. Before working on an issue make sure to claim it by commenting 
the following in the comment section:"**@zulipbot** claim". **@zulipbot** will 
assign you to the issue and label the issue as **in progress**. For more 
details, check out [**@zulipbot**](https://github.com/zulip/zulipbot).

## License

Copyright (c) 2016 Dropbox, Inc.

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
