import { apiPost } from './apiFetch';

export default async (auth, to: string | string[], op: 'start' | 'stop') => apiPost(
  auth,
  'typing',
  {
    to,
    op,
  },
  res => res.messages,
);
