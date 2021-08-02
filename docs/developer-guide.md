# Developer guide

We target operating systems >= Android 6 Marshmallow (API 23)
and >= iOS 12.1.  (Details [here](architecture/platform-versions.md).)

## Why React Native?

* Support iOS and Android with one codebase
* Familiar web programming model (React + Javascript + Flexbox)
* Cross-platform, 90% code reuse between iOS and Android platforms

## System requirements

* Android: You can build and run with any of Linux, Windows, or macOS.
* iOS: macOS only.  Many contributors use Linux or Windows and
  develop without testing on iOS.  Fortunately, React Native means
  this works fine.

## Setup

To become highly productive in working on Zulip Mobile, you'll want to set
up your development environment in several ways:

1. Building and running the app.  See [our instructions](howto/build-run.md).
2. An editor, or IDE, with good support for navigation and type information.
   This makes a big difference in productivity, and especially so when
   working in a codebase that's new to you.  See [our Editors / IDEs
   guide](howto/editor.md).
3. Git.  See [our Git guide](howto/git.md) for a bit of setup, and some
   valuable tips you may not know (even if you've been using Git for a while).
4. Debugging.  It's fine to skip this at first to get going, but when you're
   tackling a moderately complex issue, a good debugging setup can help a
   lot.  See [our debugging guide](howto/debugging.md) for details, including
   setup instructions.
