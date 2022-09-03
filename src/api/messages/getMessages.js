/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Identity } from '../../types';
import type { Message, ApiNarrow } from '../apiTypes';
import { transformFetchedMessage, type FetchedMessage } from '../rawModelTypes';
import { apiGet } from '../apiFetch';
import { identityOfAuth } from '../../account/accountMisc';

type ApiResponseMessages = {|
  ...$Exact<ApiResponseSuccess>,
  anchor: number,
  found_anchor: boolean,
  found_newest: boolean,
  found_oldest: boolean,
  messages: $ReadOnlyArray<Message>,
|};

// The actual response from the server.  We convert the data from this to
// `ApiResponseMessages` before returning it to application code.
type ServerApiResponseMessages = {|
  ...ApiResponseMessages,
  messages: $ReadOnlyArray<FetchedMessage>,
|};

const migrateResponse = (response, identity: Identity, zulipFeatureLevel, allowEditHistory) => {
  const { messages, ...restResponse } = response;
  return {
    ...restResponse,
    messages: messages.map(message =>
      transformFetchedMessage<Message>(message, identity, zulipFeatureLevel, allowEditHistory),
    ),
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
