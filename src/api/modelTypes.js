/**
 * Types for things in the Zulip data model, as seen in the API.
 *
 * @flow strict-local
 */

import { typesEquivalent } from '../generics';
import { objectValues } from '../flowPonyfill';
import type { AvatarURL } from '../utils/avatar';
import type { UserId } from './idTypes';
import type { RoleT } from './permissionsTypes';

export type * from './idTypes';

//
//
//
// ===================================================================
// Data attached to the realm or the server.
//
//

/**
 * See CustomProfileField for semantics.
 *
 * See also CustomProfileFieldType for an enum with meaningful names, and
 * CustomProfileFieldTypeValues for a list of values.
 */
// This is an enum; see discussion on other enums.
// eslint-disable-next-line flowtype/type-id-match
export type CustomProfileFieldTypeT = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * An enum of all valid values for CustomProfileFieldTypeT.
 *
 * See CustomProfileFieldTypeValues for a list of values,
 * and CustomProfileField for semantics.
 */
export const CustomProfileFieldType = {
  // The names are from a mix of the descriptions on custom_profile_fields
  // itself, and the names in custom_profile_field_types:
  //   https://zulip.com/api/register-queue
  ShortText: (1: 1),
  LongText: (2: 2),
  Choice: (3: 3),
  Date: (4: 4),
  Link: (5: 5),
  User: (6: 6),
  ExternalAccount: (7: 7),
};

// Check that the enum indeed has all and only the values of the type.
typesEquivalent<CustomProfileFieldTypeT, $Values<typeof CustomProfileFieldType>>();

/**
 * A list of all valid values for CustomProfileFieldTypeT.
 *
 * See CustomProfileFieldType for an enum to refer to these by meaningful
 * names.
 */
export const CustomProfileFieldTypeValues: $ReadOnlyArray<CustomProfileFieldTypeT> = objectValues(
  CustomProfileFieldType,
);

/**
 * A custom profile field available to users in this org.
 *
 * See event doc: https://zulip.com/api/get-events#custom_profile_fields
 */
export type CustomProfileField = {|
  +id: number,
  +type: CustomProfileFieldTypeT,
  +order: number,
  +name: string,
  +hint: string,
  /**
   * Some data in a format determined by the custom profile field's `type`.
   *
   * Empirically this is an empty string for field types that don't use it.
   *
   * Docs wrongly say it's a "JSON dictionary" for type 3; the example shows
   * it's a string, one serializing a JSON object.
   */
  +field_data: string,
|};

export type ImageEmojiType = $ReadOnly<{|
  author?: $ReadOnly<{|
    email: string,
    full_name: string,
    id: number,
  |}>,
  deactivated: boolean,
  id?: number,
  code: string,
  name: string,
  source_url: string,
|}>;

export type RealmEmojiById = $ReadOnly<{|
  [id: string]: ImageEmojiType,
|}>;

/**
 * The only way servers before feature level 54 represent linkifiers.
 */
// TODO(server-4.0): Delete this.
export type RealmFilter = [string, string, number];

/**
 * The way servers at feature level 54+ can represent linkifiers.
 *
 * Currently, this new format can be converted to the old without loss of
 * information, so we do that at the edge and continue to represent the data
 * internally with the old format.
 */
// TODO:
// - When we've moved to a shared markdown implementation (#4242),
//   change our internal representation to be the new
//   `realm_linkifiers` format. (When doing so, also don't forget to
//   change various variable and type definition names to be like
//   `realm_linkifiers`.)
// - TODO(server-4.0): When we drop support for servers older than 54, we
//   can remove all our code that knows about the `realm_filters` format.
export type RealmLinkifier = $ReadOnly<{|
  id: number,
  pattern: string,
  url_format: string,
|}>;

//
//
//
// ===================================================================
// Users and data about them.
//
//

export type DevUser = $ReadOnly<{|
  realm_uri: string,
  email: string,
|}>;

