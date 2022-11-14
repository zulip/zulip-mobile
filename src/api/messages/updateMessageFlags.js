/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import type { UserMessageFlag } from '../modelTypes';
import { apiPost } from '../apiFetch';

export type ApiResponseUpdateMessageFlags = {|
  ...$Exact<ApiResponseSuccess>,

  // The `messages` property is deprecated.  See discussion:
  //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/mark-as-unread.20request/near/1463920
  -messages: $ReadOnlyArray<number>,
|};

/** https://zulip.com/api/update-message-flags */
export default (
  auth: Auth,
  messageIds: $ReadOnlyArray<number>,
  op: 'add' | 'remove',
  flag: UserMessageFlag,
): Promise<ApiResponseUpdateMessageFlags> =>
  apiPost(auth, 'messages/flags', { messages: JSON.stringify(messageIds), flag, op });
