/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Identity } from '../../types';
import type { Message, ApiNarrow } from '../apiTypes';
import type { PmMessage, StreamMessage, Reaction, UserId, MessageEdit } from '../modelTypes';
import { apiGet } from '../apiFetch';
import { identityOfAuth } from '../../account/accountMisc';
import { AvatarURL } from '../../utils/avatar';

type ApiResponseMessages = {|
  ...$Exact<ApiResponseSuccess>,
  anchor: number,
  found_anchor: boolean,
  found_newest: boolean,
  found_oldest: boolean,
  messages: $ReadOnlyArray<Message>,
|};

/**
 * The variant of `Reaction` found in the actual server response.
 *
 * Note that reaction events have a *different* variation; see their
 * handling in `eventToAction`.
 */
// We shouldn't have to rely on this format on servers at feature
// level 2+; those newer servers include a top-level `user_id` field
// in addition to the `user` object. See #4072.
// TODO(server-3.0): Simplify this away.
export type ServerReaction = $ReadOnly<{|
  ...$Diff<Reaction, {| user_id: mixed |}>,
  user: $ReadOnly<{|
    email: string,
    full_name: string,
    id: UserId,
  |}>,
|}>;

/**
 * The elements of Message.edit_history found in the actual server response.
 *
 * Accurate for supported servers before and after FL 118. For convenience,
 * we drop objects of this type if the FL is <118, so that the modern shape
 * at Message.edit_history is the only shape we store in Redux; see there.
 */
// TODO(server-5.0): Simplify this away.
export type ServerMessageEdit = $ReadOnly<{|
  prev_content?: string,
  prev_rendered_content?: string,
  prev_rendered_content_version?: number,
  prev_stream?: number,
  prev_topic?: string, // New in FL 118, replacing `prev_subject`.
  prev_subject?: string, // Replaced in FL 118 by `prev_topic`.
  stream?: number, // New in FL 118.
  timestamp: number,
  topic?: string, // New in FL 118.
  user_id: UserId | null,
|}>;

// How `ServerMessage` relates to `Message`, in a way that applies
// uniformly to `Message`'s subtypes.
type ServerMessageOf<M: Message> = $ReadOnly<{|
  ...$Exact<M>,
  avatar_url: string | null,
  reactions: $ReadOnlyArray<ServerReaction>,

  // Unlike Message['edit_history'], this can't be `null`.
  edit_history?: $ReadOnlyArray<ServerMessageEdit>,
|}>;

export type ServerMessage = ServerMessageOf<PmMessage> | ServerMessageOf<StreamMessage>;

// The actual response from the server.  We convert the data from this to
// `ApiResponseMessages` before returning it to application code.
type ServerApiResponseMessages = {|
  ...ApiResponseMessages,
  messages: $ReadOnlyArray<ServerMessage>,
|};

/** Exported for tests only. */
export const migrateMessages = (
  messages: $ReadOnlyArray<ServerMessage>,
  identity: Identity,
  zulipFeatureLevel: number,
  allowEditHistory: boolean,
): Message[] =>
  messages.map(<M: Message>(message: ServerMessageOf<M>): M => ({
    ...message,
    avatar_url: AvatarURL.fromUserOrBotData({
      rawAvatarUrl: message.avatar_url,
      email: message.sender_email,
      userId: message.sender_id,
      realm: identity.realm,
    }),
    reactions: message.reactions.map(reaction => {
      const { user, ...restReaction } = reaction;
      return {
        ...restReaction,
        user_id: user.id,
      };
    }),

    // Why condition on allowEditHistory? See MessageBase['edit_history'].
    // Why FL 118 condition? See MessageEdit type.
    edit_history:
      /* eslint-disable operator-linebreak */
      allowEditHistory && zulipFeatureLevel >= 118
        ? // $FlowIgnore[incompatible-cast] - See MessageEdit type
          (message.edit_history: $ReadOnlyArray<MessageEdit> | void)
        : null,
  }));

const migrateResponse = (response, identity: Identity, zulipFeatureLevel, allowEditHistory) => {
  const { messages, ...restResponse } = response;
  return {
    ...restResponse,
    messages: migrateMessages(messages, identity, zulipFeatureLevel, allowEditHistory),
  };
};

/**
 * See https://zulip.com/api/get-messages
 */
export default async (
  auth: Auth,
  args: {|
    narrow: ApiNarrow,
    anchor: number,
    numBefore: number,
    numAfter: number,
    useFirstUnread?: boolean,
  |},

  // TODO(#4659): Don't get this from callers.
  zulipFeatureLevel: number,

  // TODO(#4659): Don't get this from callers?
  allowEditHistory: boolean,
): Promise<ApiResponseMessages> => {
  const { narrow, anchor, numBefore, numAfter, useFirstUnread = false } = args;
  const response: ServerApiResponseMessages = await apiGet(auth, 'messages', {
    narrow: JSON.stringify(narrow),
    anchor,
    num_before: numBefore,
    num_after: numAfter,
    apply_markdown: true,
    use_first_unread_anchor: useFirstUnread,
    client_gravatar: true,
  });
  return migrateResponse(response, identityOfAuth(auth), zulipFeatureLevel, allowEditHistory);
};