/**
 * A Zulip user, which might be a human or a bot, as found in one realm.
 *
 * This is a user object as found in properties `realm_users` and
 * `realm_non_active_users` of a `/register` response. See the API doc:
 *   https://zulip.com/api/register-queue
 *
 * See also:
 *  * `CrossRealmBot` for another type of bot user, found in a
 *    different part of a `/register` response
 *  * `UserOrBot` for a convenience union of the two
 */
export type User = {|
  // Property ordering follows the doc.
  // Current to feature level (FL) 121.

  +user_id: UserId,
  +delivery_email?: string,
  +email: string,
  +full_name: string,

  // We expect ISO 8601; that's in the doc's example response.
  +date_joined: string,

  // is_active never appears in `/register` responses, at least up through
  // FL 121. The doc wrongly says it always appears. See
  //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/.60is_active.60.20in.20.60.2Fregister.60.20response/near/1371606

  // TODO(server-3.0): New in FL 8
  +is_owner?: boolean,

  +is_admin: boolean,

  // TODO(server-1.9): New in commit d5df0377c; if absent, treat as false.
  +is_guest?: boolean,

  // TODO(server-5.0): New in FL 73
  +is_billing_admin?: boolean,

  // For background on the "*bot*" fields, see user docs on bots:
  //   https://zulip.com/help/add-a-bot-or-integration
  // Note that certain bots are represented by a different type entirely,
  // namely `CrossRealmBot`.
  +is_bot: boolean,
  +bot_type: number | null,

  // TODO(server-3.0): New in FL 1, replacing bot_owner
  +bot_owner_id?: number | null,

  // TODO(server-3.0): Replaced in FL 1 by bot_owner_id
  +bot_owner?: string,

  // TODO(server-4.0): New in FL 59
  +role?: RoleT,

  // The ? is for future-proofing. Greg explains in 2020-02, at
  // https://github.com/zulip/zulip-mobile/pull/3789#discussion_r378554698 ,
  // that both human and bot Users will likely end up having a missing
  // timezone instead of an empty string.
  +timezone?: string,

  /**
   * Present under EVENT_USER_ADD, RealmUserUpdateEvent (if change
   * indicated), under REGISTER_COMPLETE, and in `state.users`, all as an
   * AvatarURL, because we translate into that form at the edge.
   *
   * For how it appears at the edge (and how we translate) see
   * AvatarURL.fromUserOrBotData.
   */
  +avatar_url: AvatarURL,

  // If we use this, avoid `avatar_url` falling out of sync with it.
  -avatar_version: number,

  +profile_data?: {|
    +[id: string]: {|
      +value: string,
      // New in server 2.0, server commit e3aed0f7b.
      // TODO(server-2.0): Delete the server-2.0 comment, but keep the type
      //   optional; only some custom profile field types support Markdown.
      +rendered_value?: string,
    |},
  |},
|};

/**
 * A "cross-realm bot", a bot user shared across the realms on a Zulip server.
 *
 * Cross-realm bots are used for a handful of bots defined in the Zulip
 * server code, like Welcome Bot.  They're found in the `cross_realm_bots`
 * property of a `/register` response, represented with this type.  Doc:
 *   https://zulip.com/api/register-queue
 *
 * See also:
 *  * `User` and its property `is_bot`.  Bot users that appear in a single
 *    realm are, like human users, represented by a `User` value.
 *  * `UserOrBot`, a convenience union
 */
