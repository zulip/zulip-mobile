/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Message, Narrow } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseMessages = {|
  ...ApiResponseSuccess,
  anchor: number,
  found_anchor?: boolean,
  found_newest?: boolean,
  found_oldest?: boolean,
  messages: Message[],
|};

/**
 * See https://zulipchat.com/api/get-messages
 *
 * These values exist only in Zulip 1.8 or newer:
 *   * found_anchor
 *   * found_newest
 *   * found_oldest
 */
export default async (
  auth: Auth,
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean = false,
): Promise<ApiResponseMessages> =>
  apiGet(auth, 'messages', {
    narrow: JSON.stringify(narrow),
    anchor,
    num_before: numBefore,
    num_after: numAfter,
    apply_markdown: true,
    use_first_unread_anchor: useFirstUnread,
  });
