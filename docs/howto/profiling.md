# Profiling

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


# Tools

## react-native-performance-monitor

This is a small project whose author announced it in a 2020 blog post:
  https://www.flagsmith.com/blog/react-native-performance-monitor

It uses the React Profiler API to measure render times, and provides
handy graphs and some ways to manage data from simple experiments.
It can be useful for benchmarking changes that get exercised by
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

 * For meaningful results, you should really be using a release build,
   not a debug build.  This requires a couple of additional steps to
   get working:

   * Both Android and iOS disallow plain `http:` requests by default,
     and at least on Android, RN's `fetch` implementation respects
     that.  This tool tries to `fetch` a plain-HTTP URL for the stats
     server, so it gets blocked by that policy.

     * On Android, we re-enable plain HTTP for debug builds (because
       the debug app needs it in order to reach the Metro server) with
       an attribute in our manifest.  When profiling with this, we
       just need to do the same for the release build we use.

     * On iOS we haven't tested this yet.

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

[demo branch]: https://github.com/zulip/zulip-mobile/compare/master...gnprice:dev-perf-monitor

Then probably rebase it to whatever you were working on; and rerun
`yarn`:
```
git cherry-pick upstream/master..greg/dev-perf-monitor
yarn
```

The branch covers most of the setup:
 * installing the tool
 * enabling plain HTTP, at least on Android
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
