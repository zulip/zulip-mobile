# Debugging

When developing, you often want to examine the state of the app, capture
events or print debugging messages. [React Native gives you several ways to
debug your app][react-debugging].

## Setting up tools

### Remote JS Debugger

The Remote JS Debugger allows you to debug your app in the browser developer
console. It provides you with prettily formatted debug messages and helpful
additional information.

To use it, start your app. Then, [open the Developer Menu][dev-menu].
Here, select "Debug JS Remotely". This will open a new tab at
http://localhost:8081/debugger-ui. Go to this tab and open the browser developer
console. It will print all console debug output of your app. This means that you
can debug the app with statements like
```js
console.debug(foobar)
```
Additionally, the developer console will log all Redux events.

### Common issues

#### "Debug JS remotely" opens a webpage that never loads.

For some reason, React tries to connect to http://10.0.2.2:8081/debugger-ui.
Instead, it should connect to http://localhost/debugger-ui.

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

