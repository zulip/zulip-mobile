/**
 * Types for things in the Zulip data model, as seen in the API.
 *
 * @flow strict-local
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
 * A Zulip user, which might be a human or a bot, as found in one realm.
 *
 * This is a user object as found in properties `realm_users` and
 * `realm_non_active_users` of a `/register` response.
 *
 * For details on the properties, see the Zulip API docs on `/users`:
 *   https://zulipchat.com/api/get-all-users#response
 * which returns almost the same set of properties.
 *
 * See also the comments on `UserProfile` in the server (lineno is approx.):
 *   https://github.com/zulip/zulip/blob/master/zerver/models.py#L734
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
export type User = {|
  user_id: number,
  email: string,

  full_name: string,

  // date_joined included since commit 372e9740a (in 1.9.0)
  date_joined?: string,

  // is_active doesn't appear in `/register` responses -- instead,
  // users where is_active is true go in `realm_users`, and where false
  // go in `realm_non_active_users`.  Shrug.

  // is_admin corresponds to is_realm_admin in server code.
  is_admin: boolean,

  // is_guest included since commit d5df0377c (in 1.9.0); before that,
  // there's no such concept, so effectively it's implicitly false.
  is_guest?: boolean,

  // For background on the "*bot*" fields, see user docs on bots:
  //   https://zulipchat.com/help/add-a-bot-or-integration
  // Note that certain bots are represented by a different type entirely,
  // namely `CrossRealmBot`.
  is_bot: boolean,
  bot_type?: number,
  bot_owner?: string,

  // The ? is for future-proofing. Greg explains in 2020-02, at
  // https://github.com/zulip/zulip-mobile/pull/3789#discussion_r378554698, that
  // both human and bot Users will likely end up having a missing timezone
  // instead of an empty string.
  timezone?: string,

  // avatar_url is synthesized on the server by `get_avatar_field`.
  avatar_url: string | null,

  // profile_data added in commit 02b845336 (in 1.8.0);
  // see also e3aed0f7b (in 2.0.0)
  // (This one doesn't appear in `/users` responses.)
  profile_data?: empty, // TODO describe actual type
|};

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

  // The timezone field has been included since commit 58ee3fa8c (in 1.9.0). Tim
  // mentions in 2020-02, at
  // https://github.com/zulip/zulip-mobile/pull/3789#issuecomment-581218576,
  // that, as of the time of writing, it is always '' for bots, but it may be
  // omitted later to reduce payload sizes. So, we're future-proofing this field
  // by making it optional. See comment on the same field in User.
  timezone?: string,
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
 *   https://zulipchat.com/help/user-groups
 *
 * This feature is not related to group PMs.
 */
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
  is_old_stream: boolean,
  push_notifications: null | boolean,
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
  operator: NarrowOperator,
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

/**
 * An emoji reaction to a message.
 *
 * The raw JSON from the server may have a different structure, but we
 * normalize it to this form.
 */
export type Reaction = $ReadOnly<{|
  user_id: number,

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
  // These five fields (id, email, full_name, short_name, is_mirror_dummy)
  // have all been present since server commit 6b13f4a3c, in 2014.
  id: number,
  email: string,
  full_name: string,
  short_name: string,
  is_mirror_dummy: boolean,
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

  //
  // The rest are believed to really appear in `message` events.

  avatar_url: string | null,
  client: string,
  content: string,
  content_type: 'text/html' | 'text/markdown',
  edit_history: $ReadOnlyArray<MessageEdit>,
  gravatar_hash: string,
  id: number,
  is_me_message: boolean,
  last_edit_timestamp?: number,
  reactions: $ReadOnlyArray<Reaction>,
  sender_email: string,
  sender_full_name: string,
  sender_id: number,
  sender_realm_str: string,
  sender_short_name: string,

  /** Older servers omit this; when omitted, equivalent to empty array. */
  submessages?: $ReadOnlyArray<Submessage>,

  timestamp: number,

  //
  // Properties that behave differently for stream vs. private messages.

  type: 'stream' | 'private',

  // Notes from studying the server code:
  //  * Notes are primarily from the server as of 2020-04 at cb85763c7, but
  //    this logic is very stable; confirmed all points about behavior as of
  //    1.8.0, too.
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
   * The set of all users in the thread, for a PM; else the stream name.
   *
   * For a private message, this lists the sender as well as all (other)
   * recipients, and it lists each user just once.  In particular the
   * self-user is always included.
   *
   * The ordering is less well specified; if it matters, sort first.
   *
   * For stream messages, prefer `stream_id`; see #3918.
   */
  display_recipient: $FlowFixMe, // `string` for type stream, else PmRecipientUser[].

  /** Deprecated; a server implementation detail not useful in a client. */
  recipient_id: number,

  stream_id: number, // FixMe: actually only for type `stream`, else absent.

  subject: string,
  subject_links: $ReadOnlyArray<string>,

  /*
    This type is not exact. The server may have sent us arbitrary data, so it's
    not safe to {...spread} objects of this type.

    TODO: destructure and validate message data received from the Zulip server,
    transforming it into a normalized, exact `Message` type strictly for app-
    internal use. (See docs/architecture/crunchy-shell.md.)
  */

  ...
}>;
