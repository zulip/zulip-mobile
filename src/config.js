/* @flow */
const isDevelopment = process.env.NODE_ENV === 'development' && !!global.btoa;

export default {
  devRealm: 'http://localhost:9991', // the default realm suggested during development
  productionRealm: '', // the default realm suggested in production
  compatibilityUrl: 'https://zulipchat.com/compatibility',
  defaultLoginEmail: '', // useful during development, empty for production
  defaultLoginPassword: '', // useful during development, empty for production
  messagesPerRequest: 20, // number of messages to request at once
  scrollCallbackThrottle: 500,
  startMessageListThreshold: 500,
  endMessageListThreshold: 500,
  enableReduxLogging: !isDevelopment,
  enableSentry: !isDevelopment,
  sentryKey: 'ADD-DSN-HERE',
};
