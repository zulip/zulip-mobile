/**
 * Types for things in the Zulip data model, as seen in the API.
 *
 * @flow strict
 */

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
  // This prevents accidentally using this type as a map.
  // See https://github.com/facebook/flow/issues/4257#issuecomment-321951793
  [empty]: mixed,
|}>;

export type RealmEmojiById = $ReadOnly<{
  [id: string]: ImageEmojiType,
}>;

export type RealmFilter = [string, string, number];

//
//
//
// ===================================================================
// Users and data about them.
//
//

export type DevUser = {|
  realm_uri: string,
  email: string,
|};

/**
 * A Zulip user.
 *
 * For details on the properties, see the Zulip API docs:
 *   https://zulipchat.com/api/get-all-users#response
 */
export type User = {|
  avatar_url: string | null,
  bot_type?: number,
  bot_owner?: string,

  // date_joined included since commit 372e9740a (in 1.9.0)
  date_joined?: string,

  email: string,
  full_name: string,

  is_admin: boolean,
  is_bot: boolean,

  // is_guest included since commit d5df0377c (in 1.9.0); before that,
  // there's no such concept, so effectively it's implicitly false.
  is_guest?: boolean,

  // profile_data added in commit 02b845336 (in 1.8.0);
  // see also e3aed0f7b (in 2.0.0)
  profile_data?: empty, // TODO describe actual type

  timezone: string,
  user_id: number,
|};

export type CrossRealmBot = {|
  // avatar_url included since commit 58ee3fa8c (in 1.9.0)
  // TODO(crunchy): convert missing -> null
  avatar_url?: string | null,

  // date_joined included since commit 58ee3fa8c (in 1.9.0)
  date_joined?: string,

  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: true,
  user_id: number,

  // timezone included since commit 58ee3fa8c (in 1.9.0)
  timezone?: string,
|};

export type UserGroup = {|
  description: string,
  id: number,
  members: number[],
  name: string,
|};

/**
 * Specifies user status related properties
 * @prop away - present if we are to override user's presence status
 *   * This is the "user status" / "unavailable" feature added in early 2019.
 *     (At time of writing, there are no docs to link to.)
 * @prop status_text - a string representing information the user decided to
 *   manually set as their 'current status'
 */
export type UserStatus = {|
  away?: true,
  status_text?: string,
|};

export type UserStatusMapObject = {|
  [userId: number]: UserStatus,
|};

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
export type ClientPresence = {|
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
|};

/**
 * A user's presence status, including all information from all their clients.
 *
 * The `aggregated` property equals one of the others.  For details, see:
 *   https://zulipchat.com/api/get-presence
 *
 * See also the app's `getAggregatedPresence`, which reimplements a version
 * of the logic to compute `aggregated`.
 */
export type UserPresence = {|
  aggregated: ClientPresence,
  [client: string]: ClientPresence,
|};

//
//
//
// ===================================================================
// Streams, topics, and stuff about them.
//
//

export type Stream = {|
  stream_id: number,
  description: string,
  name: string,
  invite_only: boolean,
  is_announcement_only: boolean,
  history_public_to_subscribers: boolean,
|};

export type Subscription = {|
  ...$Exact<Stream>,
  color: string,
  in_home_view: boolean,
  pin_to_top: boolean,
  audible_notifications: boolean,
  desktop_notifications: boolean,
  email_address: string,
  push_notifications: boolean,
  is_old_stream: boolean,
  push_notifications: boolean,
  stream_weekly_traffic: number,
|};

export type Topic = {|
  name: string,
  max_id: number,
|};

//
//
//
// ===================================================================
// Narrows.
//
//

export type NarrowOperator =
  | 'is'
  | 'in'
  | 'near'
  | 'id'
  | 'stream'
  | 'topic'
  | 'sender'
  | 'pm-with'
  | 'search';

export type NarrowElement = $ReadOnly<{|
  operand: string,
  operator?: NarrowOperator, // TODO type: this shouldn't be absent.
|}>;

export type Narrow = $ReadOnlyArray<NarrowElement>;

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

/** An emoji reaction to a message. */
export type Reaction = $ReadOnly<{|
  user: $ReadOnly<{|
    email: string,
    full_name: string,
    user_id: number,
  |}>,
  emoji_name: string,
  reaction_type: ReactionType,

  /**
   * A string that uniquely identifies a particular emoji.
   *
   * The format varies with `reaction_type`, and can be subtle.
   * See the comment on Reaction.emoji_code here:
   *   https://github.com/zulip/zulip/blob/master/zerver/models.py
   */
  emoji_code: string,
|}>;

/**
 * "Snapshot" objects from https://zulipchat.com/api/get-message-history .
 *
 * See also `MessageEdit`.
 */
export type MessageSnapshot = $ReadOnly<{|
  user_id: number,
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
  user_id: number,
|}>;

/** A user, as seen in the `display_recipient` of a PM `Message`. */
export type PmRecipientUser = {|
  email: string,
  full_name: string,
  id: number,
  is_mirror_dummy: boolean,
  short_name: string,
|};

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
  sender_id: number,
  msg_type: 'widget', // only this type is currently available
  content: string, // JSON string
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
 *  * `messages: { [id]: Message }` in our global Redux state.
 *
 * References include:
 *  * the two example events at https://zulipchat.com/api/get-events-from-queue
 *  * `process_message_event` in zerver/tornado/event_queue.py; the call
 *    `client.add_event(user_event)` makes the final determination of what
 *    goes into the event, so `message_dict` is the final value of `message`
 *  * `MessageDict.wide_dict` and its helpers in zerver/lib/message.py;
 *    via `do_send_messages` in `zerver/lib/actions.py`, these supply most
 *    of the data ultimately handled by `process_message_event`
 *  * the `Message` and `AbstractMessage` models in zerver/models.py, but
 *    with caution; many fields are adjusted between the DB row and the event
 *  * empirical study looking at Redux events logged [to the
 *    console](docs/howto/debugging.md).
 *
 * See also `Outbox`.
 */
export type Message = $ReadOnly<{
  /** Our own flag; if true, really type `Outbox`. */
  isOutbox: false,

  /**
   * These don't appear in `message` events, but they appear in a `/message`
   * response when a search is involved.
   */
  match_content?: string,
  match_subject?: string,

  /** Obsolete? Gone in server commit 1.6.0~1758 . */
  sender_domain: string,

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

  /** The rest are believed to really appear in `message` events. */
  avatar_url: string | null,
  client: string,
  content: string,
  content_type: 'text/html' | 'text/markdown',
  display_recipient: $FlowFixMe, // `string` for type stream, else PmRecipientUser[].
  edit_history: $ReadOnlyArray<MessageEdit>,
  gravatar_hash: string,
  id: number,
  is_me_message: boolean,
  last_edit_timestamp?: number,
  reactions: $ReadOnlyArray<Reaction>,
  recipient_id: number,
  sender_email: string,
  sender_full_name: string,
  sender_id: number,
  sender_realm_str: string,
  sender_short_name: string,
  stream_id: number, // FixMe: actually only for type `stream`, else absent.
  subject: string,
  subject_links: $ReadOnlyArray<string>,

  /** Older servers omit this; when omitted, equivalent to empty array. */
  submessages?: $ReadOnlyArray<Submessage>,

  timestamp: number,
  type: 'stream' | 'private',
}>;
