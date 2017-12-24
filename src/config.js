/* @flow */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const isDevelopment = process.env.NODE_ENV === 'development';
const isEmulator = NativeModules.RNDeviceInfo ? DeviceInfo.isEmulator() : false;

export default {
  compatibilityUrl: 'https://zulipchat.com/compatibility',
  messagesPerRequest: 50,
  scrollCallbackThrottle: 500,
  messageListThreshold: 500,
  enableReduxLogging: isDevelopment && !!global.btoa,
  enableReduxSlowReducerWarnings: isDevelopment && !!global.btoa,
  enableSentry: !isDevelopment && !isEmulator,
  enableNotifications: !isEmulator,
  slowReducersThreshold: 5,
  sentryKey: 'ADD-DSN-HERE',
  enableErrorConsoleLogging: true,
  trackServerEvents: [
    'message',
    'muted_topics',
    'presence',
    'reaction',
    'realm_emoji',
    'realm_filters',
    'realm_user',
    'stream',
    'subscription',
    'typing',
    'update_message',
    'update_message_flags',
    'update_display_settings',
    'update_global_notifications',
  ],
  serverDataOnStartup: [
    'alert_words',
    'message',
    'muted_topics',
    'presence',
    'realm_emoji',
    'realm_filters',
    'realm_user',
    'subscription',
    'update_display_settings',
    'update_global_notifications',
    'update_message_flags',
  ],
};