export type CrossRealmBot = {|
  // Property ordering follows the doc.
  // Current to feature level (FL) 121.

  +user_id: UserId,
  +delivery_email?: string,
  +email: string,
  +full_name: string,

  // We expect ISO 8601; that's in the doc's example response.
  +date_joined: string,

  // is_active never appears in `/register` responses, at least up through
  // FL 121. The doc wrongly says it always appears. See
  //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/.60is_active.60.20in.20.60.2Fregister.60.20response/near/1371606

  // TODO(server-3.0): New in FL 8
  +is_owner?: boolean,

  +is_admin: boolean,

  // TODO(server-1.9): New in commit d5df0377c; if absent, treat as false.
  +is_guest?: boolean,

  // TODO(server-5.0): New in FL 73
  +is_billing_admin?: boolean,

  // We assume this is `true`.
  +is_bot: true,

  // We assume this can't be `null`.
  +bot_type: number,

  // We assume this is `null` when present. (Cross-realm bots don't have
  //   owners.)
  // TODO(server-3.0): New in FL 1, replacing bot_owner
  +bot_owner_id?: null,

  // We assume bot_owner is never present, even on old servers. (Cross-realm
  //   bots don't have owners.)
  // TODO(server-3.0): Replaced in FL 1 by bot_owner_id
  // +bot_owner?: string,

  // TODO(server-4.0): New in FL 59
  +role?: RoleT,

  // The ? is for future-proofing.  For bots it's always '':
  //   https://github.com/zulip/zulip-mobile/pull/3789#issuecomment-581218576
  // so a future version may omit it to reduce payload sizes.  See comment
  // on the same field in User.
  +timezone?: string,

  /**
   * See note for this property on User.
   */
  +avatar_url: AvatarURL,

  // If we use this, avoid `avatar_url` falling out of sync with it.
  -avatar_version: number,

  // (We could be more specific here; but in the interest of reducing
  // differences between CrossRealmBot and User, just follow the latter.)
  +profile_data?: $ElementType<User, 'profile_data'>,

  // We assume this is `true` when present.
  // TODO(server-5.0): New in FL 83, replacing is_cross_realm_bot
  +is_system_bot?: true,

  // We assume this is `true` when present.
  // TODO(server-5.0): Replaced in FL 83 by is_system_bot
  +is_cross_realm_bot?: true,
|};

/**
 * A Zulip user/account, which might be a cross-realm bot.
 */
export type UserOrBot = User | CrossRealmBot;

/**
 * For @-mentioning multiple users at once.
 *
 * When you @-mention a user group, everyone in the group is notified as
 * though they were individually mentioned.  See user-facing docs:
 *   https://zulip.com/help/user-groups
 *
 * This feature is not related to group PMs.
 */
export type UserGroup = $ReadOnly<{|
  description: string,
  id: number,
  members: $ReadOnlyArray<UserId>,
  name: string,
|}>;

/**
 * A user's chosen availability and text/emoji statuses.
 */
export type UserStatus = $ReadOnly<{|
  // true/false: User unavailable/available.
  away: boolean,

  // "foo": User's status text is "foo".
  // null: User's status text is unset.
  status_text: string | null,

  // null: User's status emoji is unset.
  status_emoji: null | {|
    // These three properties point to an emoji in the same way the same-named
    // properties point to an emoji in the Reaction type; see there.
    +emoji_name: string,
    +reaction_type: ReactionType, // eslint-disable-line no-use-before-define
    +emoji_code: string,
  |},
|}>;

/**
 * The server's representation of the diff between two user-status records.
 *
 * A value is mentioned only when it's changed.
 *
 * N.B., emoji statuses are new in 5.0 (feature level 86), so they'll never
 * be present before then. But "unchanged" is still appropriate semantics
 * and will lead to correct behavior.
 *
 * For the strings, the empty string means that component of the user's
 * status is unset.
 */
// TODO(server-5.0): Simplify jsdoc.
// TODO(docs): All this is observed empirically; update the doc. See
//   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/Emoji.20statuses.20in.20zulip.2Eyaml/near/1322329
export type UserStatusUpdate = $ReadOnly<{|
  away?: boolean,
  status_text?: string,

  // These three properties point to an emoji in the same way the same-named
  // properties point to an emoji in the Reaction type; see there.
  emoji_name?: string,
  emoji_code?: string,
  reaction_type?: ReactionType | '', // eslint-disable-line no-use-before-define
|}>;

