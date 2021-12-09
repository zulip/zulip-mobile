/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export type ApiResponseMessagesFlags = {|
  ...$Exact<ApiResponseSuccess>,
  messages: number[],
|};

export default (
  auth: Auth,
  messages: $ReadOnlyArray<number>,
  op: string,
  flag: string,
): Promise<ApiResponseMessagesFlags> =>
  apiPost(auth, 'messages/flags', { messages: JSON.stringify(messages), flag, op });
