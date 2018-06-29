/* @flow */
import { NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import type { Narrow, Notification } from './types';

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
  discardKeys: string[],
  storeKeys: string[],
  cacheKeys: string[],
};

const config: Config = {
  startup: {
    narrow: undefined,
    anchor: 0,
    notification: undefined,
  },
  compatibilityUrl: 'https://zulipchat.com/compatibility',
  messagesPerRequest: 50,
  scrollCallbackThrottle: 250,
  messageListThreshold: 250,
  enableReduxLogging: isDevelopment && !!global.btoa,
  enableReduxSlowReducerWarnings: isDevelopment && !!global.btoa,
  enableSentry: !isDevelopment && !isEmulator,
  enableWebViewErrorDisplay: true,
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

  /**
   * Properties on the global store which we explicitly choose not to persist.
   *
   * All properties on the global store should appear either here or in the
   * lists of properties we do persist, below.
   */
  discardKeys: [
    'alertWords',
    'caughtUp',
    'fetching',
    'flags',
    'loading',
    'nav',
    'presence',
    'session',
    'topics',
    'typing',
  ],

  /**
   * Properties on the global store which we persist because they are local.
   *
   * These represent information that belongs to this device (and this
   * install of the app), where things wouldn't work right if we didn't
   * persist them.
   */
  storeKeys: ['accounts', 'drafts', 'outbox', 'settings'],

  /**
   * Properties on the global store which we persist for caching's sake.
   *
   * These represent information for which the ground truth is on the
   * server, but which we persist locally so that we have it cached and
   * don't have to re-download it.
   */
  cacheKeys: [
    'messages',
    'mute',
    'realm',
    'streams',
    'subscriptions',
    'unread',
    'userGroups',
    'users',
  ],
};

export default config;
