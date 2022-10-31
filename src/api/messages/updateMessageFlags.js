/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import type { UserMessageFlag } from '../modelTypes';
import { apiPost } from '../apiFetch';

export type ApiResponseUpdateMessageFlags = {|
  ...$Exact<ApiResponseSuccess>,
  messages: $ReadOnlyArray<number>,
|};

/** https://zulip.com/api/update-message-flags */
export default (
  auth: Auth,
  messageIds: $ReadOnlyArray<number>,
  op: 'add' | 'remove',
  flag: UserMessageFlag,
): Promise<ApiResponseUpdateMessageFlags> =>
  apiPost(auth, 'messages/flags', { messages: JSON.stringify(messageIds), flag, op });
