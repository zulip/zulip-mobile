/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import type { UserMessageFlag } from '../modelTypes';
import { apiPost } from '../apiFetch';

export type ApiResponseMessagesFlags = {|
  ...$Exact<ApiResponseSuccess>,
  messages: $ReadOnlyArray<number>,
|};

export default (
  auth: Auth,
  messages: $ReadOnlyArray<number>,
  op: string,
  flag: UserMessageFlag,
): Promise<ApiResponseMessagesFlags> =>
  apiPost(auth, 'messages/flags', { messages: JSON.stringify(messages), flag, op });
