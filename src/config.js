/* @flow */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const isDevelopment = process.env.NODE_ENV === 'development';
const isEmulator = NativeModules.RNDeviceInfo ? DeviceInfo.isEmulator() : false;

export default {
  startup: {
    narrow: undefined,
    anchor: 0,
  },
  compatibilityUrl: 'https://zulipchat.com/compatibility',
  messagesPerRequest: 50,
  scrollCallbackThrottle: 250,
  messageListThreshold: 250,
  enableReduxLogging: isDevelopment && !!global.btoa,
  enableReduxSlowReducerWarnings: isDevelopment && !!global.btoa,
  enableSentry: !isDevelopment && !isEmulator,
  enableNotifications: !isEmulator,
  slowReducersThreshold: 5,
  sentryKey: 'ADD-DSN-HERE',
  enableErrorConsoleLogging: true,
  trackServerEvents: [
    // 'custom_profile_fields', // ???
    'delete_message',
    // 'hotspots', // ???
    'message',
    'muted_topics',
    // 'pointer', // we are not interested
    'presence',
    'reaction',
    // 'realm_bot', // ???
    // 'realm_domains', // ???
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
    // 'user_group', // ???
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
