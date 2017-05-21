/* @flow */
import { Auth, Narrow } from '../types';

import { apiGet } from './apiFetch';

export default async (
  auth: Auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Narrow,
  useFirstUnread: boolean = false,
) =>
  apiGet(
    auth,
    'messages',
    res => res.messages,
    {
      anchor,
      num_before: numBefore,
      num_after: numAfter,
      narrow: JSON.stringify(narrow),
      apply_markdown: true,
      use_first_unread_anchor: useFirstUnread,
    },
  );