/** See ClientPresence, and the doc linked there. */
export type PresenceStatus = 'active' | 'idle' | 'offline';

/**
 * A user's presence status, as reported by a specific client.
 *
 * For an explanation of the Zulip presence model and how to interpret
 * `status` and `timestamp`, see the subsystem doc:
 *   https://zulip.readthedocs.io/en/latest/subsystems/presence.html
 *
 * @prop timestamp - When the server last heard from this client.
 * @prop status - See the presence subsystem doc.
 * @prop client
 * @prop pushable - Legacy; unused.
 */
export type ClientPresence = $ReadOnly<{|
  status: PresenceStatus,
  timestamp: number,
  client: string,

  /**
   * Indicates if the client can receive push notifications. This property
   * was intended for showing a user's presence status as "on mobile" if
   * they are inactive on all devices but can receive push notifications
   * (see zulip/zulip bd20a756f9). However, this property doesn't seem to be
   * used anywhere on the web app or the mobile client, and can be
   * considered legacy.
   *
   * Empirically this is `boolean` on at least some clients, and absent on
   * `aggregated`.  By writing `empty` we make it an error to actually use it.
   */
  pushable?: empty,
|}>;

/**
 * A user's presence status, including all information from all their clients.
 *
 * The `aggregated` property equals one of the others.  For details, see:
 *   https://zulip.com/api/get-user-presence
 *
 * See also the app's `getAggregatedPresence`, which reimplements a version
 * of the logic to compute `aggregated`.
 */
export type UserPresence = $ReadOnly<{|
  aggregated: ClientPresence,
  [client: string]: ClientPresence,
|}>;

/**
 * A snapshot of the presence status of all users.
 *
 * See `UserPresence` and `ClientPresence` for more, and links.
 */
export type PresenceSnapshot = {| +[email: string]: UserPresence |};

/** This is what appears in the `muted_users` server event.
 * See https://chat.zulip.org/api/get-events#muted_users for details.
 */
export type MutedUser = $ReadOnly<{|
  id: UserId,
  timestamp: number,
|}>;

//
//
//
// ===================================================================
// Streams, topics, and stuff about them.
//
//

export type Stream = {|
  // Based on `streams` in the /register response, current to FL 121:
  //   https://zulip.com/api/register-queue
  // Property ordering follows that doc.

  +stream_id: number,
  +name: string,
  +description: string,

  // TODO(server-4.0): New in FL 30.
  +date_created?: number,

  // Note: updateStream controls this with its `is_private` param.
  +invite_only: boolean,

  +rendered_description: string,

  // TODO(server-2.1): is_web_public was added in Zulip version 2.1;
  //   absence implies the stream is not web-public.
  +is_web_public?: boolean,

  // TODO(server-3.0): Added in FL 1; if absent, use is_announcement_only.
  +stream_post_policy?: 1 | 2 | 3 | 4,

  // Special values are:
  //   *  null: default; inherits from org-level setting
  //   * -1: unlimited retention
  // These special values differ from updateStream's and createStream's params; see
  //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/message_retention_days/near/1367895
  // TODO(server-3.0): New in FL 17.
  +message_retention_days?: number | null,

  +history_public_to_subscribers: boolean,
  +first_message_id: number | null,

  // TODO(server-3.0): Deprecated at FL 1; use stream_post_policy instead
  +is_announcement_only: boolean,
|};

export type Subscription = {|
  ...Stream,
  +color: string,
  +in_home_view: boolean,
  +pin_to_top: boolean,
  +email_address: string,
  +is_old_stream: boolean,
  +stream_weekly_traffic: number,

  /** (To interpret this value, see `getIsNotificationEnabled`.) */
  +push_notifications: null | boolean,

  // To meaningfully interpret these, we'll need logic similar to that for
  // `push_notifications`.  Pending that, the `-` ensures we don't read them.
  -audible_notifications: boolean,
  -desktop_notifications: boolean,
|};

