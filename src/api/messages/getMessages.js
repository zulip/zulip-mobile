/* @flow */
import type { Account, Message, Narrow } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (
  account: Account,
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean = false,
): Promise<Message[]> =>
  apiGet(account, 'messages', res => res.messages, {
    narrow: JSON.stringify(narrow),
    anchor,
    num_before: numBefore,
    num_after: numAfter,
    apply_markdown: true,
    use_first_unread_anchor: useFirstUnread,
  });
