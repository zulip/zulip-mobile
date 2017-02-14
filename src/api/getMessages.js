import { apiGet } from './apiFetch';

export default async (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Object,
  useFirstUnread: false,
) =>
  apiGet(
    auth,
    'messages',
    {
      anchor,
      num_before: numBefore,
      num_after: numAfter,
      narrow: JSON.stringify(narrow),
      apply_markdown: true,
      use_first_unread_anchor: useFirstUnread,
    },
    res => res.messages,
  );
