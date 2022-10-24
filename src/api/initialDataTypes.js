/* @flow strict-local */

import type { CustomProfileField, UserStatusUpdate } from './modelTypes';
import type {
  CrossRealmBot,
  MutedTopicTuple,
  MutedUser,
  PresenceSnapshot,
  RealmEmojiById,
  RealmFilter,
  RealmLinkifier,
  RecentPrivateConversation,
  Stream,
  Subscription,
  User,
  UserGroup,
  UserId,
} from './apiTypes';
import type {
  CreatePublicOrPrivateStreamPolicyT,
  CreateWebPublicStreamPolicy,
  EmailAddressVisibility,
} from './permissionsTypes';

/*
   The types in this file are organized by which `fetch_event_types` values
   cause the server to send them to us.

   See comments at `InitialData`, at the bottom, for details.
 */

/**
 * The parts of the `/register` response sent regardless of `fetch_event_types`.
 *
 * See `InitialData` for more discussion.
 */
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

export type InitialDataCustomProfileFields = {|
  +custom_profile_fields: $ReadOnlyArray<CustomProfileField>,
  // +custom_profile_field_types: mixed, // Only used in admin settings UI
|};

export type InitialDataMessage = $ReadOnly<{|
  max_message_id: number,
|}>;

export type InitialDataMutedTopics = $ReadOnly<{|
  muted_topics: $ReadOnlyArray<MutedTopicTuple>,
|}>;

export type InitialDataMutedUsers = $ReadOnly<{|
  /** (When absent, treat as empty.  Added in server version 4.0, feature level 48.) */
  muted_users?: $ReadOnlyArray<MutedUser>,
|}>;

export type InitialDataPresence = $ReadOnly<{|
  presences: PresenceSnapshot,
|}>;

export type AvailableVideoChatProviders = $ReadOnly<{|
  [providerName: string]: $ReadOnly<{| name: string, id: number |}>,
|}>;

