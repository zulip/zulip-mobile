/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default (
  auth: Account,
  messages: number[],
  op: string,
  flag: string,
): Promise<ApiResponse> =>
  apiPost(auth, 'messages/flags', res => res, { messages: JSON.stringify(messages), flag, op });
