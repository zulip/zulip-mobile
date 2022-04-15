# Profiling and benchmarking

Here's some miscellaneous ideas on profiling and benchmarking.


# General

**Profiling** means seeing where time is going -- so when things are
slow, seeing what code specifically is most useful to make faster.

**Benchmarking** means comparing alternate implementations of the same
thing, to see which one is faster and by how much.

In general, for meaningful results, both should be done on **release
builds** of the app: debug builds may run very differently, and one
thing may be faster than another in debug but slower in release.
React in particular has lots of checks that run only in debug builds,
which can make profiles and benchmarks look very different from when
those checks don't run.

Similarly, both are best to do on a real physical device, not an
emulator/simulator.  An emulated device runs on your desktop CPU,
which can have quite different performance behavior from a mobile
device's CPU.

Even more so, both profiling and benchmarking are likely to give
distorted results if done with JS debugging.  On top of requiring a
debug build of the app, RN's [JS debugging](debugging.md#chrome-devtools)
involves the JavaScript code actually running inside Chrome on your
desktop -- which means not only a different CPU but a completely
different JS engine from the one RN uses for the actual app.


# Tools

## `console.log` and manual timing

For either benchmarking, or coarse-grained profiling, a simple
approach by manually adding some timing code can work well.

You can add `performance.now()` to measure times, and `console.log()`
to print the results.  (Don't use `Date.now()`; it gives times only to
the nearest millisecond.)

See our [debugging guide](debugging.md#native) for how to view the
output of `console.log`.  (As discussed above, you don't want to be
using JS debugging for this -- which would mean running different code
from the normal experience of the app, in a different JS engine, on a
different class of CPU -- so you won't have the JS console.)

For an example, see [this thread][] with code for measuring Redux
`dispatch` timings with this technique, and some results.

[this thread]: https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/data-structure.20performance/near/1068967

The major limitation of this approach is that it can't be used for
fine-grained exploration of the call graph: trying to run
`console.log` more than perhaps once every few ms risks slowing things
down and altering the results, and adding logging too voluminously
would also just be a lot of manual work.


## Chrome DevTools

This approach means using a debug build of the app, and [remote JS
debugging](debugging.md#chrome-devtools), in order to be able to use
Chrome's Developer Tools, which have a well-developed profiling
system.

For the reasons mentioned above, this approach's results are likely to
be seriously distorted from reality.  But where there are really big
glaring inefficiencies, it may nevertheless be good enough to locate
them.  Its big advantage is that it provides a sophisticated tool for
recording detailed profiles and then exploring them.

For an example session with this tool, see [thread here][].  See also
[Chrome profiler documentation][].

[thread here]: https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/data-structure.20performance/near/1069174
[Chrome profiler documentation]: https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference


## react-native-performance-monitor

This is a small project whose author announced it in a 2020 blog post:
  https://www.flagsmith.com/blog/react-native-performance-monitor

It uses the React Profiler API to measure render times, and provides
handy graphs and some ways to manage data from simple experiments.
It can be useful for **benchmarking** changes that get exercised by
rendering some particular component.

Setup requires a few steps not documented in the tool's readme:

 * If using the Android emulator, you need to forward relevant
   ports:

       adb reverse tcp:8125 tcp:8125
       adb reverse tcp:8126 tcp:8126

   This allows requests to 127.0.0.1 port 8125 from inside the
   emulator to reach port 8125 on your dev machine, where the stats
   server is listening for them.

   * If using a physical Android device, the same `adb reverse`
     commands can save you from having to mess with the IP address
     where you invoke the profiler in the app code.

 * If using a physical iOS device, first make sure the device and your
   computer are connected to the same local network. Then find your
   computer's local IP address.

   * You'll [need to use
     this](https://github.com/Flagsmith/react-native-performance-monitor#connecting-to-a-real-device)
     every time you invoke the profiler in the app code. (This means
     passing it in calls to `withPerformanceMonitor`, if using, and
     sending requests to it with `fetch` for not-React profiling in
     the way described below.)

   * If using an iOS simulator, you don't need your computer's local
     IP address.

 * iOS disallows plain `http:` requests in both debug and release
   builds by default, with something Apple calls "App Transport
   Security". We don't override that in either configuration, so
   you'll need to do so temporarily because this tool tries to `fetch`
   a plain-HTTP URL for the stats server. You can disable the ATS
   restrictions entirely by flipping the `NSAllowsArbitraryLoads`
   switch in the `Info.plist`, as described in the [iOS Tips
   doc](ios-tips.md#disable-ats).

 * For meaningful results, you should really be using a release build,
   not a debug build.  This requires a couple of additional steps to
   get working:

   * Android: Temporarly enable plain HTTP for release builds. (We
     already enable it for debug builds so that the debug app can
     reach the Metro server.) This tool needs to `fetch` a plain-HTTP
     URL for the stats server.

   * The React Profiler API is disabled by default when React is in
     release mode.  React offers a third, "profiling" mode, which is
     like release mode but adds back just the few bits of
     instrumentation needed for profiling.  So we need to select that
     mode... which turns out to call for rather a hack.


### Recipe

Start from Greg's [demo branch][]:
```
git remote add greg git@github.com:gnprice/zulip-mobile
git fetch greg dev-perf-monitor
```

[demo branch]: https://github.com/zulip/zulip-mobile/compare/main...gnprice:dev-perf-monitor

Then probably rebase it to whatever you were working on; and rerun
`yarn`:
```
git cherry-pick upstream/main..greg/dev-perf-monitor
yarn
```

The branch covers most of the setup:
 * installing the tool
 * enabling plain HTTP on iOS and Android
 * enabling React.Profiler

Add the `adb reverse` steps, if on Android:
```
adb reverse tcp:8125 tcp:8125
adb reverse tcp:8126 tcp:8126
```
and when running the app, run a release build: try `react-native
run-android --variant=release` or `react-native run-ios
--variant=release`.  Otherwise follow the instructions from the
upstream README, to run the stats server and open the tool's webapp in
your browser.


## react-native-performance-monitor, for not-React

The same `react-native-performance-monitor` tool could be used for
just its stats server and graphing, to measure something that isn't
the rendering of a React component.

Specifically, the way it logs a measurement just amounts to:
```js
  fetch(`http://${ip ?? '127.0.0.1'}:8125/value`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: durationMs }),
  });
```
which can be put into a simple self-contained helper function without
importing any library code.

The same steps as in the section above apply, except that
React.Profiler isn't involved and so one of the commits on that demo
branch isn't necessary.
