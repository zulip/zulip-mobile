/* @flow strict-local */

import type {
  CrossRealmBot,
  MutedUser,
  RealmEmojiById,
  RealmFilter,
  RealmLinkifier,
  RecentPrivateConversation,
  Stream,
  Subscription,
  User,
  UserGroup,
  UserId,
  UserPresence,
  UserStatusMapObject,
} from './apiTypes';

export type InitialDataBase = $ReadOnly<{|
  last_event_id: number,
  msg: string,
  queue_id: string,

  // The feature level and server version, below, are included
  // unconditionally as of 3.0 (zulip/zulip@2c6313019), which is why we put
  // them in `InitialDataBase`. To get them from servers older than that, we
  // have to pass `zulip_version` in `fetch_event_types`, which we do.
  //
  // TODO(server-3.0): We can stop passing `zulip_version` in
  // `fetch_event_types` and remove this comment.

  /**
   * Added in server version 3.0, feature level 1.
   * Same meaning as in the server_settings response:
   * https://zulip.com/api/get-server-settings. See also the comment above.
   */
  // TODO(server-3.0): Mark as required.
  zulip_feature_level?: number,

  /**
   * Should be present as far back as 1.6.0 (zulip/zulip@d9b10727f). Same
   * meaning as in the server_settings response:
   * https://zulip.com/api/get-server-settings. See also the comment above
   * `zulip_feature_level`, above.
   */
  zulip_version: string,
|}>;

export type InitialDataAlertWords = $ReadOnly<{|
  alert_words: $ReadOnlyArray<string>,
|}>;

export type InitialDataMessage = $ReadOnly<{|
  max_message_id: number,
|}>;

export type MuteTuple = [string, string];

export type InitialDataMutedTopics = $ReadOnly<{|
  muted_topics: $ReadOnlyArray<MuteTuple>,
|}>;

export type InitialDataMutedUsers = $ReadOnly<{|
  /** (When absent, treat as empty.  Added in server version 4.0, feature level 48.) */
  muted_users?: $ReadOnlyArray<MutedUser>,
|}>;

export type InitialDataPresence = $ReadOnly<{|
  presences: {| +[email: string]: UserPresence |},
|}>;

export type AvailableVideoChatProviders = $ReadOnly<{|
  [providerName: string]: $ReadOnly<{| name: string, id: number |}>,
|}>;

export type InitialDataRealm = $ReadOnly<{|
  jitsi_server_url?: string,
  max_icon_file_size: number,
  realm_add_emoji_by_admins_only: boolean,
  realm_allow_community_topic_editing: boolean,
  realm_allow_edit_history: boolean,
  realm_allow_message_deleting: boolean,
  realm_allow_message_editing: boolean,
  realm_authentication_methods: $ReadOnly<{ GitHub: true, Email: true, Google: true, ... }>,
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

  // In 5.0 (feature level 100), the representation the server sends for "no
  // limit" changed from 0 to `null`, and 0 became an invalid value. (For
  // the invalid-value part, see zulip/zulip#20131.)
  realm_message_content_delete_limit_seconds: number | null,

  realm_message_content_edit_limit_seconds: number,
  realm_message_retention_days: number | null,
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
|}>;

export type InitialDataRealmEmoji = $ReadOnly<{|
  realm_emoji: RealmEmojiById,
|}>;

export type RawInitialDataRealmFilters = $ReadOnly<{|
  // We still request this, since not all servers can provide the
  // newer `realm_linkifiers` format.
  // TODO(server-4.0): Drop this.
  realm_filters?: $ReadOnlyArray<RealmFilter>,
|}>;

/**
 * The realm_filters/realm_linkifiers data, post-transformation.
 *
 * If we got the newer `realm_linkifiers` format, this is the result of
 * transforming that into the older `realm_filters` format. Otherwise, it's
 * just what we received in the `realm_filters` format. So, named after
 * realm_filters.
 *
 * See notes on `RealmFilter` and `RealmLinkifier`.
 */
export type InitialDataRealmFilters = $ReadOnly<{|
  realm_filters: $ReadOnlyArray<RealmFilter>,
|}>;

export type InitialDataRealmLinkifiers = $ReadOnly<{|
  // Possibly absent: Not all servers can provide this. See
  // `InitialDataRealmFilters`.
  realm_linkifiers?: $ReadOnlyArray<RealmLinkifier>,
|}>;

export type RawInitialDataRealmUser = $ReadOnly<{|
  avatar_source: 'G',
  avatar_url: string | null,
  avatar_url_medium: string,
  can_create_streams: boolean,
  cross_realm_bots: $ReadOnlyArray<{| ...CrossRealmBot, +avatar_url?: string | null |}>,
  email: string,
  enter_sends: boolean,
  full_name: string,
  is_admin: boolean,
  realm_users: $ReadOnlyArray<{| ...User, avatar_url?: string | null |}>,
  realm_non_active_users: $ReadOnlyArray<{| ...User, avatar_url?: string | null |}>,
  user_id: UserId,
|}>;

export type InitialDataRealmUser = $ReadOnly<{|
  ...RawInitialDataRealmUser,
  cross_realm_bots: $ReadOnlyArray<CrossRealmBot>,
  realm_non_active_users: $ReadOnlyArray<User>,
  realm_users: $ReadOnlyArray<User>,
|}>;

export type InitialDataRealmUserGroups = $ReadOnly<{|
  /**
   * Absent in servers prior to v1.8.0-rc1~2711 (or thereabouts).
   */
  // TODO(server-1.8): Mark as required.
  realm_user_groups?: $ReadOnlyArray<UserGroup>,
|}>;

