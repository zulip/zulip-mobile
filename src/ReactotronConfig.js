/* eslint-disable */
if (__DEV__) {
  const Reactotron_all = require('reactotron-react-native');
  Reactotron = Reactotron_all.default;
  const { asyncStorage, networking, openInEditor } = Reactotron_all;
  const { reactotronRedux } = require('reactotron-redux');
  const { NativeModules } = require('react-native');
  const scriptURL = NativeModules.SourceCode.scriptURL;
  const scriptHostname = scriptURL.split('://')[1].split(':')[0]; //To retrieve scriptURL from device

  console.logs = (data) => Reactotron.log(data,true);

  //Comment out next lines to disable reactotron connection
  Reactotron.configure({ host: scriptHostname, name: "Zulip Mobile" }) // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .use(reactotronRedux())
  .use(asyncStorage())
  .use(networking())
  .use(openInEditor())
  .connect();
}