export type Topic = $ReadOnly<{|
  name: string,
  max_id: number,
|}>;

/**
 * A muted topic.
 *
 * Found in the initial data, and in `muted_topics` events.
 *
 * The elements are the stream name, then topic, then possibly timestamp.
 */
// Server issue for using stream IDs (#3918) for muted topics, not names:
//   https://github.com/zulip/zulip/issues/21015
// TODO(server-3.0): Simplify away the no-timestamp version, new in FL 1.
export type MutedTopicTuple = [string, string] | [string, string, number];

//
//
//
// ===================================================================
// Narrows.
//
//

// See docs: https://zulip.com/api/construct-narrow
// prettier-ignore
/* eslint-disable semi-style */
export type NarrowElement =
 | {| +operator: 'is' | 'in' | 'topic' | 'search', +operand: string |}
 // The server started accepting numeric user IDs and stream IDs in 2.1:
 //  * `stream` since 2.1-dev-2302-g3680393b4
 //  * `group-pm-with` since 2.1-dev-1813-gb338fd130
 //  * `sender` since 2.1-dev-1812-gc067c155a
 //  * `pm-with` since 2.1-dev-1350-gd7b4de234
 // TODO(server-2.1): Stop sending stream names (#3918) or user emails (#3764) here.
 | {| +operator: 'stream', +operand: string | number |} // stream ID
 | {| +operator: 'pm-with', +operand: string | $ReadOnlyArray<UserId> |}
 | {| +operator: 'sender', +operand: string | UserId |}
 | {| +operator: 'group-pm-with', +operand: string | UserId |}
 | {| +operator: 'near' | 'id', +operand: number |} // message ID
 ;

/**
 * A narrow, in the form used in the Zulip API at get-messages.
 *
 * See also `Narrow` in the non-API app code, which describes how we
 * represent narrows within the app.
 */
export type ApiNarrow = $ReadOnlyArray<NarrowElement>;

//
//
//
// ===================================================================
// Messages and things attached to them.
//
//

/**
 * Type of an emoji reaction to a message.
 *
 * These correspond to the values allowed for Reaction.reaction_type in the
 * server's models.  The values are:
 *  * unicode_emoji: An emoji found in Unicode, corresponding to a sequence
 *    of Unicode code points.  The list of these depends on the Zulip
 *    server's version.
 *  * realm_emoji: A custom emoji uploaded by some user on a given realm.
 *  * zulip_extra_emoji: An emoji distributed with Zulip, like :zulip:.
 *
 * See `Reaction` which uses this.
 */
export type ReactionType = 'unicode_emoji' | 'realm_emoji' | 'zulip_extra_emoji';

/**
 * An emoji reaction to a message.
 *
 * The raw JSON from the server may have a different structure, but we
 * normalize it to this form.
 */
export type Reaction = $ReadOnly<{|
  user_id: UserId,

  emoji_name: string,
  reaction_type: ReactionType,

  /**
   * A string that uniquely identifies a particular emoji.
   *
   * The format varies with `reaction_type`, and can be subtle.
   * See the comment on Reaction.emoji_code here:
   *   https://github.com/zulip/zulip/blob/main/zerver/models.py
   */
  emoji_code: string,
|}>;

/**
 * "Snapshot" objects from https://zulip.com/api/get-message-history .
 *
 * See also `MessageEdit`.
 */
export type MessageSnapshot = $ReadOnly<{|
  user_id: UserId,
  timestamp: number,

  /** Docs unclear but suggest absent if only content edited. */
  topic?: string,

  /**
   * Docs unclear, but suggest these five absent if only topic edited.
   * They definitely say "prev"/"diff" properties absent on the first snapshot.
   */
  content?: string,
  rendered_content?: string,
  prev_content?: string,
  prev_rendered_content?: string,
  content_html_diff?: string,
|}>;

