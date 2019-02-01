/* @flow strict-local */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const isDevelopment = process.env.NODE_ENV === 'development';
const isEmulator = NativeModules.RNDeviceInfo ? DeviceInfo.isEmulator() : false;

type Config = {|
  messagesPerRequest: number,
  scrollCallbackThrottle: number,
  messageListThreshold: number,
  enableReduxLogging: boolean,
  enableReduxSlowReducerWarnings: boolean,
  enableSentry: boolean,
  enableWebViewErrorDisplay: boolean,
  slowReducersThreshold: number,
  sentryKey: string,
  enableErrorConsoleLogging: boolean,
  serverDataOnStartup: string[],
|};

const config: Config = {
  messagesPerRequest: 50,
  scrollCallbackThrottle: 250,
  messageListThreshold: 250,
  enableReduxLogging: isDevelopment && !!global.btoa,
  enableReduxSlowReducerWarnings: isDevelopment && !!global.btoa,
  enableSentry: !isDevelopment && !isEmulator,
  enableWebViewErrorDisplay: isDevelopment,
  slowReducersThreshold: 5,
  sentryKey: 'ADD-DSN-HERE',
  enableErrorConsoleLogging: true,
  serverDataOnStartup: [
    'alert_words',
    'message',
    'muted_topics',
    'presence',
    'realm',
    'realm_emoji',
    'realm_filters',
    'realm_user',
    'realm_user_groups',
    'subscription',
    'update_display_settings',
    'update_global_notifications',
    'update_message_flags',
  ],
};

export default config;
