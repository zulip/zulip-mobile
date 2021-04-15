/* @flow strict-local */
const isDevelopment = process.env.NODE_ENV === 'development';

type Config = {|
  messagesPerRequest: number,
  messageListThreshold: number,
  enableReduxLogging: boolean,
  enableReduxSlowReducerWarnings: boolean,
  enableWebViewErrorDisplay: boolean,
  slowReducersThreshold: number,
  enableErrorConsoleLogging: boolean,
  serverDataOnStartup: string[],
  appOwnDomains: string[],
|};

const config: Config = {
  messagesPerRequest: 100,
  messageListThreshold: 4000,
  enableReduxLogging: isDevelopment && !!global.btoa,
  enableReduxSlowReducerWarnings: isDevelopment && !!global.btoa,
  enableWebViewErrorDisplay: isDevelopment,
  slowReducersThreshold: 5,
  enableErrorConsoleLogging: true,
  serverDataOnStartup: [
    'alert_words',
    'message',
    'muted_topics',
    'muted_users',
    'presence',
    'realm',
    'realm_emoji',
    'realm_filters',
    'realm_linkifiers',
    'realm_user',
    'realm_user_groups',
    'recent_private_conversations',
    'stream',
    'subscription',
    'update_display_settings',
    'update_global_notifications',
    'update_message_flags',
    'user_status',
  ],
  appOwnDomains: ['zulip.com', 'zulipchat.com', 'chat.zulip.org'],
};

export default config;
