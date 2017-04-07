import {apiPost} from './apiFetch';

export default async (
  auth,
  type: 'private' | 'stream',
  to: string | string[],
  subject: string,
  content: string
) =>
  apiPost(
    auth,
    'messages',
    {
      type,
      to,
      subject,
      content,
    },
    res => res.messages
  );
