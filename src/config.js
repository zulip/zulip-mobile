/* @flow */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const isDevelopment = process.env.NODE_ENV === 'development';
const isEmulator = NativeModules.RNDeviceInfo ? DeviceInfo.isEmulator() : false;

export default {
  compatibilityUrl: 'https://zulipchat.com/compatibility',
  messagesPerRequest: 20,
  scrollCallbackThrottle: 500,
  messageListThreshold: 500,
  enableReduxLogging: isDevelopment && !!global.btoa,
  enableReduxSlowReducerWarnings: isDevelopment && !!global.btoa,
  enableSentry: !isDevelopment && !isEmulator,
  enableNotifications: !isEmulator,
  sentryKey: 'ADD-DSN-HERE',
  enableErrorConsoleLogging: true,
};
