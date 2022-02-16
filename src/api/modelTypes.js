/**
 * Types for things in the Zulip data model, as seen in the API.
 *
 * @flow strict-local
 */

import type { AvatarURL } from '../utils/avatar';
import type { UserId } from './idTypes';

export type * from './idTypes';

//
//
//
// ===================================================================
// Data attached to the realm or the server.
//
//

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
 * `realm_non_active_users` of a `/register` response.
 *
 * For details on the properties, see the Zulip API docs on `/users`:
 *   https://zulip.com/api/get-users#response
 * which returns almost the same set of properties.
 *
 * See also the comments on `UserProfile` in the server (lineno is approx.):
 *   https://github.com/zulip/zulip/blob/main/zerver/models.py#L734
 * Most properties correspond to fields on `UserProfile`, and many are
 * described most usefully there.
 *
 * For authoritative results, consult how `raw_users`, and then
 * `realm_users` and `realm_non_active_users`, are computed in
 * `zulip/zulip:zerver/lib/events.py` .
 *
 * Properties are listed below in the order they appear on `UserProfile`,
 * because that's the most logically-organized and also the most helpful
 * of the references above.
 *
 * See also:
 *  * `CrossRealmBot` for another type of bot user, found in a
 *    different part of a `/register` response
 *  * `UserOrBot` for a convenience union of the two
 */
export type User = $ReadOnly<{|
  user_id: UserId,
  email: string,

  full_name: string,

  date_joined: string,

  // is_active doesn't appear in `/register` responses -- instead,
  // users where is_active is true go in `realm_users`, and where false
  // go in `realm_non_active_users`.  Shrug.

  // is_admin corresponds to is_realm_admin in server code.
  is_admin: boolean,

  // is_guest included since commit d5df0377c (in 1.9.0); before that,
  // there's no such concept, so effectively it's implicitly false.
  is_guest?: boolean,

  // For background on the "*bot*" fields, see user docs on bots:
  //   https://zulip.com/help/add-a-bot-or-integration
  // Note that certain bots are represented by a different type entirely,
  // namely `CrossRealmBot`.
  is_bot: boolean,
  bot_type?: number,
  bot_owner?: string,

  // The ? is for future-proofing. Greg explains in 2020-02, at
  // https://github.com/zulip/zulip-mobile/pull/3789#discussion_r378554698 ,
  // that both human and bot Users will likely end up having a missing
  // timezone instead of an empty string.
  timezone?: string,

  /**
   * Present under EVENT_USER_ADD, EVENT_USER_UPDATE (if change
   * indicated), under REGISTER_COMPLETE, and in `state.users`, all as an
   * AvatarURL, because we translate into that form at the edge.
   *
   * For how it appears at the edge (and how we translate) see
   * AvatarURL.fromUserOrBotData.
   */
  avatar_url: AvatarURL,

  // These properties appear in data from the server, but we ignore
  // them. If we add these, we should try to avoid `avatar_url`
  // falling out of sync with them.
  // avatar_source: mixed,
  // avatar_url_medium: mixed,
  // avatar_version: mixed,

  // profile_data added in commit 02b845336 (in 1.8.0);
  // see also e3aed0f7b (in 2.0.0)
  // (This one doesn't appear in `/users` responses.)
  profile_data?: empty, // When we need this, describe its actual type.
|}>;

/**
 * A "cross-realm bot", a bot user shared across the realms on a Zulip server.
 *
 * Cross-realm bots are used for a handful of bots defined in the Zulip
 * server code, like Welcome Bot.  They're found in the `cross_realm_bots`
 * property of a `/register` response, represented with this type.
 *
 * See also:
 *  * `User` and its property `is_bot`.  Bot users that appear in a single
 *    realm are, like human users, represented by a `User` value.
 *  * `UserOrBot`, a convenience union
 */
export type CrossRealmBot = $ReadOnly<{|
  /**
   * See note for this property on User.
   */
  avatar_url: AvatarURL,

  date_joined: string,
  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: true,
  user_id: UserId,

  // The ? is for future-proofing.  For bots it's always '':
  //   https://github.com/zulip/zulip-mobile/pull/3789#issuecomment-581218576
  // so a future version may omit it to reduce payload sizes.  See comment
  // on the same field in User.
  timezone?: string,
|}>;

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
 * Specifies user status related properties
 * @prop away - present if we are to override user's presence status
 *   * This is the "user status" / "unavailable" feature added in early 2019.
 *     (At time of writing, there are no docs to link to.)
 * @prop status_text - a string representing information the user decided to
 *   manually set as their 'current status'
 */
