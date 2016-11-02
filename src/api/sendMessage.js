import { apiPost } from './apiFetch';

export default async (
  auth,
  type: 'private' | 'stream',
  content: string,
  to: string | string[],
  subject: string,
) =>
  apiPost(
    auth,
    'messages',
    {
      type,
      content,
      to,
      subject,
    },
    res => res.messages,
  );
