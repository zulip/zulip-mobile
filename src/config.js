/* @flow */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import type { Narrow, Notification } from './types';
import { FIRST_UNREAD_ANCHOR } from './constants';

const isDevelopment = process.env.NODE_ENV === 'development';
const isEmulator = NativeModules.RNDeviceInfo ? DeviceInfo.isEmulator() : false;

type Config = {
  startup: {
    narrow: ?Narrow,
    anchor: number,
    notification: ?Notification,
  },
  compatibilityUrl: string,
  messagesPerRequest: number,
  scrollCallbackThrottle: number,
  messageListThreshold: number,
  enableReduxLogging: boolean,
  enableReduxSlowReducerWarnings: boolean,
  enableSentry: boolean,
  enableWebViewErrorDisplay: boolean,
  enableNotifications: boolean,
  slowReducersThreshold: number,
  sentryKey: string,
  enableErrorConsoleLogging: boolean,
  trackServerEvents: string[],
  serverDataOnStartup: string[],
};

const config: Config = {
  startup: {
    narrow: undefined,
    anchor: FIRST_UNREAD_ANCHOR,
    notification: undefined,
  },
  compatibilityUrl: 'https://zulipchat.com/compatibility',
  messagesPerRequest: 50,
  scrollCallbackThrottle: 250,
  messageListThreshold: 250,
  enableReduxLogging: isDevelopment && !!global.btoa,
  enableReduxSlowReducerWarnings: isDevelopment && !!global.btoa,
  enableSentry: !isDevelopment && !isEmulator,
  enableWebViewErrorDisplay: isDevelopment,
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
    'user_group',
  ],
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