/**
 * Found in the history within a `Message` object.
 *
 * See also `MessageSnapshot`.
 */
export type MessageEdit = $ReadOnly<{|
  prev_content?: string,
  prev_rendered_content?: string,
  prev_rendered_content_version?: number,
  prev_stream?: number,

  // New in FL 118, replacing `prev_subject`.
  // TODO(server-5.0): Delete the FL 118 comment but keep this optional;
  //   only present if topic was changed.
  prev_topic?: string,

  // TODO(server-5.0): Replaced in FL 118 by `prev_topic`.
  prev_subject?: string,

  // New in FL 118.
  // TODO(server-5.0): Delete the FL 118 comment but keep this optional;
  //   only present if stream was changed.
  stream?: number,

  timestamp: number,

  // New in FL 118.
  // TODO(server-5.0): Delete the FL 118 comment but keep this optional;
  //   only present if topic was changed.
  topic?: number,

  user_id: UserId | null,
|}>;

/** A user, as seen in the `display_recipient` of a PM `Message`. */
export type PmRecipientUser = $ReadOnly<{|
  // These five fields (id, email, full_name, short_name, is_mirror_dummy)
  // have all been present since server commit 6b13f4a3c, in 2014.
  id: UserId,
  email: string,
  full_name: string,
  // We mark short_name and is_mirror_dummy optional so we can leave them
  // out of Outbox values; we never rely on them anyway.
  short_name?: string,
  is_mirror_dummy?: boolean,
|}>;

/**
 * The data encoded in a submessage to make the message a widget.
 *
 * Note that future server versions might introduce new types of widgets, so
 * `widget_type` could be a value not included here.  But when it is one of
 * these values, the rest of the object will follow this type.
 */
// Ideally we'd be able to express both the known and the unknown widget
// types: we'd have another branch of this union which looked like
//   | {| +widget_type: (string *other than* those above), +extra_data?: { ... } |}
// But there doesn't seem to be a way to express that in Flow.
export type WidgetData =
  | {|
      +widget_type: 'poll',
      +extra_data?: {| +question?: string, +options?: $ReadOnlyArray<string> |},
    |}
  // We can write these down more specifically when we implement these widgets.
  | {| +widget_type: 'todo', +extra_data?: { ... } |}
  | {| +widget_type: 'zform', +extra_data?: { ... } |};

/**
 * The data encoded in a submessage that acts on a widget.
 *
 * The interpretation of this data, including the meaning of the `type`
 * field, is specific to each widget type.
 *
 * We delegate actually processing these to shared code, so we don't specify
 * the details further.
 */
export type WidgetEventData = { +type: string, ... };

/**
 * The data encoded in a `Submessage`.
 *
 * For widgets (the only existing use of submessages), the submessages array
 * consists of:
 *  * One submessage with `WidgetData`; then
 *  * Zero or more submessages with `WidgetEventData`.
 */
export type SubmessageData = WidgetData | WidgetEventData;

/**
 * Submessages are items containing extra data that can be added to a
 * message. Despite what their name might suggest, they are not a subtype
 * of the `Message` type, nor do they share almost any fields with it.
 *
 * Submessages are used by Widgets:
 * https://zulip.readthedocs.io/en/latest/subsystems/widgets.html
 *
 * Normally a message contains an empty array of these. We differentiate
 * between a normal message and a widget by the length of `submessages`
 * array property. Widgets will have 1 or more submessages.
 */
export type Submessage = $ReadOnly<{|
  id: number,
  message_id: number,
  sender_id: UserId,
  msg_type: 'widget', // only this type is currently available

  /** A `SubmessageData` object, JSON-encoded. */
  content: string,
|}>;

/**
 * Properties in common among the two different flavors of a
 * `Message`: `PmMessage` and `StreamMessage`.
 */