export type UserStatus = $ReadOnly<{|
  away?: true,
  status_text?: string,
|}>;

export type UserStatusMapObject = $ReadOnly<{|
  // TODO(flow): The key here is really UserId, not just any number; but
  //   this Flow bug:
  //     https://github.com/facebook/flow/issues/5407
  //   means that doesn't work right, and the best workaround is to
  //   leave it as `number`.
  [userId: number]: UserStatus,
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

export type Stream = $ReadOnly<{|
  stream_id: number,
  description: string,
  name: string,
  invite_only: boolean,
  is_announcement_only: boolean,
  // TODO(server-2.1): is_web_public was added in Zulip version 2.1;
  //   absence implies the stream is not web-public.
  is_web_public?: boolean,
  history_public_to_subscribers: boolean,
|}>;

export type Subscription = {|
  ...$ReadOnly<$Exact<Stream>>,
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
 // TODO(server-2.1): Stop sending stream names or user emails here.
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
  prev_subject?: string,
  timestamp: number,
  user_id: UserId,
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
  /** Our own flag; if true, really type `Outbox`. */
  isOutbox: false,

  /**
   * These don't appear in `message` events, but they appear in a `/message`
   * response when a search is involved.
   */
  match_content?: string,
  match_subject?: string,

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

  /**
   * Present under EVENT_NEW_MESSAGE and under MESSAGE_FETCH_COMPLETE,
   * and in `state.messages`, all as an AvatarURL, because we
   * translate into that form at the edge.
   *
   * For how it appears at the edge (and how we translate) see
   * AvatarURL.fromUserOrBotData.
   */
  avatar_url: AvatarURL,

  // The rest are believed to really appear in `message` events.

  client: string,
  content: string,
  content_type: 'text/html',
  edit_history: $ReadOnlyArray<MessageEdit>,
  gravatar_hash: string,
  id: number,
  is_me_message: boolean,
  last_edit_timestamp?: number,
  reactions: $ReadOnlyArray<Reaction>,
  sender_email: string,
  sender_full_name: string,
  sender_id: UserId,
  sender_realm_str: string,
  sender_short_name: string,

  /** Older servers omit this; when omitted, equivalent to empty array. */
  submessages?: $ReadOnlyArray<Submessage>,

  timestamp: number,

  /** Deprecated; a server implementation detail not useful in a client. */
  // recipient_id: number,
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
  subject_links: $ReadOnlyArray<string>,
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
 * The server's behavior here is undocumented and the source is very
 * complex; this is naturally a place where a large fraction of all the
 * features of Zulip have to appear.
 *
 * Major appearances of this type include
 *  * `message: Message` on a server event of type `message`, and our
 *    `EVENT_NEW_MESSAGE` Redux action for the event;
 *  * `messages: Message[]` in a `/messages` (our `getMessages`) response,
 *    and our resulting `MESSAGE_FETCH_COMPLETE` Redux action;
 *  * `messages: Map<number, Message>` in our global Redux state.
 *
 * References include:
 *  * the two example events at https://zulip.com/api/get-events
 *  * `process_message_event` in zerver/tornado/event_queue.py; the call
 *    `client.add_event(user_event)` makes the final determination of what
 *    goes into the event, so `message_dict` is the final value of `message`
 *  * `MessageDict.wide_dict` and its helpers in zerver/lib/message.py;
 *    via `do_send_messages` in `zerver/lib/actions.py`, these supply most
 *    of the data ultimately handled by `process_message_event`
 *  * `messages_for_ids` and its helpers in zerver/lib/message.py; via
 *    `get_messages_backend`, these supply the data ultimately returned by
 *    `/messages`
 *  * the `Message` and `AbstractMessage` models in zerver/models.py, but
 *    with caution; many fields are adjusted between the DB row and the event
 *  * empirical study looking at Redux events logged [to the
 *    console](docs/howto/debugging.md).
 *
 * See also `Outbox`, which is deliberately similar so that we can use
 * the type `Message | Outbox` in many places.
 *
 * See also `MessagesState` for discussion of how we fetch and store message
 * data.
 */
export type Message = PmMessage | StreamMessage;

//
//
//
// ===================================================================
// Summaries of messages and conversations.
//
//

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