export type InitialDataRecentPmConversations = $ReadOnly<{|
  // * Added in server commit 2.1-dev-384-g4c3c669b41.
  //   TODO(server-2.1): Mark this required.  See MIN_RECENTPMS_SERVER_VERSION.
  // * `user_id` fields are sorted as of commit 2.2-dev-53-g405a529340, which
  //    was backported to 2.1.1-50-gd452ad31e0 -- meaning that they are _not_
  //    sorted in either v2.1.0 or v2.1.1.
  // TODO(server-3.0): Simply say these are sorted.  ("2.2" became 3.0.)
  recent_private_conversations?: $ReadOnlyArray<RecentPrivateConversation>,
|}>;

type NeverSubscribedStream = $ReadOnly<{|
  description: string,
  invite_only: boolean,
  is_old_stream: boolean,
  name: string,
  stream_id: number,
|}>;

export type InitialDataStream = $ReadOnly<{|
  streams: $ReadOnlyArray<Stream>,
|}>;

export type InitialDataSubscription = $ReadOnly<{|
  never_subscribed: $ReadOnlyArray<NeverSubscribedStream>,

  /**
   * All servers, at least as far back as zulip/zulip@7a930af, in
   * 2017-02-20 (that's server 1.6.0), send this, as long as you've
   * specified `subscription` as a desired event type in the
   * `/register` call, which we do.
   *
   * This investigation is reported at
   * https://github.com/zulip/zulip-mobile/pull/4046#discussion_r414901766.
   */
  subscriptions: $ReadOnlyArray<Subscription>,

  unsubscribed: $ReadOnlyArray<Subscription>,
|}>;

export type InitialDataUpdateDisplaySettings = $ReadOnly<{|
  default_language: string,
  emojiset: string,
  emojiset_choices: $ReadOnly<{| [string]: string |}>,
  high_contrast_mode: boolean,
  left_side_userlist: boolean,
  night_mode: boolean,
  timezone: string,
  translate_emoticons: boolean,
  twenty_four_hour_time: boolean,
|}>;

export type InitialDataUpdateGlobalNotifications = $ReadOnly<{|
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
|}>;

export type StreamUnreadItem = $ReadOnly<{|
  stream_id: number,
  topic: string,

  // Sorted.
  unread_message_ids: $ReadOnlyArray<number>,

  /** All distinct senders of these messages; sorted. */
  // sender_ids: $ReadOnlyArray<UserId>,
|}>;

export type HuddlesUnreadItem = $ReadOnly<{|
  /** All users, including self; numerically sorted, comma-separated. */
  user_ids_string: string,

  // Sorted.
  unread_message_ids: $ReadOnlyArray<number>,
|}>;

/** The unreads in a 1:1 PM thread, as represented in `unread_msgs`. */
export type PmsUnreadItem = $ReadOnly<{|
  /**
   * Misnamed; really the *other* user, or self for a self-PM.
   *
   * This is almost always the same as the message's sender.  The case where
   * it isn't is where a (1:1) message you yourself sent is nevertheless
   * unread.  That case can happen if you send it through the API (though
   * the normal thing even then would be to make a bot user to send the
   * messages as.)  See server commit ca74cd6e3.
   */
  sender_id: UserId,

  // Sorted.
  unread_message_ids: $ReadOnlyArray<number>,
|}>;

/** Initial data for `update_message_flags` events. */
export type InitialDataUpdateMessageFlags = $ReadOnly<{|
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
  unread_msgs: $ReadOnly<{|
    /**
     * Unread stream messages.
     *
     * NB this includes messages to muted streams and topics.
     */
    streams: $ReadOnlyArray<StreamUnreadItem>,

    /** Unread group PM messages, i.e. with >=3 participants. */
    // "huddle" is the server's internal term for a group PM conversation.
    huddles: $ReadOnlyArray<HuddlesUnreadItem>,

    /** Unread 1:1 PM messages. */
    pms: $ReadOnlyArray<PmsUnreadItem>,

    /** Unread @-mentions. */
    // Unlike other lists of message IDs here, `mentions` is *not* sorted.
    mentions: $ReadOnlyArray<number>,

    /**
     * Total *unmuted* unreads.
     *
     * NB this may be much less than the total number of message IDs in the
     * `streams`, `huddles`, and `pms` fields, because it excludes stream
     * messages that are muted.
     */
    count: number,
  |}>,
|}>;

export type InitialDataUserStatus = $ReadOnly<{|
  /**
   * Older servers (through at least 1.9.1) don't send this.
   * A missing value is equivalent to empty.
   */
  user_status?: UserStatusMapObject,
|}>;

// Initial data snapshot sent in response to a `/register` request,
// after validation and transformation.
export type InitialData = $ReadOnly<{|
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
  ...InitialDataMutedUsers,
  ...InitialDataPresence,
  ...InitialDataRealm,
  ...InitialDataRealmEmoji,
  ...InitialDataRealmFilters,
  ...InitialDataRealmLinkifiers,
  ...InitialDataRealmUser,
  ...InitialDataRealmUserGroups,
  ...InitialDataRecentPmConversations,
  ...InitialDataStream,
  ...InitialDataSubscription,
  ...InitialDataUpdateDisplaySettings,
  ...InitialDataUpdateGlobalNotifications,
  ...InitialDataUpdateMessageFlags,
  ...InitialDataUserStatus,
|}>;

// Initial data snapshot sent in response to a `/register` request,
// before validation and transformation.
export type RawInitialData = $ReadOnly<{|
  ...InitialData,
  ...RawInitialDataRealmUser,
  ...RawInitialDataRealmFilters,
|}>;
