/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Identity } from '../../types';
import type { Message, ApiNarrow } from '../apiTypes';
import type { Reaction, UserId } from '../modelTypes';
import { apiGet } from '../apiFetch';
import { identityOfAuth } from '../../account/accountMisc';
import { AvatarURL } from '../../utils/avatar';

type ApiResponseMessages = {|
  ...ApiResponseSuccess,
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
export type ServerReaction = $ReadOnly<{|
  ...$Diff<Reaction, {| user_id: mixed |}>,
  user: $ReadOnly<{|
    email: string,
    full_name: string,
    id: UserId,
  |}>,
|}>;

export type ServerMessage = $ReadOnly<{|
  ...$Exact<Message>,
  avatar_url: string | null,
  reactions: $ReadOnlyArray<ServerReaction>,
|}>;

// The actual response from the server.  We convert the data from this to
// `ApiResponseMessages` before returning it to application code.
type ServerApiResponseMessages = {|
  ...ApiResponseMessages,
  messages: ServerMessage[],
|};

/** Exported for tests only. */
export const migrateMessages = (messages: ServerMessage[], identity: Identity): Message[] =>
  messages.map(message => {
    const { reactions, avatar_url: rawAvatarUrl, ...restMessage } = message;

    return {
      ...restMessage,
      avatar_url: AvatarURL.fromUserOrBotData({
        rawAvatarUrl,
        email: message.sender_email,
        userId: message.sender_id,
        realm: identity.realm,
      }),
      reactions: reactions.map(reaction => {
        const { user, ...restReaction } = reaction;
        return {
          ...restReaction,
          user_id: user.id,
        };
      }),
    };
  });

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
