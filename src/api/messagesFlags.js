import {apiPost, Auth} from './apiFetch';

export default (
  auth: Auth,
  messages: number[],
  op: string,
  flag: string
): number[] =>
  apiPost(
    auth,
    'messages/flags',
    {messages: JSON.stringify(messages), flag, op},
    res => res
  );