// This is current to feature level 140.
export type InitialDataRealm = $ReadOnly<{|
  //
  // Keep alphabetical order. When changing this, also change our type for
  // `realm op: update` and `realm op: update_dict` events.
  //

  development_environment: boolean,

  // TODO(server-5.0): Added, at feat. 74.
  event_queue_longpoll_timeout_seconds?: number,

  jitsi_server_url?: string, // TODO: Really optional?
  max_avatar_file_size_mib: number,
  max_file_upload_size_mib: number,

  // TODO(server-5.0): Replaced in feat. 72 by max_icon_file_size_mib
  max_icon_file_size?: number,

  // TODO(server-5.0): Added in feat. 72, replacing max_icon_file_size
  max_icon_file_size_mib?: number,

  // TODO(server-5.0): Replaced in feat. 72 by max_logo_file_size_mib
  max_logo_file_size?: number,

  // TODO(server-5.0): Added in feat. 72, replacing max_logo_file_size
  max_logo_file_size_mib?: number,

  // TODO(server-4.0): Added in feat. 53
  max_message_length?: number,

  // TODO(server-4.0): Added in feat. 53
  max_stream_description_length?: number,

  // TODO(server-4.0): Added in feat. 53
  max_stream_name_length?: number,

  // TODO(server-4.0): Added in feat. 53
  max_topic_length?: number,

  password_min_length: number,
  password_min_guesses: number,

  // TODO(server-5.0): Added in feat. 85, replacing realm_add_emoji_by_admins_only
  realm_add_custom_emoji_policy?: number,

  // TODO(server-5.0): Replaced in feat. 85 by realm_add_custom_emoji_policy
  realm_add_emoji_by_admins_only?: boolean,

  // TODO(server-5.0): Replaced in feat. 75 by realm_edit_topic_policy
  realm_allow_community_topic_editing?: boolean,

  realm_allow_edit_history: boolean,

  // TODO(server-5.0): Replaced in feat. 101 by realm_delete_own_message_policy
  realm_allow_message_deleting?: boolean,

  realm_allow_message_editing: boolean,
  realm_authentication_methods: $ReadOnly<{ GitHub: true, Email: true, Google: true, ... }>,
  realm_available_video_chat_providers: AvailableVideoChatProviders,
  realm_avatar_changes_disabled: boolean,
  realm_bot_creation_policy: number,
  realm_bot_domain: string,

  // TODO(server-3.0): Added in feat. 11
  realm_community_topic_editing_limit_seconds?: number,

  // TODO(server-5.0): Added in feat. 102, replacing
  // realm_create_stream_policy for private streams
  realm_create_private_stream_policy?: CreatePublicOrPrivateStreamPolicyT,

  // TODO(server-5.0): Added in feat. 102, replacing
  // realm_create_stream_policy for public streams
  realm_create_public_stream_policy?: CreatePublicOrPrivateStreamPolicyT,

  // TODO(server-5.0): Replaced in feat. 102 by
  // realm_create_private_stream_policy and realm_create_public_stream_policy
  // TODO(?): Do we support any servers released before this was added? (No
  //   entry in API doc or changelog.)
  realm_create_stream_policy?: CreatePublicOrPrivateStreamPolicyT,

  // TODO(server-5.0): Added in feat. 103; when absent, treat as
  //   CreateWebPublicStreamPolicy.Nobody.
  realm_create_web_public_stream_policy?: CreateWebPublicStreamPolicy,

  realm_default_code_block_language: string | null,

  // TODO(server-2.1): Added in commit 2.1.0-rc1~1382.
  realm_default_external_accounts?: {|
    +[site_name: string]: {|
      +name: string,
      +text: string,
      +hint: string,
      +url_pattern: string,
    |},
  |},
  realm_default_language: string,

  // TODO(server-5.0): Replaced in feat. 99 by
  // realm_user_settings_defaults.twenty_four_hour_time; there, only present
  // if realm_user_settings_defaults is given in fetch_event_types
  realm_default_twenty_four_hour_time?: boolean,

  // TODO(server-5.0): Added in feat. 101, replacing realm_allow_message_deleting
  realm_delete_own_message_policy?: number,

  realm_description: string,
  realm_digest_emails_enabled: boolean,
  realm_digest_weekday: number,
  realm_disallow_disposable_email_addresses: boolean,

  // TODO(server-5.0): Added in feat. 75, replacing realm_allow_community_topic_editing
  realm_edit_topic_policy?: number,

  realm_email_address_visibility: EmailAddressVisibility,
  realm_email_auth_enabled: boolean,
  realm_email_changes_disabled: boolean,
  realm_emails_restricted_to_domains: boolean,

  // TODO(server-6.0): Added in feat. 137; if absent, treat as false.
  realm_enable_read_receipts?: boolean,

  // TODO(server-5.0): Added in feat. 109; if absent, treat as false.
  realm_enable_spectator_access?: boolean,

  // TODO(server-4.0): Added in feat. 55.
  realm_giphy_rating?: number,

  realm_icon_source: 'G' | 'U',
  realm_icon_url: string,
  realm_inline_image_preview: boolean,
  realm_inline_url_embed_preview: boolean,

  // TODO(server-4.0): Replaced in feat. 50 by realm_invite_to_realm_policy
  realm_invite_by_admins_only?: boolean,

  realm_invite_required: boolean,

  // TODO(server-4.0): Added in feat. 50, replacing realm_invite_by_admins_only
  realm_invite_to_realm_policy?: number,

  realm_invite_to_stream_policy: number,
  realm_is_zephyr_mirror_realm: boolean,
  realm_logo_source: 'D' | 'U',
  realm_logo_url: string,
  realm_mandatory_topics: boolean,
  realm_message_content_allowed_in_email_notifications: boolean,

  // In 5.0 (feature level 100), the representation the server sends for "no
  // limit" changed from 0 to `null`, and 0 became an invalid value. (For
  // the invalid-value part, see zulip/zulip#20131.)
  realm_message_content_delete_limit_seconds: number | null,

  // In 6.0 (feature level 138), the representation the server sends for "no
  // limit" changed from 0 to `null`, and 0 became an invalid value.
  realm_message_content_edit_limit_seconds: number,

  // TODO(server-3.0): Special value `null` replaced with -1 in feat. 22
  realm_message_retention_days: number | null,

  // TODO(server-4.0): Added in feat. 56
  realm_move_messages_between_streams_policy?: number,

  realm_name: string,
  realm_name_changes_disabled: boolean,
  realm_night_logo_source: 'D' | 'U',
  realm_night_logo_url: string,
  realm_notifications_stream_id: number,

  // TODO(server-6.0): Added in feat. 128
  realm_org_type?: 0 | 10 | 20 | 30 | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 1000,

  realm_password_auth_enabled: boolean,
  realm_plan_type: number,
  realm_presence_disabled: boolean,
  realm_private_message_policy: number,
  realm_push_notifications_enabled: boolean,
  realm_send_welcome_emails: boolean,
  realm_signup_notifications_stream_id: number,

  // TODO(server-5.0): Replaced in feat. 72 by realm_upload_quota_mib
  realm_upload_quota?: number,

  // TODO(server-5.0): Added in feat. 72, replacing realm_upload_quota
  realm_upload_quota_mib?: number,

  realm_user_group_edit_policy: number,
  realm_uri: string,
  realm_video_chat_provider: number,
  realm_waiting_period_threshold: number,

  // TODO(server-6.0): Added in feat. 129
  realm_want_advertise_in_communities_directory?: boolean,

  // TODO(server-4.0): Added in feat. 33. Updated with moderators option in
  //   feat. 62 (Zulip 4.0).
  // TODO(server-6.0): Stream administrators option removed in feat. 133.
  realm_wildcard_mention_policy?: number,

  server_avatar_changes_disabled: boolean,

  // TODO(server-6.0): Added in feat. 140.
  server_emoji_data_url?: string,

  server_generation: number,
  server_inline_image_preview: boolean,
  server_inline_url_embed_preview: boolean,
  server_name_changes_disabled: boolean,

  // TODO(server-5.0): Added in feat. 74
  server_needs_upgrade?: boolean,

  // TODO(server-5.0): Added in feat. 110; if absent, treat as false.
  server_web_public_streams_enabled?: boolean,

  settings_send_digest_emails: boolean,
  upgrade_text_for_wide_organization_logo: string,
  zulip_plan_is_not_limited: boolean,

  //
  // Keep alphabetical order. When changing this, also change our type for
  // `realm op: update` and `realm op: update_dict` events.
  //
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

export type RawInitialDataRealmUser = {|
  // Property ordering follows the doc.

  +realm_users: $ReadOnlyArray<{| ...User, avatar_url?: string | null |}>,
  +realm_non_active_users: $ReadOnlyArray<{| ...User, avatar_url?: string | null |}>,
  +avatar_source: 'G',
  +avatar_url_medium: string,
  +avatar_url: string | null,

  // TODO(server-5.0): Replaced in FL 102 by can_create_public_streams and
  //   can_create_private_streams.
  +can_create_streams?: boolean,

  // TODO(server-5.0): New in FL 102, replacing can_create_streams.
  +can_create_public_streams?: boolean,

  // TODO(server-5.0): New in FL 102, replacing can_create_streams.
  +can_create_private_streams?: boolean,

  // TODO(server-5.0): New in FL 103.
  +can_create_web_public_streams?: boolean,

  +can_subscribe_other_users: boolean,

  // TODO(server-4.0): New in FL 51.
  +can_invite_others_to_realm?: boolean,

  +is_admin: boolean,
  +is_owner: boolean,

  // TODO(server-5.0): New in FL 73.
  +is_billing_admin?: boolean,

  // TODO(server-4.0): New in FL 60.
  +is_moderator?: boolean,

  +is_guest: boolean,
  +user_id: UserId,
  +email: string,
  +delivery_email: string,
  +full_name: string,
  +cross_realm_bots: $ReadOnlyArray<{| ...CrossRealmBot, +avatar_url?: string | null |}>,
|};

// TODO(#5250): Sync with the doc.
export type InitialDataRealmUser = $ReadOnly<{|
  ...RawInitialDataRealmUser,
  realm_users: $ReadOnlyArray<User>,
  realm_non_active_users: $ReadOnlyArray<User>,
  can_create_streams: boolean,
  cross_realm_bots: $ReadOnlyArray<CrossRealmBot>,
|}>;

export type InitialDataRealmUserGroups = $ReadOnly<{|
  // New in Zulip 1.8.
  realm_user_groups: $ReadOnlyArray<UserGroup>,
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

// Deprecated. Use only as fallback for InitialDataUserSettings, new in 5.0.
//
// All properties optional. They will be present from servers that don't
// support the user_settings_object client capability, and absent from those
// that do. (We declare the capability.) See doc on each property:
//   https://zulip.com/api/register-queue
//   > Present if `update_display_settings` is present in `fetch_event_types`
//   > and only for clients that did not include `user_settings_object` in
//   > their `client_capabilities` when registering the event queue.
// and see
//   https://zulip.com/api/register-queue#parameter-client_capabilities .
// TODO(server-5.0): Remove, when all supported servers can handle the
//   `user_settings_object` client capability (FL 89).
export type InitialDataUpdateDisplaySettings = {|
  // Write-only properties commented out to handle a suspected Flow bug:
  //   https://github.com/zulip/zulip-mobile/pull/5379#discussion_r871938749
  //
  // -default_language?: string,
  // -emojiset?: string,
  // -emojiset_choices?: $ReadOnly<{| [string]: string |}>,
  // -enter_sends?: boolean,
  // -high_contrast_mode?: boolean,
  // -left_side_userlist?: boolean,
  // -timezone?: string,
  // -translate_emoticons?: boolean,
  +twenty_four_hour_time?: boolean,
|};

// Deprecated. Use only as fallback for InitialDataUserSettings, new in 5.0.
//
// All properties optional. They will be present from servers that don't
// support the user_settings_object client capability, and absent from those
// that do. (We declare the capability.) See doc on each property:
//   https://zulip.com/api/register-queue
//   > Present if `update_global_notifications` is present in `fetch_event_types`
//   > and only for clients that did not include `user_settings_object` in
//   > their `client_capabilities` when registering the event queue.
// and see
//   https://zulip.com/api/register-queue#parameter-client_capabilities .
// TODO(server-5.0): Remove, when all supported servers can handle the
//   `user_settings_object` client capability (FL 89).
export type InitialDataUpdateGlobalNotifications = {|
  // Write-only properties commented out to handle a suspected Flow bug:
  //   https://github.com/zulip/zulip-mobile/pull/5379#discussion_r871938749
  //
  // -enable_desktop_notifications?: boolean,
  // -enable_digest_emails?: boolean,
  // -enable_offline_email_notifications?: boolean,
  +enable_offline_push_notifications?: boolean,
  +enable_online_push_notifications?: boolean,
  // -enable_sounds?: boolean,
  // -enable_stream_desktop_notifications?: boolean,
  // -enable_stream_email_notifications?: boolean,
  +enable_stream_push_notifications?: boolean,
  // -message_content_in_email_notifications?: boolean,
  // -pm_content_in_desktop_notifications?: boolean,
  // -realm_name_in_notifications?: boolean,
|};

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

// Assumes FL 89+, because servers added user_settings to the /register
// response in FL 89.
//
// Current to FL 152; property ordering follows the /register doc. See the
// "Current to" note on the InitialDataUserSettings type and update that as
// needed too.
//
// TODO(server-5.0): Remove FL 89+ comment.
export type UserSettings = {|
  +twenty_four_hour_time: boolean,
  +dense_mode: boolean,
  +starred_message_counts: boolean,
  +fluid_layout_width: boolean,
  +high_contrast_mode: boolean,
  +color_scheme: 1 | 2 | 3,
  +translate_emoticons: boolean,

  // TODO(server-6.0): New in FL 125.
  +display_emoji_reaction_users?: boolean,

  +default_language: string,
  +default_view: 'recent_topics' | 'all_messages',

  // TODO(server-5.0): New in FL 107.
  +escape_navigates_to_default_view?: boolean,

  +left_side_userlist: boolean,
  +emojiset: 'google' | 'google-blob' | 'twitter' | 'text',
  +demote_inactive_streams: 1 | 2 | 3,

  // TODO(server-6.0): New in FL 141.
  +user_list_style: 1 | 2 | 3,

  +timezone: string,
  +enter_sends: boolean,
  +enable_drafts_synchronization: boolean,
  +enable_stream_desktop_notifications: boolean,
  +enable_stream_email_notifications: boolean,
  +enable_stream_push_notifications: boolean,
  +enable_stream_audible_notifications: boolean,
  +notification_sound: string,
  +enable_desktop_notifications: boolean,
  +enable_sounds: boolean,
  +email_notifications_batching_period_seconds: number,
  +enable_offline_email_notifications: boolean,
  +enable_offline_push_notifications: boolean,
  +enable_online_push_notifications: boolean,
  +enable_digest_emails: boolean,
  +enable_marketing_emails: boolean,
  +enable_login_emails: boolean,
  +message_content_in_email_notifications: boolean,
  +pm_content_in_desktop_notifications: boolean,
  +wildcard_mentions_notify: boolean,
  +desktop_icon_count_display: 1 | 2 | 3,
  +realm_name_in_notifications: boolean,
  +presence_enabled: boolean,
  +available_notification_sounds: $ReadOnlyArray<string>,
  +emojiset_choices: $ReadOnlyArray<{| +key: string, +text: string |}>,

  // TODO(server-5.0): New in FL 105.
  +send_private_typing_notifications?: boolean,

  // TODO(server-5.0): New in FL 105.
  +send_stream_typing_notifications?: boolean,

  // TODO(server-5.0): New in FL 105.
  +send_read_receipts?: boolean,
|};

/**
 * Initial data for `user_settings` events.
 *
 * Replaces various toplevel properties in the register response; see #4933.
 */
// Assumes FL 89+ because this was added in FL 89.
//
// Current to FL 152. See the "Current to" note on the UserSettings type and
// update that as needed too.
//
// TODO(server-5.0): Remove FL 89+ comment.
export type InitialDataUserSettings = {|
  // TODO(server-5.0): New in FL 89, for requesting clients, so assumes 89.
  +user_settings?: UserSettings,
|};

/**
 * Users' chosen availability and text/emoji statuses.
 *
 * See UserStatusEvent for the event that carries updates to this data.
 */
// TODO(?): Find out if servers ignore any users (e.g., deactivated ones) when
//   assembling this.
export type InitialDataUserStatus = $ReadOnly<{|
  /**
   * Each user's status, expressed relative to a "zero" status.
   *
   * The zero status is:
   *   { away: false, status_text: '',
   *     emoji_name: '', reaction_type: '', emoji_code: '' }
   *
   * For the corresponding value in our model in the app, see
   * `kUserStatusZero`.  For discussion of the "zero value" concept, see:
   *   https://github.com/zulip/zulip-mobile/pull/5224#discussion_r808451105
   *
   * When the update for a given user would be empty (i.e., when their
   * status is the zero status), the server may omit that user's record
   * entirely.
   *
   * New in Zulip 2.0.  Older servers don't send this, so it's natural
   * to treat them as if all users have the zero status; and that gives
   * correct behavior for this feature.
   *
   * See UserStatusEvent for the event that carries updates to this data.
   */
  // TODO(server-2.0): Make required.
  user_status?: $ReadOnly<{|
    // Keys are UserId encoded as strings (just because JS objects are
    // string-keyed).
    [userId: string]: UserStatusUpdate,
  |}>,
|}>;

/**
 * The initial data snapshot sent on `/register`.
 *
 * See API docs:
 *   https://zulip.com/api/register-queue#response
 *
 * Most properties are sent only if the client includes a particular item in
 * the `fetch_event_types` list.  This type is meant to reflect the
 * properties that appear when sending the `fetch_event_types` that this
 * client sends, which is more or less all of them.
 *
 * This is the version after some processing.  See `RawInitialData` for the
 * raw form sent by the server.
 */
export type InitialData = {|
  // To give a bit of organization to this very large object type, we group
  // the properties by which event type in `fetch_event_types` causes the
  // server to send them.  The properties elicited by `realm_user` are
  // grouped together as a type called `InitialDataRealmUser`, and so on.
  //
  // For the server-side implementation, see zerver/lib/events.py at
  // fetch_initial_state_data.  (But see the API docs first; if you need to
  // consult the server implementation, that's a bug in the API docs.)
  ...InitialDataBase,
  ...InitialDataAlertWords,
  ...InitialDataCustomProfileFields,
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
  ...InitialDataUserSettings,
  ...InitialDataUserStatus,
|};

/**
 * Raw form of the initial data snapshot sent on `/register`.
 *
 * See API docs:
 *   https://zulip.com/api/register-queue#response
 *
 * This represents the raw JSON-decoding of the response from the server.
 * See `InitialData` for a slightly processed form.
 */
export type RawInitialData = $ReadOnly<{|
  ...InitialData,
  ...RawInitialDataRealmUser,
  ...RawInitialDataRealmFilters,
|}>;