type MessageBase = $ReadOnly<{|
  //
  // Properties on `event.message` in `message` events. Order follows the
  // doc: https://zulip.com/api/get-events#message
  // See comment on Message for how up-to-date these are.
  //

  /**
   * Present under EVENT_NEW_MESSAGE and under MESSAGE_FETCH_COMPLETE,
   * and in `state.messages`, all as an AvatarURL, because we
   * translate into that form at the edge.
   *
   * For how it appears at the edge (and how we translate) see
   * AvatarURL.fromUserOrBotData.
   */
  avatar_url: AvatarURL,

  client: string,
  content: string,
  content_type: 'text/html',
  // display_recipient handled on PmMessage and StreamMessage separately
  edit_history: $ReadOnlyArray<MessageEdit>,
  id: number,
  is_me_message: boolean,
  last_edit_timestamp?: number,
  reactions: $ReadOnlyArray<Reaction>,

  /** Deprecated; a server implementation detail not useful in a client. */
  // recipient_id: number,

  sender_email: string,
  sender_full_name: string,
  sender_id: UserId,
  sender_realm_str: string,

  // Don't use. Likely removed everywhere in FL 26, but the changelog only
  // mentions GET /messages: https://zulip.com/api/changelog#changes-in-zulip-31
  // TODO(server-3.1): Remove.
  sender_short_name?: string,

  // stream_id handled on StreamMessage
  // subject handled on StreamMessage

  /** Servers <1.9.0 omit this; when omitted, equivalent to empty array. */
  // The doc is wrong to say this is (string)[]; see
  //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/.60.2Esubmessages.60.20on.20message.20objects/near/1389473
  // TODO(server-1.9): Make required.
  submessages?: $ReadOnlyArray<Submessage>,

  timestamp: number,

  // topic_links handled on StreamMessage
  // type handled on PmMessage and StreamMessage separately

  //
  // Special-case properties; see comments
  //

  /**
   * The `flags` story is a bit complicated:
   *  * Absent in `event.message` for a `message` event... but instead
   *    (confusingly) there is an `event.flags`.
   *  * Present under `EVENT_NEW_MESSAGE`.
   *  * Present under `MESSAGE_FETCH_COMPLETE`, and in the server `/message`
   *    response that action is based on.
   *  * Absent in the Redux `state.messages`; we move the information to a
   *    separate subtree `state.flags`.
   */
  flags?: $ReadOnlyArray<string>,

  /** Our own flag; if true, really type `Outbox`. */
  isOutbox?: false,

  /**
   * These don't appear in `message` events, but they appear in a `/message`
   * response when a search is involved.
   */
  match_content?: string,
  match_subject?: string,
|}>;

export type PmMessage = $ReadOnly<{|
  ...MessageBase,

  type: 'private',

  // Notes from studying the server code:
  //  * Notes are primarily from the server as of 2020-04 at cb85763c7, but
  //    this logic is very stable; confirmed all points about behavior as of
  //    1.8.0 (from 2018-04), too.
  //
  //  * This field is ultimately computed (for both events and /messages
  //    results) in MessageDict.hydrate_recipient_info, with most of the
  //    work done earlier, in bulk_fetch_display_recipients in
  //    zerver/lib/display_recipient.py.
  //
  //  * Ordering of users in the list:
  //    * For 1:1 PMs, sorted by email.  (Right in hydrate_recipient_info.)
  //    * For group PMs, sorted by user ID.  (In bulk_get_huddle_user_ids,
  //      invoked from bulk_fetch_display_recipients.)
  //    * If we were to write down an API guarantee here, we'd surely make
  //      it sorted by user ID; so, best not to assume current behavior.
  //
  /**
   * The set of all users in the thread.
   *
   * This lists the sender as well as all (other) recipients, and it
   * lists each user just once.  In particular the self-user is always
   * included.
   *
   * The ordering is less well specified; if it matters, sort first.
   */
  display_recipient: $ReadOnlyArray<PmRecipientUser>,

  /**
   * PMs have (as far as we know) always had the empty string at this
   * field. Though the doc warns that this might change if Zulip adds
   * support for topics in PMs; see
   *   https://chat.zulip.org/#narrow/stream/19-documentation/topic/.60subject.60.20on.20messages/near/1125819.
   */
  subject: '',
|}>;

