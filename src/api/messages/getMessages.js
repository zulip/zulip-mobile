/* @flow strict-local */
import type { Auth, Message, Narrow } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (
  auth: Auth,
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean = false,
  applyMarkdown: boolean = true,
): Promise<ApiResponseMessages> =>
  apiGet(auth, 'messages', {
    narrow: JSON.stringify(narrow),
    anchor,
    num_before: numBefore,
    num_after: numAfter,
    apply_markdown: true,
    use_first_unread_anchor: useFirstUnread,
  });
