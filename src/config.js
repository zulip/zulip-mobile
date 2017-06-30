/* @flow */
export default {
  devRealm: 'http://localhost:9991', // the default realm suggested during development
  productionRealm: '', // the default realm suggested in production
  compatibilityUrl: 'https://zulipchat.com/compatibility',
  defaultLoginEmail: '', // useful during development, empty for production
  defaultLoginPassword: '', // useful during development, empty for production
  messagesPerRequest: 50, // number of messages to request at once
  scrollCallbackThrottle: 500,
  startMessageListThreshold: 1500,
  endMessageListThreshold: 1500,
};