export type StreamMessage = $ReadOnly<{|
  ...MessageBase,

  type: 'stream',

  /**
   * The stream name.
   *
   * Prefer `stream_id`; see #3918.
   */
  display_recipient: string,

  stream_id: number,

  /**
   * The topic.
   *
   * No stream message can be stored (and thus arrive on our doorstep)
   * with an empty-string subject:
   *   https://chat.zulip.org/#narrow/stream/19-documentation/topic/.60orig_subject.60.20in.20.60update_message.60.20events/near/1112709
   * (see point 4). We assume this has always been the case.
   */
  subject: string,

  // We don't actually use this property.  If and when we do, we'll probably
  // want in our internal model to canonicalize it to the newest form (with
  // the name topic_links rather than subject_links, and newest type.)
  // TODO(server-4.0): Changed in feat. 46 to array-of-objects shape, from $ReadOnlyArray<string>
  // TODO(server-3.0): New in FL 1, replacing subject_links.
  topic_links?: $ReadOnlyArray<{| +text: string, +url: string |}> | $ReadOnlyArray<string>,

  // TODO(server-3.0): Replaced in feat. 1 by topic_links
  subject_links?: $ReadOnlyArray<string>,
|}>;

/**
 * A Zulip message.
 *
 * This type is mainly intended to represent the data the server sends as
 * the `message` property of an event of type `message`.  Caveat lector: we
 * pass these around to a lot of places, and do a lot of further munging, so
 * this type may not quite represent that.  Any differences should
 * definitely be commented, and perhaps refactored.
 *
 * Major appearances of this type include
 *  * `message: Message` on a server event of type `message`, and our
 *    `EVENT_NEW_MESSAGE` Redux action for the event;
 *  * `messages: Message[]` in a `/messages` (our `getMessages`) response,
 *    and our resulting `MESSAGE_FETCH_COMPLETE` Redux action;
 *  * `messages: Map<number, Message>` in our global Redux state.
 *
 * See also `Outbox`, which is deliberately similar so that we can use
 * the type `Message | Outbox` in many places.
 *
 * See also `MessagesState` for discussion of how we fetch and store message
 * data.
 */
// Up-to-date with the `message` event doc to FL 132:
//   https://zulip.com/api/get-events#message
export type Message = PmMessage | StreamMessage;

//
//
//
// ===================================================================
// Summaries of messages and conversations.
//
//

/**
 * Whether and how an edit moving a message applies to others in its conversation.
 *
 * See:
 *   https://zulip.com/api/get-events#update_message
 *   https://zulip.com/api/update-message#parameter-propagate_mode
 */
export type PropagateMode = 'change_one' | 'change_later' | 'change_all';

/**
 * Describes a single recent PM conversation.
 *
 * See API documentation under `recent_private_conversations` at:
 *   https://chat.zulip.org/api/register-queue
 *
 * Note that `user_ids` does not contain the `user_id` of the current user.
 * Consequently, a user's conversation with themselves will be listed here
 * as [], which is unlike the behaviour found in some other parts of the
 * codebase.
 */
export type RecentPrivateConversation = $ReadOnly<{|
  max_message_id: number,
  // When received from the server, these are guaranteed to be sorted only after
  // 2.2-dev-53-g405a529340. To be safe, we always sort them on receipt.
  // TODO(server-3.0): Stop sorting these ourselves.  ("2.2" became 3.0.)
  user_ids: $ReadOnlyArray<UserId>,
|}>;
