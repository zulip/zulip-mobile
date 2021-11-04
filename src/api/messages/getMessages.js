/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Identity } from '../../types';
import type { Message, ApiNarrow } from '../apiTypes';
import type { PmMessage, StreamMessage, Reaction, UserId } from '../modelTypes';
import { apiGet } from '../apiFetch';
import { identityOfAuth } from '../../account/accountMisc';
import { AvatarURL } from '../../utils/avatar';

type ApiResponseMessages = {|
  ...$Exact<ApiResponseSuccess>,
  anchor: number,
  found_anchor?: boolean,
  found_newest?: boolean,
  found_oldest?: boolean,
  messages: Message[],
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

// How `ServerMessage` relates to `Message`, in a way that applies
// uniformly to `Message`'s subtypes.
type ServerMessageOf<M: Message> = $ReadOnly<{|
  ...$Exact<M>,
  avatar_url: string | null,
  reactions: $ReadOnlyArray<ServerReaction>,
|}>;

export type ServerMessage = ServerMessageOf<PmMessage> | ServerMessageOf<StreamMessage>;

// The actual response from the server.  We convert the data from this to
// `ApiResponseMessages` before returning it to application code.
type ServerApiResponseMessages = {|
  ...ApiResponseMessages,
  messages: ServerMessage[],
|};

/** Exported for tests only. */
export const migrateMessages = (
  messages: $ReadOnlyArray<ServerMessage>,
  identity: Identity,
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
  }));

const migrateResponse = (response, identity: Identity) => {
  const { messages, ...restResponse } = response;
  return {
    ...restResponse,
    messages: migrateMessages(messages, identity),
  };
};

/**
 * See https://zulip.com/api/get-messages
 *
 * These values exist only in Zulip 1.8 or newer:
 *   * found_anchor
 *   * found_newest
 *   * found_oldest
 */
// TODO(server-1.8): Mark those properties as required; simplify downstream.
export default async (
  auth: Auth,
  args: {|
    narrow: ApiNarrow,
    anchor: number,
    numBefore: number,
    numAfter: number,
    useFirstUnread?: boolean,
  |},
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
  return migrateResponse(response, identityOfAuth(auth));
};
