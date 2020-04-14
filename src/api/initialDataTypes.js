/* @flow strict-local */

import type {
  CrossRealmBot,
  RealmEmojiById,
  RealmFilter,
  Stream,
  Subscription,
  User,
  UserGroup,
  UserPresence,
  UserStatusMapObject,
} from './apiTypes';

export type InitialDataBase = {|
  last_event_id: number,
  msg: string,
  queue_id: number,
|};

export type InitialDataAlertWords = {|
  alert_words: string[],
|};

export type InitialDataMessage = {|
  max_message_id: number,
|};

export type MuteTuple = [string, string];

export type InitialDataMutedTopics = {|
  muted_topics: MuteTuple[],
|};

export type InitialDataPresence = {|
  presences: {| [email: string]: UserPresence |},
|};

export type InitialDataRealm = {|
  max_icon_file_size: number,
  realm_add_emoji_by_admins_only: boolean,
  realm_allow_community_topic_editing: boolean,
  realm_allow_edit_history: boolean,
  realm_allow_message_deleting: boolean,
  realm_allow_message_editing: boolean,
  realm_authentication_methods: { GitHub: true, Email: true, Google: true },
  realm_available_video_chat_providers: string[],
  realm_bot_creation_policy: number,
  realm_bot_domain: string,
  realm_create_stream_by_admins_only: boolean,
  realm_default_language: string,
  realm_default_twenty_four_hour_time: boolean,
  realm_description: string,
  realm_disallow_disposable_email_addresses: boolean,
  realm_email_auth_enabled: boolean,
  realm_email_changes_disabled: boolean,
  realm_google_hangouts_domain: string,
  realm_icon_source: string,
  realm_icon_url: string,
  realm_inline_image_preview: boolean,
  realm_inline_url_embed_preview: boolean,
  realm_invite_by_admins_only: boolean,
  realm_invite_required: boolean,
  realm_is_zephyr_mirror_realm: boolean,
  realm_mandatory_topics: boolean,
  realm_message_content_delete_limit_seconds: number,
  realm_message_content_edit_limit_seconds: number,
  realm_message_retention_days: ?number,
  realm_name: string,
  realm_name_changes_disabled: boolean,
  realm_notifications_stream_id: number,
  realm_password_auth_enabled: boolean,
  realm_presence_disabled: boolean,
  realm_restricted_to_domain: boolean,
  realm_send_welcome_emails: boolean,
  realm_show_digest_email: boolean,
  realm_signup_notifications_stream_id: number,
  realm_uri: string,
  realm_video_chat_provider: string,
  realm_waiting_period_threshold: number,
|};

export type InitialDataRealmEmoji = {|
  realm_emoji: RealmEmojiById,
|};

export type InitialDataRealmFilters = {|
  realm_filters: RealmFilter[],
|};

export type InitialDataRealmUser = {|
  avatar_source: 'G',
  avatar_url: string | null,
  avatar_url_medium: string,
  can_create_streams: boolean,
  cross_realm_bots: CrossRealmBot[],
  email: string,
  enter_sends: boolean,
  full_name: string,
  is_admin: boolean,
  realm_non_active_users: User[],
  realm_users: User[],
  user_id: number,
|};

export type InitialDataRealmUserGroups = {|
  realm_user_groups: UserGroup[],
|};

type NeverSubscribedStream = {|
  description: string,
  invite_only: boolean,
  is_old_stream: boolean,
  name: string,
  stream_id: number,
|};

export type InitialDataStream = {|
  streams: Stream[],
|};

export type InitialDataSubscription = {|
  never_subscribed: NeverSubscribedStream[],
  subscriptions: Subscription[],
  unsubscribed: Subscription[],
|};

export type InitialDataUpdateDisplaySettings = {|
  default_language: string,
  emojiset: string,
  emojiset_choices: { [string]: string },
  high_contrast_mode: boolean,
  left_side_userlist: boolean,
  night_mode: boolean,
  timezone: string,
  translate_emoticons: boolean,
  twenty_four_hour_time: boolean,
|};

export type InitialDataUpdateGlobalNotifications = {|
  default_desktop_notifications: boolean,
  enable_desktop_notifications: boolean,
  enable_digest_emails: boolean,
  enable_offline_email_notifications: boolean,
  enable_offline_push_notifications: boolean,
  enable_online_push_notifications: boolean,
  enable_sounds: boolean,
  enable_stream_desktop_notifications: boolean,
  enable_stream_email_notifications: boolean,
  enable_stream_push_notifications: boolean,
  enable_stream_sounds: boolean,
  message_content_in_email_notifications: boolean,
  pm_content_in_desktop_notifications: boolean,
  realm_name_in_notifications: boolean,
|};

export type StreamUnreadItem = {|
  stream_id: number,
  topic: string,
  unread_message_ids: number[],
|};

export type HuddlesUnreadItem = {|
  user_ids_string: string,
  unread_message_ids: number[],
|};

export type PmsUnreadItem = {|
  sender_id: number,
  unread_message_ids: number[],
|};

/** Initial data for `update_message_flags` events. */
export type InitialDataUpdateMessageFlags = {|
  unread_msgs: {
    streams: StreamUnreadItem[],
    huddles: HuddlesUnreadItem[],
    count: number,
    pms: PmsUnreadItem[],
    mentions: number[],
  },
|};

export type InitialDataUserStatus = {|
  /**
   * Older servers (through at least 1.9.1) don't send this.
   * A missing value is equivalent to empty.
   */
  user_status?: UserStatusMapObject,
|};

// Initial data snapshot sent in response to a `/register` request.
export type InitialData = {|
  // The server sends different subsets of the full available data,
  // depending on what event types the client subscribes to with the
  // `fetch_event_types` field of the `/register` request. We name these
  // subsets after the event types that cause them to be included.
  //
  // See zerver/lib/events.py in fetch_initial_state_data for the
  // server-side implementation.
  ...InitialDataBase,
  ...InitialDataAlertWords,
  ...InitialDataMessage,
  ...InitialDataMutedTopics,
  ...InitialDataPresence,
  ...InitialDataRealm,
  ...InitialDataRealmEmoji,
  ...InitialDataRealmFilters,
  ...InitialDataRealmUser,
  ...InitialDataRealmUserGroups,
  ...InitialDataStream,
  ...InitialDataSubscription,
  ...InitialDataUpdateDisplaySettings,
  ...InitialDataUpdateGlobalNotifications,
  ...InitialDataUpdateMessageFlags,
  ...InitialDataUserStatus,
|};
