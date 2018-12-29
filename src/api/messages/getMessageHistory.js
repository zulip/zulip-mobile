/* @flow strict-local */
import type { Auth, ApiResponseSuccess, MessageSnapshot } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseMessageHistory = {|
  ...ApiResponseSuccess,
  message_history: MessageSnapshot[],
|};

/** See https://zulipchat.com/api/get-message-history */
export default async (auth: Auth, messageId: number): Promise<ApiResponseMessageHistory> =>
  apiGet(auth, `messages/${messageId}/history`, res => res, {
    message_id: messageId,
  });
