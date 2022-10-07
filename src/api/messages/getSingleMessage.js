/* @flow strict-local */

import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Message } from '../apiTypes';
import { transformFetchedMessage, type FetchedMessage } from '../rawModelTypes';
import { apiGet } from '../apiFetch';
import { identityOfAuth } from '../../account/accountMisc';

// The actual response from the server.  We convert the message to a proper
// Message before returning it to application code.
type ServerApiResponseSingleMessage = {|
  ...$Exact<ApiResponseSuccess>,
  -raw_content: string, // deprecated

  // Until we narrow FetchedMessage into its FL 120+ form, FetchedMessage
  // will be a bit less precise than we could be here. That's because we
  // only get this field from servers FL 120+.
  // TODO(server-5.0): Make this field required, and remove FL-120 comment.
  +message?: FetchedMessage,
|};

/**
 * See https://zulip.com/api/get-message
 *
 * Throws an error if the message doesn't exist at all, or isn't visible to
 * our user.
 *
 * Otherwise, gives undefined on old servers (FL <120) where this API
 * endpoint doesn't return a `message` field.
 */
// TODO(server-5.0): Simplify FL-120 condition in jsdoc and implementation.
export default async (
  auth: Auth,
  args: {|
    +message_id: number,
  |},

  // TODO(#4659): Don't get this from callers.
  zulipFeatureLevel: number,

  // TODO(#4659): Don't get this from callers?
  allowEditHistory: boolean,
): Promise<Message | void> => {
  const { message_id } = args;
  const response: ServerApiResponseSingleMessage = await apiGet(auth, `messages/${message_id}`, {
    apply_markdown: true,
  });

  return (
    response.message
    && transformFetchedMessage<Message>(
      response.message,
      identityOfAuth(auth),
      zulipFeatureLevel,
      allowEditHistory,
    )
  );
};
