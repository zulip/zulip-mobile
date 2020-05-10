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

export type AvailableVideoChatProviders = {
  [providerName: string]: {| name: string, id: number |},
};

export type InitialDataRealm = {|
  jitsi_server_url?: string,
  max_icon_file_size: number,
  realm_add_emoji_by_admins_only: boolean,
  realm_allow_community_topic_editing: boolean,
  realm_allow_edit_history: boolean,
  realm_allow_message_deleting: boolean,
  realm_allow_message_editing: boolean,
  realm_authentication_methods: { GitHub: true, Email: true, Google: true },
  realm_available_video_chat_providers: AvailableVideoChatProviders,
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
  realm_video_chat_provider: number,
  realm_waiting_period_threshold: number,

  /**
   * Added in server version 2.2, feature level 1.
   * Same meaning as in the server_settings response:
   * https://zulipchat.com/api/server-settings
   */
  zulip_feature_level?: number,
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
  /**
   * Absent in servers prior to v1.8.0-rc1~2711 (or thereabouts).
   */
  realm_user_groups?: UserGroup[],
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

  /**
   * All servers, at least as far back as zulip/zulip@7a930af, in
   * 2017-02-20 (that's server 1.6.0), send this, as long as you've
   * specified `subscription` as a desired event type in the
   * `/register` call, which we do.
   *
   * This investigation is reported at
   * https://github.com/zulip/zulip-mobile/pull/4046#discussion_r414901766.
   */
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

  // Sorted.
  unread_message_ids: number[],

  /** All distinct senders of these messages; sorted. */
  // sender_ids: number[],
|};

export type HuddlesUnreadItem = {|
  /** All users, including self; numerically sorted, comma-separated. */
  user_ids_string: string,

  // Sorted.
  unread_message_ids: number[],
|};

/** The unreads in a 1:1 PM thread, as represented in `unread_msgs`. */
export type PmsUnreadItem = {|
  /**
   * Misnamed; really the *other* user, or self for a self-PM.
   *
   * This is almost always the same as the message's sender.  The case where
   * it isn't is where a (1:1) message you yourself sent is nevertheless
   * unread.  That case can happen if you send it through the API (though
   * the normal thing even then would be to make a bot user to send the
   * messages as.)  See server commit ca74cd6e3.
   */
  sender_id: number,

  // Sorted.
  unread_message_ids: number[],
|};

/** Initial data for `update_message_flags` events. */
export type InitialDataUpdateMessageFlags = {|
  /**
   * A summary of (almost) all unread messages, even those we don't have.
   *
   * This data structure contains a variety of sets of message IDs, all of
   * them unread messages: it has (almost) all unread messages' IDs, broken
   * out by conversation (stream + topic, or PM thread), plus unread
   * @-mentions.
   *
   * The valuable thing this gives us is that, at `/register` time, the
   * server looks deep into the user's message history to give us this data
   * on far more messages, if applicable, than we'd want to actually fetch
   * up front in full.  (Thanks to the handy PostgreSQL feature of "partial
   * indexes", it can have the database answer this question quite
   * efficiently.)
   *
   * The "almost" caveat is that there is an upper bound on this summary.
   * But it's giant -- starting with server commit 1.9.0-rc1~206, the
   * latest 50000 unread messages are included.
   *
   * This whole feature was new in Zulip 1.7.0.
   */
  // This is computed by `aggregate_unread_data` and its helper
  // `aggregate_message_dict`, consuming data supplied by
  // `get_raw_unread_data`, all found in `zerver/lib/message.py`.
  unread_msgs: {
    /**
     * Unread stream messages.
     *
     * NB this includes messages to muted streams and topics.
     */
    streams: StreamUnreadItem[],

    /** Unread group PM messages, i.e. with >=3 participants. */
    // "huddle" is the server's internal term for a group PM conversation.
    huddles: HuddlesUnreadItem[],

    /** Unread 1:1 PM messages. */
    pms: PmsUnreadItem[],

    /** Unread @-mentions. */
    // Unlike other lists of message IDs here, `mentions` is *not* sorted.
    mentions: number[],

    /**
     * Total *unmuted* unreads.
     *
     * NB this may be much less than the total number of message IDs in the
     * `streams`, `huddles`, and `pms` fields, because it excludes stream
     * messages that are muted.
     */
    count: number,
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
