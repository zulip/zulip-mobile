/* @flow */
import type { Auth, Narrow } from '../../types';
import { apiGet } from '../apiFetch';

export default async (
  auth: Auth,
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean = false,
) =>
  apiGet(auth, 'messages', res => res.messages, {
    narrow: JSON.stringify(narrow),
    anchor,
    num_before: numBefore,
    num_after: numAfter,
    apply_markdown: true,
    use_first_unread_anchor: useFirstUnread,
  });
