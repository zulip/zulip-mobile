import { apiPost, Auth } from './apiFetch';

export default async (
  auth: Auth,
  messages: number[],
  op: string,
  flag: string,
): number[] =>
  apiPost(
    auth,
    'messages/flags',
    { messages, flag, op },
    res => res.messages,
  );
