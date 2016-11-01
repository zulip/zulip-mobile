import { apiGet } from './apiFetch';

export default async (
  auth,
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Object,
) =>
  apiGet(
    auth,
    'messages',
    {
      anchor,
      num_before: numBefore,
      num_after: numAfter,
      narrow: JSON.stringify(narrow),
    },
    res => res.messages,
  );
