/* @flow */

if (__DEV__) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const Reactotron = require('reactotron-react-native').default;
  Reactotron.configure()
    .useReactNative() // use all built-in react native plugins
    .connect();
}
