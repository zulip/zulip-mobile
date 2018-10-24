/* @flow */
import type { PresenceState } from '../types';

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

export type DevUser = {
  realm_uri: string,
  email: string,
};

/**
 * An emoji reaction to a message, in minimal form.
 *
 * See also EventReaction, which carries additional properties computed from
 * these.
 */
export type SlimEventReaction = {
  emoji_name: string,
  user: any,
};

export type MessageEdit = {
  prev_content?: string,
  prev_rendered_content?: string,
  prev_rendered_content_version?: number,
  prev_subject?: string,
  timestamp: number,
  user_id: number,
};

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
export type Message = {
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
  flags?: string[],

  /** The rest are believed to really appear in `message` events. */
  avatar_url: ?string,
  client: string,
  content: string,
  content_type: 'text/html' | 'text/markdown',
  display_recipient: $FlowFixMe, // `string` for type stream, else PmRecipientUser[].
  edit_history: MessageEdit[],
  gravatar_hash: string,
  id: number,
  is_me_message: boolean,
  last_edit_timestamp?: number,
  reactions: SlimEventReaction[],
  recipient_id: number,
  sender_email: string,
  sender_full_name: string,
  sender_id: number,
  sender_realm_str: string,
  sender_short_name: string,
  stream_id: number, // FixMe: actually only for type `stream`, else absent.
  subject: string,
  subject_links: string[],
  submessages: Message[],
  timestamp: number,
  type: 'stream' | 'private',
};

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

export type NarrowElement = {
  operand: string,
  operator?: NarrowOperator, // TODO type: this shouldn't be absent.
};

export type Narrow = NarrowElement[];

export type RealmEmojiType = {
  author: {
    email: string,
    full_name: string,
    id: number,
  },
  deactivated: boolean,
  id: number,
  name: string,
  source_url: string,
  // This prevents accidentally using this type as a map.
  // See https://github.com/facebook/flow/issues/4257#issuecomment-321951793
  [any]: mixed,
};

export type RealmEmojiState = {
  [id: string]: RealmEmojiType,
};

export type RealmFilter = [string, string, number];

export type Stream = {
  stream_id: number,
  description: string,
  name: string,
  invite_only: boolean,
  is_announcement_only: boolean,
};

export type Subscription = Stream & {
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
};

export type Topic = {
  name: string,
  max_id: number,
};

/**
 * A Zulip user.
 *
 * For details on the properties, see the Zulip API docs:
 *   https://zulipchat.com/api/get-all-users#response
 */
export type User = {
  avatar_url: ?string,
  bot_type?: number,
  bot_owner?: string,
  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: boolean,
  profile_data?: Object,
  timezone: string,
  user_id: number,
};

export type ApiResponse = {
  result: string,
  msg: string,
};

export type ApiResponseSuccess = {
  result: 'success',
  msg: '',
};

/** List of error codes at https://github.com/zulip/zulip/blob/master/zerver/lib/exceptions.py */

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'REQUEST_VARIABLE_MISSING'
  | 'REQUEST_VARIABLE_INVALID'
  | 'BAD_IMAGE'
  | 'REALM_UPLOAD_QUOTA'
  | 'BAD_NARROW'
  | 'MISSING_HTTP_EVENT_HEADER'
  | 'STREAM_DOES_NOT_EXIST'
  | 'UNAUTHORIZED_PRINCIPAL'
  | 'UNEXPECTED_WEBHOOK_EVENT_TYPE'
  | 'BAD_EVENT_QUEUE_ID'
  | 'CSRF_FAILED'
  | 'INVITATION_FAILED'
  | 'INVALID_ZULIP_SERVER';

export type ApiResponseError = {
  code?: ApiErrorCode,
  msg: string,
  result: 'error',
};

export type ResponseExtractionFunc = (response: Object) => any;

export type ApiResponseWithPresence = ApiResponse & {
  server_timestamp: number,
  presences: PresenceState,
};

export type AuthenticationMethods = {
  dev: boolean,
  github: boolean,
  google: boolean,
  ldap: boolean,
  password: boolean,
  remoteuser: boolean,
};

export type ApiServerSettings = {
  authentication_methods: AuthenticationMethods,
  email_auth_enabled: boolean,
  msg: string,
  push_notifications_enabled: boolean,
  realm_description: string,
  realm_icon: string,
  realm_name: string,
  realm_uri: string,
  require_email_format_usernames: boolean,
  zulip_version: string,
};

export type TypingOperation = 'start' | 'stop';
