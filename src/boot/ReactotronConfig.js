/* @flow */

let Reactotron; // eslint-disable-line import/no-mutable-exports

if (__DEV__ && !process.env.JEST_WORKER_ID) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  Reactotron = require('reactotron-react-native').default;
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const { reactotronRedux } = require('reactotron-redux');
  Reactotron.configure()
    .useReactNative() // use all built-in react native plugins
    .use(reactotronRedux())
    .connect();
}

export default Reactotron;
