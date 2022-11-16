// @flow strict-local
import type { ApiNarrow, UserMessageFlag } from '../modelTypes';
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

// TODO(server-3.0): Move `Anchor` to modelTypes and share with getMessages.
type Anchor = number | 'newest' | 'oldest' | 'first_unread';

type ApiResponseUpdateMessageFlagsForNarrow = {|
  ...$Exact<ApiResponseSuccess>,
  processed_count: number,
  updated_count: number,
  first_processed_id: number | null,
  last_processed_id: number | null,
  found_oldest: boolean,
  found_newest: boolean,
|};

/** https://zulip.com/api/update-message-flags-for-narrow */
export default function updateMessageFlagsForNarrow(
  auth: Auth,
  args: {|
    narrow: ApiNarrow,
    anchor: Anchor,
    include_anchor?: boolean,
    num_before: number,
    num_after: number,
    op: 'add' | 'remove',
    flag: UserMessageFlag,
  |},
): Promise<ApiResponseUpdateMessageFlagsForNarrow> {
  return apiPost(auth, '/messages/flags/narrow', { ...args, narrow: JSON.stringify(args.narrow) });
}
