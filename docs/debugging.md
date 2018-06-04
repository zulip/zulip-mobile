# Debugging

When developing, you often want to examine the state of the app, capture
events or print debugging messages. [React Native gives you several ways to
debug your app][react-debugging].

## Tools and setup

### Chrome Developer Tools

React Native supports debugging your app using Chrome's developer tools, in
much the same way you would a web app.  This provides you with prettily
formatted debug messages and helpful additional information.

To use it, start your app.  (Either in the emulator, or see
[here][chrome-devtools-device] for additional instructions to do this on a
physical device.)  Then, [open the Developer Menu][dev-menu].  Here, select
"Debug JS Remotely".  This will open a new tab in your browser, at
http://localhost:8081/debugger-ui .  Go to this tab and open the developer
console.

This console will show all console debug output from your app, which means
that you can debug the app with statements like
```js
console.debug(foobar)
```
Additionally, all Redux events are automatically logged to the console.

[chrome-devtools-device]: https://facebook.github.io/react-native/docs/debugging.html#debugging-on-a-device-with-chrome-developer-tools

### `adb logcat`

When running on Android, either in the emulator or on a physical device, you
can use ADB (the Android debugger) to fetch or watch the device's logs.
This will include any messages that you print with a statement like
```js
console.debug(foobar)
```

To see the logs, run `adb logcat`.  A helpful form for this command is
```
adb logcat -T 100 | grep ReactNativeJS
```
This filters out logs unrelated to the app, but includes anything you print
with `console.debug`.  It starts with the last 100 log lines from before you
run the command (so it can be helpful for seeing something that just
happened), and then it keeps running, printing any new log messages that
come through.  To quit, hit Ctrl-C.


### Common issues

#### "Debug JS remotely" opens a webpage that never loads.

For some reason, React Native may try to open a browser tab for you at
http://10.0.2.2:8081/debugger-ui .
Instead, it should be http://localhost:8081/debugger-ui .

To fix this, simply open http://localhost:8081/debugger-ui in your browser.
This should load the web debugger you expected. Also, if the app was showing
a blank screen before, it should now behave normally.

If you're still experiencing this issue, [open the Developer menu in your app][dev-menu].
Then, go to "Debug server host & port for device". Here, enter `localhost:8081`
and click OK. Now, try to open http://localhost:8081/debugger-ui again and see
if it works.

[dev-menu]: https://facebook.github.io/react-native/docs/debugging.html#accessing-the-in-app-developer-menu
[react-debugging]: https://facebook.github.io/react-native/docs/debugging.html


## Miscellaneous tips

### Message rendering

For debugging some issues, it helps to view in a browser the HTML and CSS we
generate for the WebView.  See `MessageListWeb#render` for instructions, with a
`console.log(html)` call you can uncomment.

