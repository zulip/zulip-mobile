/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { MessageSnapshot } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseMessageHistory = {|
  ...$Exact<ApiResponseSuccess>,
  message_history: $ReadOnlyArray<MessageSnapshot>,
|};

/** See https://zulip.com/api/get-message-history */
export default async (auth: Auth, messageId: number): Promise<ApiResponseMessageHistory> =>
  apiGet(auth, `messages/${messageId}/history`, {
    message_id: messageId,
  });
