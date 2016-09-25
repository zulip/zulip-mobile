# Zulip Mobile
**NOTE: VERY EARLY PROOF OF CONCEPT (NOT USABLE)**

[![Build Status](https://travis-ci.org/zulip/zulip-mobile.svg?branch=master)](https://travis-ci.org/zulip/zulip-mobile)


Zulip Mobile is a new, experimental mobile client written in Javascript with React Native. The current goal is to assess whether React Native makes sense as a long-term direction for the mobile apps.

It will initially target iOS only (although most of the code will be cross-platform).

## Why React Native?
Pros:
* Support iOS and Android with one codebase
* Familiar web programming model (React + Javascript + Flexbox)

Cons:
* Potential performance issues
* Greater technical risk (new ecosystem, not as battle-tested as native code)

## Development

Please see the [developer guide](https://github.com/zulip/zulip-mobile/tree/master/docs/developer-guide.md).

## License

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
